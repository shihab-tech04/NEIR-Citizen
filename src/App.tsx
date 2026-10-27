/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppRoute, Language, UserSession } from './types.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeHero } from './components/HomeHero.tsx';
import { ThreeStepGuide } from './components/ThreeStepGuide.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { CitizenImeiListView } from './components/CitizenImeiListView.tsx';
import { UserGuidesView } from './components/UserGuidesView.tsx';
import { ContactUsView } from './components/ContactUsView.tsx';
import { ProposedDesignView } from './components/ProposedDesignView.tsx';
import { QueryTicket } from './utils/queryTracker.ts';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [language, setLanguage] = useState<Language>('en');

  // Citizen Session
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    name: 'Md. Zahid Hasan',
    nameBangla: 'মো: জাহিদ হাসান',
    nid: '19942691234567890',
    mobile: '01711223344',
    email: 'zahid.citizen@example.com',
    registeredHandsets: [
      {
        imei: '352093081234567',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        registeredOn: '12 Jan 2024',
        status: 'Active',
      },
      {
        imei: '861111002223334',
        brand: 'Walton',
        model: 'Primo RM4',
        registeredOn: '18 Jul 2023',
        status: 'Active',
      },
    ],
  });

  // Modal dialog states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInitialView, setLoginInitialView] = useState<'login' | 'register'>('login');

  // Queries state
  const [queries, setQueries] = useState<QueryTicket[]>([]);
  const [prefilledContactImei, setPrefilledContactImei] = useState<string>('');

  const handleScrollToVerifier = () => {
    if (currentRoute !== 'home') {
      setCurrentRoute('home');
      setTimeout(() => {
        const el = document.getElementById('imei-verifier');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('imei-verifier');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddQuery = (newTicket: QueryTicket) => {
    setQueries((prev) => [newTicket, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Header */}
      <Header
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          setCurrentRoute(route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={setLanguage}
        session={session}
        onOpenLogin={() => { setLoginInitialView('login'); setIsLoginOpen(true); }}
        onOpenRegister={() => { setLoginInitialView('register'); setIsLoginOpen(true); }}
        onOpenDashboard={() => setCurrentRoute('dashboard')}
        onLogout={() => {
          setSession((prev) => ({ ...prev, isLoggedIn: false }));
          setCurrentRoute('home');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ROUTE 1: Home (Default 1:1 Baseline) */}
        {currentRoute === 'home' && (
          <div className="space-y-8">
            {/* Saved NEIR homepage hero and its built-in first-14-digit IMEI checker */}
            <HomeHero
              language={language}
              onScrollToVerifier={handleScrollToVerifier}
              onOpenGuides={() => {
                setCurrentRoute('guides');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 3-Step Guide */}
            <ThreeStepGuide
              language={language}
              onOpenWebGuide={() => {
                setCurrentRoute('guides');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenMobileGuide={() => {
                setCurrentRoute('guides');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* FAQ Section */}
            <FaqSection language={language} />
          </div>
        )}

        {/* ROUTE 2: User Guides */}
        {currentRoute === 'guides' && (
          <UserGuidesView
            language={language}
            onOpenLogin={() => { setLoginInitialView('login'); setIsLoginOpen(true); }}
          />
        )}

        {/* ROUTE 3: FAQ */}
        {currentRoute === 'faq' && (
          <div className="space-y-6">
            <FaqSection language={language} />
          </div>
        )}

        {/* ROUTE 4: Contact Us */}
        {currentRoute === 'contact' && (
          <ContactUsView
            language={language}
            initialImei={prefilledContactImei}
            queryList={queries}
            onAddQuery={handleAddQuery}
          />
        )}

        {/* ROUTE 5: Proposed Design (Isolated Sandbox Route) */}
        {currentRoute === 'proposed' && (
          <ProposedDesignView
            language={language}
            onReturnToBaseline={() => {
              setCurrentRoute('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {/* Source-backed authenticated citizen IMEI list */}
        {currentRoute === 'dashboard' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-10"><CitizenImeiListView language={language} session={session} /></div>
        )}
      </main>

      {/* Persistent safety disclosure, intentionally outside the source-fidelity page layout. */}
      <p aria-label="Prototype disclosure" className="fixed z-50 bottom-3 left-3 rounded-lg border border-cyan-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-cyan-900 shadow-md">
        NEIR UX Prototype · No live BTRC services
      </p>

      {/* Footer */}
      <Footer language={language} />

      {/* Modals */}
      <LoginModal
        initialView={loginInitialView}
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        language={language}
        onLoginSuccess={(newSessionData) => {
          setSession((prev) => ({
            ...prev,
            ...newSessionData,
            isLoggedIn: true,
          }));
          setCurrentRoute('dashboard');
        }}
      />

    </div>
  );
}
