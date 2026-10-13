'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { DashboardView } from '@/components/DashboardView';
import { CalendarView } from '@/components/CalendarView';
import { RemindersView } from '@/components/RemindersView';
import { ChildrenView } from '@/components/ChildrenView';
import { GrowthTrackerView } from '@/components/GrowthTrackerView';
import { SymptomTrackerView } from '@/components/SymptomTrackerView';
import { VaccineLibraryView } from '@/components/VaccineLibraryView';
import { SettingsView } from '@/components/SettingsView';
import { AdminPanelView } from '@/components/AdminPanelView';
import { ExaminerNotificationSimulator } from '@/components/ExaminerNotificationSimulator';
import { NotificationModal } from '@/components/NotificationModal';
import { RecordVaccinationModal } from '@/components/RecordVaccinationModal';
import { EditDueDateModal } from '@/components/EditDueDateModal';
import { AddChildModal } from '@/components/AddChildModal';
import { AddGrowthModal } from '@/components/AddGrowthModal';
import { AddSymptomModal } from '@/components/AddSymptomModal';
import { AuthModal } from '@/components/AuthModal';
import { OverdueCatchUpModal } from '@/components/OverdueCatchUpModal';
import { PrintableImmunizationCardModal } from '@/components/PrintableImmunizationCardModal';
import { registerServiceWorker } from '@/lib/push-notifications';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddGrowthModal, setShowAddGrowthModal] = useState(false);
  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false);
  const [showPrintCardModal, setShowPrintCardModal] = useState(false);
  const [recordVaxId, setRecordVaxId] = useState<string | null>(null);
  const [editDueDateVaxId, setEditDueDateVaxId] = useState<string | null>(null);
  const [overdueCatchUpVaxId, setOverdueCatchUpVaxId] = useState<string | null>(null);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic View Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenRecordModal={(vaxId) => setRecordVaxId(vaxId || null)}
              onOpenAddChild={() => setShowAddChildModal(true)}
              onOpenAddGrowth={() => setShowAddGrowthModal(true)}
              onOpenAddSymptom={() => setShowAddSymptomModal(true)}
              onOpenOverdueCatchUp={(vaxId) => setOverdueCatchUpVaxId(vaxId)}
              onOpenPrintCard={() => setShowPrintCardModal(true)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onOpenRecordModal={(vaxId) => setRecordVaxId(vaxId)}
              onOpenEditDueDateModal={(vaxId) => setEditDueDateVaxId(vaxId)}
            />
          )}

          {activeTab === 'reminders' && <RemindersView />}

          {activeTab === 'children' && (
            <ChildrenView onOpenAddChild={() => setShowAddChildModal(true)} />
          )}

          {activeTab === 'growth' && (
            <GrowthTrackerView onOpenAddGrowth={() => setShowAddGrowthModal(true)} />
          )}

          {activeTab === 'symptoms' && (
            <SymptomTrackerView onOpenAddSymptom={() => setShowAddSymptomModal(true)} />
          )}

          {activeTab === 'library' && <VaccineLibraryView />}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'admin' && <AdminPanelView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Dialogs */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
      />

      <AddGrowthModal
        isOpen={showAddGrowthModal}
        onClose={() => setShowAddGrowthModal(false)}
      />

      <AddSymptomModal
        isOpen={showAddSymptomModal}
        onClose={() => setShowAddSymptomModal(false)}
      />

      {recordVaxId !== null && (
        <RecordVaccinationModal
          vaccinationId={recordVaxId}
          onClose={() => setRecordVaxId(null)}
        />
      )}

      {editDueDateVaxId !== null && (
        <EditDueDateModal
          vaccinationId={editDueDateVaxId}
          onClose={() => setEditDueDateVaxId(null)}
        />
      )}

      {overdueCatchUpVaxId !== null && (
        <OverdueCatchUpModal
          vaccinationId={overdueCatchUpVaxId}
          onClose={() => setOverdueCatchUpVaxId(null)}
          onOpenRecord={(vaxId) => setRecordVaxId(vaxId)}
          onOpenReschedule={(vaxId) => setEditDueDateVaxId(vaxId)}
        />
      )}

      <PrintableImmunizationCardModal
        isOpen={showPrintCardModal}
        onClose={() => setShowPrintCardModal(false)}
      />

      {/* Live Notification Simulator for Teacher / Examiner */}
      <ExaminerNotificationSimulator />
    </div>
  );
}
