# Children Vaccine Mentor 🛡️
### Child Vaccination Management & Parental Health Companion (India & Maharashtra)

Children Vaccine Mentor is a local-first, mobile-responsive healthcare web application designed for parents and guardians of children aged 0 to 5 years in India, especially Maharashtra. It helps families maintain vaccination records, understand upcoming immunization milestones, manage a three-stage reminder schedule, track physical growth against WHO standards, and monitor post-vaccination symptoms.

---

## 🌟 Key Features

1. **Indian National Immunization Schedule (UIP & IAP):**
   - Grounded in official **Ministry of Health and Family Welfare (MoHFW)**, **National Health Mission (NHM)**, and **Indian Academy of Pediatrics (IAP)** guidelines.
   - Covers birth doses (BCG, Hep B-0, OPV-0), 6/10/14-week primary series (Pentavalent, fIPV, Rotavirus, PCV), 9–12 month series (MR-1, PCV Booster, Vit A, fIPV-3), 16–24 month boosters (MR-2, DPT Booster-1, OPV Booster), and 5–6 year booster (DPT Booster-2).
   - Clear distinction between mandatory public-health UIP vaccines and optional private-practice vaccines (Typhoid Conjugate, Hep A, Varicella).

2. **Three-Stage Reminder Schedule:**
   - **Stage 1 (7 Days Before / -7d):** Helps parents plan clinic visits and transport.
   - **Stage 2 (3 Days Before / -3d):** Prompts parents to confirm PHC/clinic availability and timings.
   - **Stage 3 (Day 0 / Vaccination Day):** Highlights the scheduled vaccination day in the app.
   - **Zero Duplicate Deliveries:** Deterministic idempotency keys (`rem_{childId}_{vaccineId}_{dose}_{stage}_{dueDate}`).
   - **Anti-Spam Skipping:** Past trigger dates are safely marked as `skipped_past` rather than back-spammed.
   - **Automatic Cancellation:** Marking a dose completed immediately cancels all pending future reminders.
   - **Rescheduling:** Updating a scheduled due date recalculates all three trigger dates seamlessly.

3. **Bilingual Localization (English & Marathi / मराठी):**
   - Full English and Unicode-safe Marathi translations across all navigations, dashboards, forms, buttons, vaccine libraries, reminders, and alerts.
   - Instant language switcher with state persistence.

4. **Interactive Vaccination Calendar:**
   - Agenda list and full month grid views with status filters (Upcoming, Completed, Due Today, Overdue).
   - Detailed dose inspectors showing official administration routes, dosage amounts, and batch numbers.

5. **WHO Child Growth Tracker:**
   - Tracks weight (kg) and height (cm) from birth to 5 years.
   - Interactive Recharts visualization comparing child measurements with WHO Child Growth Standards (Median, +2SD, -2SD).
   - Historical change tracking with pediatric safety disclaimers.

6. **Post-Vaccination Symptom & Fever Log:**
   - Logs temperature in °F and °C, observed reactions (fever, swelling, fussiness), duration in hours, actions taken, and doctor consultations.
   - Medically reviewed safety red-flags box guiding parents when to seek immediate emergency care (>102°F fever, crying >3h, convulsions, breathing difficulty).

7. **Local Accounts & Records:**
   - Parent accounts, child profiles, vaccination records, reminders, growth, and symptom logs are saved in browser localStorage.
   - Data is available only in the current browser profile and is not synchronized or backed up automatically.

8. **Local Notifications:**
   - In-app alerts, browser notifications, and audio chimes run on the current device while the app is open.
   - No remote push or scheduled server delivery is configured.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15+ (App Router) with TypeScript
- **Styling:** Tailwind CSS (v4) with deep-teal healthcare aesthetic
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Date Handling:** `date-fns`
- **Storage / Auth:** Browser localStorage with local demonstration accounts
- **Notifications:** In-app reminders and browser Notification API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or Node.js 20+
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
No environment variables are required for local accounts, records, reminders, or notifications. Optional AI features may use `GEMINI_API_KEY`.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Test Suite
```bash
npm test
```
Executes tests covering calendar calculations, leap-year transitions, 3-stage reminder generators, idempotency keys, and bilingual string formatting.

---

## 📁 Repository Structure

```
├── app/
│   ├── globals.css                         # Tailwind CSS imports
│   ├── layout.tsx                          # Root layout with AppProvider
│   └── page.tsx                            # Primary application hub & tab routing
├── components/
│   ├── AuthModal.tsx                       # Sign-in, sign-up & demo mode modal
│   ├── CalendarView.tsx                    # Month & Agenda vaccination calendar
│   ├── ChildrenView.tsx                    # Child profiles management & age engine
│   ├── DashboardView.tsx                   # Main KPI home dashboard & countdowns
│   ├── GrowthTrackerView.tsx               # WHO growth charts & measurement logs
│   ├── MobileNav.tsx                       # Mobile bottom navigation bar
│   ├── Navbar.tsx                          # Top navigation, language & notifications
│   ├── NotificationModal.tsx               # In-app 3-stage notification drawer
│   ├── RecordVaccinationModal.tsx          # Vaccination completion modal
│   ├── EditDueDateModal.tsx                # Due-date editing & rescheduling modal
│   ├── AddChildModal.tsx                   # New child registration modal
│   ├── AddGrowthModal.tsx                  # Growth record logger modal
│   ├── AddSymptomModal.tsx                 # Post-vaccination symptom logger modal
│   ├── RemindersView.tsx                   # Three-stage reminder center
│   ├── SettingsView.tsx                    # Preferences, delivery times & export
│   ├── Sidebar.tsx                         # Desktop collapsible sidebar navigation
│   └── VaccineLibraryView.tsx              # Searchable UIP & IAP vaccine library
├── lib/
│   ├── growth-standards.ts                 # WHO 2006 Child Growth reference tables
│   ├── i18n.ts                             # English & Marathi translation dictionary
│   ├── store.tsx                           # Global state management & persistence
│   ├── types.ts                            # Domain TypeScript definitions
│   └── vaccine-data.ts                     # UIP vaccine definitions & 3-stage engine
├── tests/
│   └── vaccination-engine.test.ts          # Automated healthcare test suite
├── HEALTHCARE_RESEARCH.md                  # MoHFW, UIP & IAP clinical research summary
└── README.md                               # Project documentation & deployment guide
```

---

## 🏥 Clinical Disclaimer

Children Vaccine Mentor is an educational and personal health record management tool designed to assist parents in staying informed regarding the routine immunization timetable. It is **not** a replacement for clinical consultation with a qualified pediatrician, medical officer, or authorized Primary Health Centre (PHC) staff. Always seek professional healthcare evaluation for medical emergencies, persistent high fever, or adverse reactions following immunization.
