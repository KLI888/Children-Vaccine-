-- Children Vaccine Mentor: Initial PostgreSQL Database Schema for Supabase
-- Target: Supabase Postgres with Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES (Parent / Guardian)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'mr')),
    timezone TEXT DEFAULT 'Asia/Kolkata',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    enable_seven_day BOOLEAN DEFAULT TRUE,
    enable_three_day BOOLEAN DEFAULT TRUE,
    enable_same_day BOOLEAN DEFAULT TRUE,
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT FALSE,
    preferred_delivery_time TIME DEFAULT '09:00:00',
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'mr')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PUSH SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHILDREN PROFILES
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    birth_weight_kg NUMERIC(4,2),
    birth_height_cm NUMERIC(4,1),
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SCHEDULE VERSIONS
CREATE TABLE IF NOT EXISTS public.schedule_versions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_organization TEXT NOT NULL,
    source_url TEXT,
    published_date DATE,
    reviewed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VACCINE DEFINITIONS
CREATE TABLE IF NOT EXISTS public.vaccine_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    marathi_name TEXT,
    short_code TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('uip_mandatory', 'uip_regional', 'iap_optional')),
    diseases_prevented TEXT NOT NULL,
    marathi_diseases_prevented TEXT,
    description TEXT,
    marathi_description TEXT,
    common_reactions TEXT,
    marathi_common_reactions TEXT,
    warning_signs TEXT,
    marathi_warning_signs TEXT,
    route_and_site TEXT,
    source_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCHEDULE RULES
CREATE TABLE IF NOT EXISTS public.schedule_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_version_id TEXT NOT NULL REFERENCES public.schedule_versions(id) ON DELETE CASCADE,
    vaccine_id TEXT NOT NULL REFERENCES public.vaccine_definitions(id) ON DELETE CASCADE,
    dose_number INT NOT NULL,
    dose_label TEXT NOT NULL,
    offset_days INT NOT NULL, -- Days from date of birth (e.g. 0 for birth, 42 for 6 weeks, 70 for 10 weeks)
    recommended_age_text TEXT NOT NULL,
    marathi_recommended_age_text TEXT,
    min_interval_days_from_prev INT DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CHILD VACCINATIONS
CREATE TABLE IF NOT EXISTS public.child_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    vaccine_id TEXT NOT NULL REFERENCES public.vaccine_definitions(id) ON DELETE RESTRICT,
    dose_number INT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'due_today', 'overdue', 'completed', 'review_needed', 'skipped')),
    administered_date DATE,
    administered_facility TEXT,
    batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, vaccine_id, dose_number)
);

-- 10. REMINDERS (Three-Stage Reminder System)
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    vaccination_id UUID NOT NULL REFERENCES public.child_vaccinations(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('seven_day', 'three_day', 'same_day')),
    trigger_date DATE NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'cancelled', 'skipped_past')),
    title_en TEXT NOT NULL,
    title_mr TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_mr TEXT NOT NULL,
    delivery_channel TEXT DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'push', 'email', 'all')),
    delivered_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. GROWTH RECORDS (WHO Standards)
CREATE TABLE IF NOT EXISTS public.growth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    weight_kg NUMERIC(4,2) NOT NULL,
    height_cm NUMERIC(4,1),
    head_circumference_cm NUMERIC(4,1),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. POST-VACCINATION SYMPTOM RECORDS
CREATE TABLE IF NOT EXISTS public.symptom_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    vaccination_id UUID REFERENCES public.child_vaccinations(id) ON DELETE SET NULL,
    onset_timestamp TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(3,1),
    temperature_f NUMERIC(4,1),
    symptoms_observed TEXT[] NOT NULL DEFAULT '{}',
    duration_hours INT,
    notes TEXT,
    action_taken TEXT,
    consulted_doctor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATION DELIVERY LOGS
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    response_payload JSONB,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_children_parent ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_vaccinations_child ON public.child_vaccinations(child_id);
CREATE INDEX IF NOT EXISTS idx_child_vaccinations_due_date ON public.child_vaccinations(due_date);
CREATE INDEX IF NOT EXISTS idx_child_vaccinations_status ON public.child_vaccinations(status);
CREATE INDEX IF NOT EXISTS idx_reminders_trigger_date ON public.reminders(trigger_date, status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON public.reminders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_records_child ON public.growth_records(child_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_symptom_records_child ON public.symptom_records(child_id, onset_timestamp);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_rules ENABLE ROW LEVEL SECURITY;

-- Public reference tables (read-only for all authenticated users)
CREATE POLICY "Public schedule_versions can be viewed by all"
    ON public.schedule_versions FOR SELECT USING (true);

CREATE POLICY "Public vaccine_definitions can be viewed by all"
    ON public.vaccine_definitions FOR SELECT USING (true);

CREATE POLICY "Public schedule_rules can be viewed by all"
    ON public.schedule_rules FOR SELECT USING (true);

-- User-isolated policies
CREATE POLICY "Users can view and edit own profile"
    ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own notification preferences"
    ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own push subscriptions"
    ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view and manage their children"
    ON public.children FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Users can manage child vaccinations through child ownership"
    ON public.child_vaccinations FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = child_vaccinations.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own reminders"
    ON public.reminders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage growth records through child ownership"
    ON public.growth_records FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = growth_records.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage symptom records through child ownership"
    ON public.symptom_records FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.children
            WHERE children.id = symptom_records.child_id
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "Users can view delivery logs for their reminders"
    ON public.notification_delivery_logs FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.reminders
            WHERE reminders.id = notification_delivery_logs.reminder_id
            AND reminders.user_id = auth.uid()
        )
    );
