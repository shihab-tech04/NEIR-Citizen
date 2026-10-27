/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppRoute, Language, UserSession } from '../types.ts';
import { 
  PhoneCall, 
  Globe, 
  User, 
  LogOut, 
  Smartphone, 
  Menu, 
  X,
  FileText,
  HelpCircle,
  Mail,
  Home,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  session: UserSession;
  onOpenLogin: () => void;
  onOpenDashboard: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onRouteChange,
  language,
  onLanguageChange,
  session,
  onOpenLogin,
  onOpenDashboard,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isBn = language === 'bn';

  const navItems = [
    {
      id: 'home' as AppRoute,
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'guides' as AppRoute,
      labelBn: 'ব্যবহার নির্দেশিকা',
      labelEn: 'User Guides',
      icon: FileText,
    },
    {
      id: 'faq' as AppRoute,
      labelBn: 'সাধারণ জিজ্ঞাসা',
      labelEn: 'FAQ',
      icon: HelpCircle,
    },
    {
      id: 'contact' as AppRoute,
      labelBn: 'যোগাযোগ',
      labelEn: 'Contact Us',
      icon: Mail,
    },
    {
      id: 'proposed' as AppRoute,
      labelBn: 'প্রস্তাবিত নতুন ডিজাইন',
      labelEn: 'Proposed Design',
      icon: Sparkles,
      badge: isBn ? 'নতুন রূপরেখা' : 'Preview Next',
    },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Govt Bar */}
      <div className="bg-[#006a4e] text-white text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f42a41] border border-white"></span>
            <span>
              {isBn
                ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি)'
                : "Government of the People's Republic of Bangladesh | BTRC"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Helpline indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded text-amber-300 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isBn ? 'হেল্পলাইন: ১০০ | এসএমএস: ১৬০০২' : 'Helpline: 100 | SMS: 16002'}</span>
            </div>

            {/* Language toggle button */}
            <button
              type="button"
              onClick={() => onLanguageChange(isBn ? 'en' : 'bn')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded transition cursor-pointer text-white"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-200" />
              <span className="font-semibold">{isBn ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Identity Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div 
            onClick={() => onRouteChange('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Govt Emblem & BTRC Crest representation */}
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#006a4e] to-[#044c38] flex items-center justify-center text-white p-1.5 shadow-sm border border-emerald-700 shrink-0">
              <div className="w-full h-full rounded-full border border-amber-300/60 flex items-center justify-center relative">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#f42a41] border-2 border-white"></span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isBn ? 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন' : 'Bangladesh Telecommunication Regulatory Commission'}
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#006a4e] leading-tight group-hover:text-[#044c38] transition">
                  {isBn ? 'এনইআইআর সিটিজেন পোর্টাল' : 'NEIR Citizen Portal'}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isBn ? 'ন্যাশনাল রেজিস্ট্রি' : 'National Registry'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                {isBn ? 'ন্যাশনাল ইকুইপমেন্ট আইডেনটিটি রেজিস্টার (NEIR)' : 'National Equipment Identity Register (NEIR)'}
              </span>
            </div>
          </div>

          {/* Right Header Utility / Citizen Auth Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {session.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[#006a4e] text-xs font-semibold transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">
                    {isBn ? session.nameBangla : session.name}
                  </span>
                  <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                    {session.registeredHandsets.length} {isBn ? 'হ্যান্ডসেট' : 'Devices'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title={isBn ? 'লগআউট' : 'Sign Out'}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#006a4e] hover:bg-[#044c38] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>{isBn ? 'লগইন / নিবন্ধন' : 'Sign In / Register'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-slate-100 border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onRouteChange(item.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer border-b-2 ${
                      isActive
                        ? 'border-[#006a4e] text-[#006a4e] bg-white font-semibold'
                        : 'border-transparent text-slate-700 hover:text-[#006a4e] hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#006a4e]' : 'text-slate-500'}`} />
                    <span>{isBn ? item.labelBn : item.labelEn}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onRouteChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm text-left ${
                  isActive
                    ? 'bg-emerald-50 text-[#006a4e] font-semibold border-l-4 border-[#006a4e]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{isBn ? item.labelBn : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Scope Protection & Status Banner */}
      <div className="bg-amber-50/80 border-b border-amber-200 text-amber-950 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-800">
              {currentRoute === 'proposed'
                ? (isBn ? '⚠️ প্রদর্শিত ভিউ: প্রস্তাবিত নতুন রূপরেখা' : '⚠️ Displaying: Future Proposed Design Prototype')
                : (isBn ? '🏛️ প্রদর্শিত ভিউ: বিদ্যমান সরকারি পোর্টালের হুবহু ১:১ প্রোটোটাইপ' : '🏛️ Displaying: 1:1 Current System Baseline Prototype')}
            </span>
            <span className="text-slate-600 hidden lg:inline">
              {currentRoute === 'proposed'
                ? (isBn ? '(মূল বেইসলাইন অপরিবর্তিত রেখে তৈরি আধুনিক রূপরেখা)' : '(Next-Gen modernized UX, keeping baseline strictly isolated)')
                : (isBn ? '(মূল ডিজাইন, নেভিগেশন, ফিল্ড ও টার্মিনোলজি অক্ষুণ্ণ রাখা হয়েছে)' : '(Preserving original UI structure, tokens, fields & navigation)')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentRoute === 'proposed' ? (
              <button
                type="button"
                onClick={() => onRouteChange('home')}
                className="text-emerald-800 underline hover:text-emerald-950 font-medium cursor-pointer"
              >
                {isBn ? '← মূল বেইসলাইন পোর্টালে ফিরুন' : '← Return to 1:1 Baseline Portal'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRouteChange('proposed')}
                className="text-blue-700 underline hover:text-blue-900 font-medium cursor-pointer"
              >
                {isBn ? 'ভবিষ্যতের প্রস্তাবিত নতুন ডিজাইন দেখুন →' : 'View Future Proposed Design Route →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
