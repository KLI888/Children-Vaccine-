import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Children Vaccine Mentor — Child Vaccination & Parental Health Companion',
  description:
    'Child vaccination management, parental health record, three-stage reminders (-7d, -3d, Day 0), growth tracker, and post-vaccination symptom monitoring application for parents in India.',
  openGraph: {
    title: 'Children Vaccine Mentor',
    description:
      'Child vaccination management, parental health record, three-stage reminders, and symptom monitoring for parents in India.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Children Vaccine Mentor',
    description:
      'Child vaccination management, parental health record, three-stage reminders, and symptom monitoring for parents in India.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased min-h-screen bg-[#FBFBFA]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
