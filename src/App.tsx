/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppRoute, Language, UserSession } from './types.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeHero } from './components/HomeHero.tsx';
import { SpecialRegistrationSection } from './components/SpecialRegistrationSection.tsx';
import { ThreeStepGuide } from './components/ThreeStepGuide.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { NeirModalFrame } from './components/NeirModalFrame.tsx';
import { UiButton } from './ui/index.ts';
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
  // Keep a one-time intent when a guest asks to register a device before signing in.
  const [loginForSpecialRegistration, setLoginForSpecialRegistration] = useState(false);
  const [guestRegistrationIntroOpen, setGuestRegistrationIntroOpen] = useState(false);
  const [registrationLoginSuccessOpen, setRegistrationLoginSuccessOpen] = useState(false);

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
        setSpecialRegistrationTrigger(null);
        setLoginForSpecialRegistration(false);
        setGuestRegistrationIntroOpen(false); setRegistrationLoginSuccessOpen(false);
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

  const [specialRegistrationTrigger, setSpecialRegistrationTrigger] = useState<number | null>(null);
  const [specialRegistrationMessage, setSpecialRegistrationMessage] = useState('');

  const requestSpecialRegistration = () => {
    setSpecialRegistrationMessage('');
    if (session.isLoggedIn) {
      setSpecialRegistrationTrigger(Date.now());
      return;
    }
    setLoginForSpecialRegistration(false);
    setGuestRegistrationIntroOpen(true);
  };

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
        onOpenLogin={() => { setLoginForSpecialRegistration(false); setGuestRegistrationIntroOpen(false); setRegistrationLoginSuccessOpen(false); setLoginInitialView('login'); setIsLoginOpen(true); }}
        onOpenRegister={() => { setLoginForSpecialRegistration(false); setGuestRegistrationIntroOpen(false); setRegistrationLoginSuccessOpen(false); setLoginInitialView('register'); setIsLoginOpen(true); }}
        onOpenDashboard={() => setCurrentRoute('dashboard')}
        onLogout={() => {
          forgetCitizenSession();
          setSession(defaultCitizenSession);
          setSpecialRegistrationMessage('');
          setSpecialRegistrationTrigger(null);
          setLoginForSpecialRegistration(false);
          setGuestRegistrationIntroOpen(false); setRegistrationLoginSuccessOpen(false);
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

            {/* Everybody sees the guide; guests sign in before the existing 3-step wizard. */}
            <SpecialRegistrationSection
              language={language}
              completionMessage={session.isLoggedIn ? specialRegistrationMessage : undefined}
              onApply={requestSpecialRegistration}
            />
            {session.isLoggedIn && (
              <CitizenImeiListView
                language={language}
                session={session}
                registrationOnly
                registrationTrigger={specialRegistrationTrigger}
                onRegistrationHandled={() => setSpecialRegistrationTrigger(null)}
                onRegistrationComplete={setSpecialRegistrationMessage}
              />
            )}

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
          <div className="w-full"><CitizenImeiListView language={language} session={session} /></div>
        )}
      </main>

      {/* Footer */}
      <Footer language={language} onContactUs={() => {setCurrentRoute('contact'); window.scrollTo({top:0});}} />

      {/* Guest explanation and explicit successful-login handoff precede the existing wizard. */}
      {guestRegistrationIntroOpen && !session.isLoggedIn && (
        <NeirModalFrame title={language === 'bn' ? 'বিশেষ নিবন্ধন' : 'Special Registration'}
          ariaLabel={language === 'bn' ? 'বিশেষ নিবন্ধনের তথ্য' : 'About Special Registration'}
          onClose={() => setGuestRegistrationIntroOpen(false)}
          footer={<UiButton variant="secondary" fullWidth className="neir-shared-button neir-registration-full-width" onClick={() => {
            setGuestRegistrationIntroOpen(false);
            setLoginForSpecialRegistration(true);
            setLoginInitialView('login');
            setIsLoginOpen(true);
          }}>{language === 'bn' ? 'লগইনে এগিয়ে যান' : 'Proceed to login'}</UiButton>}>
          <div className="neir-registration-intro">
            <h3>{language === 'bn' ? 'বিশেষ নিবন্ধন কী?' : 'What is Special Registration?'}</h3>
            <p>{language === 'bn'
              ? 'সাধারণ নিবন্ধন প্রক্রিয়ায় অন্তর্ভুক্ত নয় এমন মোবাইল ডিভাইসের তথ্য ও প্রয়োজনীয় নথি যাচাইয়ের জন্য বিশেষ নিবন্ধনের আবেদন করা যায়।'
              : 'Special Registration is a request to verify and register a handset that cannot be registered through the standard device-registration process.'}</p>
            <h3>{language === 'bn' ? 'কারা আবেদন করতে পারেন?' : 'Who may need to apply?'}</h3>
            <p>{language === 'bn'
              ? 'বিদেশ ভ্রমণ থেকে আনা, উপহার পাওয়া বা এয়ার মেইল/কুরিয়ারে প্রাপ্ত ডিভাইস যদি গ্রেলিস্টেড হয় বা অতিরিক্ত যাচাই প্রয়োজন হয়, তাহলে প্রয়োজনীয় তথ্য-প্রমাণসহ আবেদন করতে হতে পারে। ইতিমধ্যে নিবন্ধিত ডিভাইসের জন্য আবেদন প্রয়োজন নেই; ব্ল্যাকলিস্টেড ডিভাইসের জন্য সংশ্লিষ্ট কর্তৃপক্ষের সহায়তা নিন।'
              : 'You may need this process if a handset brought from overseas, received as a gift, or delivered by air mail/courier is greylisted or requires additional verification. Already registered handsets do not need another application; for blacklisted devices, contact the responsible authority.'}</p>
            <p className="neir-registration-intro-note">{language === 'bn'
              ? 'যোগ্যতা এবং আবেদন অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের যাচাই সাপেক্ষে। আবেদন করতে আপনার অ্যাকাউন্টে লগইন করতে হবে।'
              : 'Eligibility and approval depend on verification. You must log in to your account before applying for Special Registration.'}</p>
          </div>
        </NeirModalFrame>
      )}
      {registrationLoginSuccessOpen && session.isLoggedIn && (
        <NeirModalFrame title={language === 'bn' ? 'লগইন সফল' : 'Login successful'}
          ariaLabel={language === 'bn' ? 'বিশেষ নিবন্ধনের জন্য লগইন সফল' : 'Special Registration login successful'}
          onClose={() => setRegistrationLoginSuccessOpen(false)}
          footer={<UiButton variant="primary" fullWidth className="neir-shared-button neir-registration-full-width neir-registration-success-cta" onClick={() => {
            setRegistrationLoginSuccessOpen(false);
            setCurrentRoute('home');
            setSpecialRegistrationTrigger(Date.now());
          }}>{language === 'bn' ? 'বিশেষ নিবন্ধন শুরু করুন' : 'Proceed to special registration'}</UiButton>}>
          <div className="neir-registration-success" role="status">
            <div className="neir-registration-success-mark" aria-hidden="true"><CheckCircle2 size={38} strokeWidth={1.8} /></div>
            <h3>{language === 'bn' ? 'আবেদন শুরু করার জন্য প্রস্তুত!' : 'You are ready to apply!'}</h3>
            <p>{language === 'bn'
              ? 'আপনি সফলভাবে লগইন করেছেন। এখন আপনার ডিভাইসের বিশেষ নিবন্ধনের আবেদন শুরু করতে পারেন।'
              : 'You have successfully logged in. Your Special Registration application is ready to start.'}</p>
          </div>
        </NeirModalFrame>
      )}
      <LoginModal
        initialView={loginInitialView}
        isOpen={isLoginOpen}
        registrationIntent={loginForSpecialRegistration}
        onClose={() => { setIsLoginOpen(false); setLoginForSpecialRegistration(false); }}
        language={language}
        onLoginSuccess={(newSessionData) => {
          const signedInCitizen: UserSession = {
            ...defaultCitizenSession,
            ...newSessionData,
            isLoggedIn: true,
          };
          rememberCitizenSession(signedInCitizen);
          setSession(signedInCitizen);
          if (loginForSpecialRegistration) {
            setCurrentRoute('home');
            setIsLoginOpen(false);
            setLoginForSpecialRegistration(false);
            setRegistrationLoginSuccessOpen(true);
          } else {
            setCurrentRoute('dashboard');
          }
        }}
      />

    </div>
  );
}
