/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppRoute, Language, UserSession } from './types.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeHero } from './components/HomeHero.tsx';
import { SpecialRegistrationSection } from './components/SpecialRegistrationSection.tsx';
import { ThreeStepGuide } from './components/ThreeStepGuide.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { CitizenImeiListView } from './components/CitizenImeiListView.tsx';
import { UserGuidesView } from './components/UserGuidesView.tsx';
import { ContactUsView } from './components/ContactUsView.tsx';
import { ProposedDesignView } from './components/ProposedDesignView.tsx';
import { QueryTicket } from './utils/queryTracker.ts';
import { CITIZEN_SESSION_KEY, restoreCitizenSession, rememberCitizenSession, forgetCitizenSession } from './utils/citizenSession.ts';

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const routePaths: Record<AppRoute, string> = {
    home: '/', guides: '/user-guides', contact: '/contact-us', faq: '/faq',
    proposed: '/proposed', dashboard: '/dashboard',
  };
  const getRoute = (): AppRoute => {
    const currentPath = window.location.pathname;
    const relativePath = currentPath === basePath ? '/' :
      currentPath.startsWith(basePath + '/') ? currentPath.slice(basePath.length) : currentPath;
    return (Object.entries(routePaths).find(([, path]) => path === relativePath)?.[0] as AppRoute | undefined) ?? 'home';
  };
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRoute);
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  useEffect(() => {
    const path = basePath + routePaths[currentRoute];
    if (window.location.pathname !== path) window.history.pushState({route: currentRoute}, '', path);
  }, [currentRoute]);
  const [language, setLanguage] = useState<Language>('en');

  // Keep the existing synthetic fallback; restored sessions contain only non-sensitive identity.
  const defaultCitizenSession: UserSession = {
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
  };
  const [session, setSession] = useState<UserSession>(() => restoreCitizenSession(defaultCitizenSession));
  // Modal dialog states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInitialView, setLoginInitialView] = useState<'login' | 'register'>('login');

  // Sync explicit logout (and new sign-in) across other tabs of the same browser.
  useEffect(() => {
    const syncSession = (event: StorageEvent) => {
      if (event.key !== CITIZEN_SESSION_KEY && event.key !== null) return;
      const restored = restoreCitizenSession(defaultCitizenSession);
      setSession(restored);
      if (!restored.isLoggedIn) {
        setCurrentRoute('home');
        setIsLoginOpen(false);
        setSpecialRegistrationMessage('');
      }
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  // The mock citizen dashboard is only available after a successful demo login.
  useEffect(() => {
    if (currentRoute === 'dashboard' && !session.isLoggedIn) {
      setCurrentRoute('home');
      setLoginInitialView('login');
      setIsLoginOpen(true);
    }
  }, [currentRoute, session.isLoggedIn]);

  const [specialRegistrationTrigger, setSpecialRegistrationTrigger] = useState(0);
  const [specialRegistrationMessage, setSpecialRegistrationMessage] = useState('');

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
          forgetCitizenSession();
          setSession(defaultCitizenSession);
          setSpecialRegistrationMessage('');
          setIsLoginOpen(false);
          setCurrentRoute('home');
        }}
      />

      {/* Main Content Area */}
      <main className={(currentRoute === 'home' || currentRoute === 'guides' || currentRoute === 'contact') ? 'flex-1 w-full neir-home-main' : 'flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8'}>
        {/* ROUTE 1: Home (Default 1:1 Baseline) */}
        {currentRoute === 'home' && (
          <div className="neir-home-sections">
            {/* Saved NEIR homepage hero and its built-in first-14-digit IMEI checker */}
            <HomeHero
              language={language}
              onScrollToVerifier={handleScrollToVerifier}
              onOpenGuides={() => {
                setCurrentRoute('guides');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Signed-in entry to the existing 3-step Special Registration modal. */}
            {session.isLoggedIn && <>
              <SpecialRegistrationSection
                language={language}
                completionMessage={specialRegistrationMessage}
                onApply={() => {
                  setSpecialRegistrationMessage('');
                  setSpecialRegistrationTrigger(current => current + 1);
                }}
              />
              <CitizenImeiListView
                language={language}
                session={session}
                registrationOnly
                registrationTrigger={specialRegistrationTrigger}
                onRegistrationComplete={setSpecialRegistrationMessage}
              />
            </>}

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
        {currentRoute === 'dashboard' && session.isLoggedIn && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-10"><CitizenImeiListView language={language} session={session} /></div>
        )}
      </main>

      {/* Footer */}
      <Footer language={language} onContactUs={() => {setCurrentRoute('contact'); window.scrollTo({top:0});}} />

      {/* Modals */}
      <LoginModal
        initialView={loginInitialView}
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        language={language}
        onLoginSuccess={(newSessionData) => {
          const signedInCitizen: UserSession = {
            ...defaultCitizenSession,
            ...newSessionData,
            isLoggedIn: true,
          };
          rememberCitizenSession(signedInCitizen);
          setSession(signedInCitizen);
          setCurrentRoute('dashboard');
        }}
      />

    </div>
  );
}
