import React, { useState } from 'react';
import { Footer } from './components/Footer.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { MemberProfileModal } from './components/MemberProfileModal.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ReunionEvent } from './types/index.ts';
import { AdminView } from './views/AdminView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { DirectoryView } from './views/DirectoryView.tsx';
import { EventsView } from './views/EventsView.tsx';
import { GalleryView } from './views/GalleryView.tsx';
import { HomeView } from './views/HomeView.tsx';
import { NoticesView } from './views/NoticesView.tsx';

function MainLayout() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [activePaymentEvent, setActivePaymentEvent] = useState<ReunionEvent | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const handleOpenPayment = (event: ReunionEvent) => {
    setActivePaymentEvent(event);
    setIsPaymentOpen(true);
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onSelectMember={(m) => setSelectedMember(m)}
          />
        )}

        {currentTab === 'about' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">
                Our School & Our Batch
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#002147]">
                Border Guard Public School, Cox's Bazar
              </h1>
              <p className="text-base text-slate-600 font-serif italic">
                SSC Batch 2023 — "Old Memories. New Connections. One Batch."
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                Established under the patronship of Border Guard Bangladesh (BGB) Sector Headquarters in Cox's Bazar, Border Guard Public School has long stood as an icon of discipline, academic brilliance, and character building in the coastal paradise of Bangladesh.
              </p>
              <p>
                The SSC Batch of 2023 represents a spirited generation of students who shared classrooms, laboratories, sports grounds, and school festivals during momentous years. Together we overcame academic trials, celebrated batch triumphs, and created bonds of brotherhood and sisterhood that will endure for decades to come.
              </p>
              <div className="p-6 bg-[#002147] text-white rounded-2xl border border-[#C5A059]/40 space-y-3">
                <h3 className="font-bold text-lg font-serif text-[#C5A059]">The Purpose of Our Reunion Platform</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200 list-disc list-inside">
                  <li>Reconnect every classmate who completed SSC in 2023 from BGPS Cox's Bazar.</li>
                  <li>Maintain an authentic, verified alumni registry backed by official school roll and proof documents.</li>
                  <li>Organize grand reunions, cultural sessions, teacher appreciation events, and social gatherings.</li>
                  <li>Preserve school photographs, classroom moments, and nostalgic archives for posterity.</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-6 py-3 bg-[#002147] text-[#C5A059] font-bold text-sm rounded-xl shadow hover:bg-[#001733] transition-all"
                >
                  Join Your Batchmates Now
                </button>
                <button
                  onClick={() => handleNavigate('directory')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all"
                >
                  Browse Batch Directory
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'directory' && (
          <DirectoryView onSelectMember={(m) => setSelectedMember(m)} />
        )}

        {currentTab === 'events' && (
          <EventsView
            onOpenPayment={handleOpenPayment}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentTab === 'notices' && <NoticesView />}

        {currentTab === 'gallery' && <GalleryView />}

        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenPayment={handleOpenPayment}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Global Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => handleNavigate('dashboard')}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onSuccess={() => handleNavigate('dashboard')}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        event={activePaymentEvent}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => handleNavigate('dashboard')}
      />

      <MemberProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
