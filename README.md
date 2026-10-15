# Children Vaccine Mentor

A mobile-friendly childhood immunization tracker for parents and guardians in India, with a focus on routine vaccination scheduling, growth tracking, symptom monitoring, and reminder management.

This project is built with Next.js and TypeScript and runs as a local-first web app for tracking a child's health journey from infancy through early childhood.

## Overview

Children Vaccine Mentor helps families:

- track child vaccination schedules and dose completion
- understand upcoming due dates and overdue vaccines
- receive staged reminders before and on the vaccination day
- monitor height and weight against WHO growth standards
- log post-vaccination symptoms and fever observations
- view bilingual information in English and Marathi
- keep records in the browser using local storage for a simple demo experience

## Key Features

### Vaccination management
- child profile creation and per-child vaccine tracking
- support for immunization schedule data relevant to India
- due date, completion, and overdue status tracking
- searchable vaccine library and dose information
- printable immunization card for quick reference

### Reminder engine
- 3-stage reminder workflow: 7 days before, 3 days before, and vaccination day
- reminder scheduling tied to child-specific due dates
- automatic recalculation when due dates are updated
- local browser alerts and test notification support

### Growth tracking
- weight and height entries over time
- visual comparison with WHO growth reference data
- simple charting to monitor child growth trends

### Symptom logging
- record temperature, reactions, observation notes, and follow-up actions
- track fever and reaction duration
- helpful guidance for identifying concerning post-vaccination symptoms

### App experience
- responsive dashboard for mobile and desktop use
- bilingual English/Marathi interface
- admin/demo console for managing data and notification behaviors
- local-only storage model for a lightweight standalone app

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- date-fns
- lucide-react
- localStorage-based state persistence

## Project Structure

```text
.
├── app/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdminPanelView.tsx
│   ├── AuthModal.tsx
│   ├── CalendarView.tsx
│   ├── ChildrenView.tsx
│   ├── DashboardView.tsx
│   ├── GrowthTrackerView.tsx
│   ├── Navbar.tsx
│   ├── NotificationModal.tsx
│   ├── RemindersView.tsx
│   ├── SettingsView.tsx
│   ├── Sidebar.tsx
│   ├── SymptomTrackerView.tsx
│   └── VaccineLibraryView.tsx
├── lib/
│   ├── growth-standards.ts
│   ├── i18n.ts
│   ├── store.tsx
│   ├── types.ts
│   └── vaccine-data.ts
├── supabase/
│   └── migrations/
├── tests/
│   └── vaccination-engine.test.ts
├── HEALTHCARE_RESEARCH.md
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── metadata.json
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
```

### Production server

```bash
npm run start
```

### Run tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Notes

- This application is designed as a local demo and personal health management tool.
- Data is stored in the browser using localStorage, so it is available only on the current device/browser profile.
- Browser notification support depends on browser permissions and device capabilities.
- The project is intended for educational and personal planning use and should not replace qualified medical advice.

## Clinical Disclaimer

Children Vaccine Mentor is a supportive health-planning tool for parents and guardians. It is not a replacement for medical consultation, diagnosis, or treatment by a qualified pediatrician or healthcare professional. Always seek professional medical guidance for concerns around vaccination, fever, adverse reactions, or any child's health condition.