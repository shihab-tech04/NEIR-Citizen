/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppRoute, Language, UserSession } from './types.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeHero } from './components/HomeHero.tsx';
import { ImeiChecker } from './components/ImeiChecker.tsx';
import { ThreeStepGuide } from './components/ThreeStepGuide.tsx';
import { CitizenServices } from './components/CitizenServices.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { CitizenDashboardModal } from './components/CitizenDashboardModal.tsx';
import { UserGuidesView } from './components/UserGuidesView.tsx';
import { ContactUsView } from './components/ContactUsView.tsx';
import { ProposedDesignView } from './components/ProposedDesignView.tsx';
import { INITIAL_SAMPLE_QUERIES, QueryTicket } from './utils/queryTracker.ts';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [language, setLanguage] = useState<Language>('bn');

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
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Queries state
  const [queries, setQueries] = useState<QueryTicket[]>(INITIAL_SAMPLE_QUERIES);
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

  const handleSelectService = (service: 'verify' | 'register' | 'lost' | 'query' | 'guides') => {
    if (service === 'verify') {
      handleScrollToVerifier();
    } else if (service === 'register') {
      if (!session.isLoggedIn) {
        setIsLoginOpen(true);
      } else {
        setIsDashboardOpen(true);
      }
    } else if (service === 'lost') {
      setCurrentRoute('contact');
    } else if (service === 'query') {
      setCurrentRoute('contact');
    } else if (service === 'guides') {
      setCurrentRoute('guides');
    }
  };

  const handleAddHandset = (newHandset: {
    imei: string;
    brand: string;
    model: string;
    registeredOn: string;
    status: 'Active' | 'Under Review' | 'Flagged';
  }) => {
    setSession((prev) => ({
      ...prev,
      registeredHandsets: [newHandset, ...prev.registeredHandsets],
    }));
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
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onLogout={() => {
          setSession((prev) => ({ ...prev, isLoggedIn: false }));
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ROUTE 1: Home (Default 1:1 Baseline) */}
        {currentRoute === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <HomeHero
              language={language}
              onScrollToVerifier={handleScrollToVerifier}
              onOpenGuides={() => {
                setCurrentRoute('guides');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* IMEI Verification Section */}
            <ImeiChecker
              language={language}
              onNavigateToContact={(imeiVal) => {
                setPrefilledContactImei(imeiVal || '');
                setCurrentRoute('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToRegister={() => {
                if (!session.isLoggedIn) {
                  setIsLoginOpen(true);
                } else {
                  setIsDashboardOpen(true);
                }
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

            {/* Key Citizen Services */}
            <CitizenServices
              language={language}
              onSelectService={handleSelectService}
            />

            {/* FAQ Section */}
            <FaqSection language={language} />
          </div>
        )}

        {/* ROUTE 2: User Guides */}
        {currentRoute === 'guides' && (
          <UserGuidesView
            language={language}
            onOpenLogin={() => setIsLoginOpen(true)}
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
      </main>

      {/* Footer */}
      <Footer language={language} />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        language={language}
        onLoginSuccess={(newSessionData) => {
          setSession((prev) => ({
            ...prev,
            ...newSessionData,
            isLoggedIn: true,
          }));
        }}
      />

      <CitizenDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        language={language}
        session={session}
        onAddHandset={handleAddHandset}
        onLogout={() => {
          setSession((prev) => ({ ...prev, isLoggedIn: false }));
        }}
      />
    </div>
  );
}
