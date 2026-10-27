import React, { useState } from 'react';
import type { AppRoute, Language, UserSession } from '../types.ts';
import { Globe2, Menu, X, UserRound, LogOut } from 'lucide-react';

type Props = {
  currentRoute: AppRoute; onRouteChange: (route: AppRoute) => void; language: Language;
  onLanguageChange: (lang: Language) => void; session: UserSession;
  onOpenLogin: () => void; onOpenRegister: () => void; onOpenDashboard: () => void; onLogout: () => void;
};
const links: {route: AppRoute; en: string; bn: string}[] = [
  {route:'home',en:'Home',bn:'হোম'},
  {route:'guides',en:'User Guides',bn:'ব্যবহার নির্দেশিকা'},
  {route:'contact',en:'Contact Us',bn:'যোগাযোগ'},
];
export const Header: React.FC<Props> = ({currentRoute,onRouteChange,language,onLanguageChange,session,onOpenLogin,onOpenRegister,onOpenDashboard,onLogout}) => {
  const [menuOpen,setMenuOpen] = useState(false);
  const [logoError,setLogoError] = useState(false);
  const [sealError,setSealError] = useState(false);
  const navigate = (r: AppRoute) => {onRouteChange(r);setMenuOpen(false)};
  const auth = <div className="flex items-center gap-2">
    {session.isLoggedIn ? <><button onClick={onOpenDashboard} className="text-sm font-semibold text-slate-800 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100"><UserRound size={17}/>{session.name}</button><button onClick={onLogout} title="Log out" aria-label="Log out" className="border rounded-xl px-3 py-2"><LogOut size={18}/></button></> :
    <><button onClick={onOpenRegister} className="px-4 py-2.5 text-sm font-semibold rounded-2xl border border-[#00ACC1] text-[#00838F] hover:bg-[#E0F7FA]">Register</button>
    <button onClick={onOpenLogin} className="px-4 py-2.5 text-sm font-semibold rounded-2xl bg-[#00ACC1] text-white hover:bg-[#00838F]">Login</button></>}
  </div>;
  return <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
    <div className="mx-auto max-w-[1300px] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 min-h-[76px] md:min-h-[92px]">
      <button className="flex items-center gap-3 shrink-0" onClick={() => navigate('home')} aria-label="NEIR Citizen home">
        {logoError ? <span className="font-bold text-xs text-[#00838F] rounded-full border border-cyan-200 w-14 h-14 flex items-center justify-center">BTRC</span> : <img src="https://testcitizenportal.neir.btrc.gov.bd/assets/images/btrc-logo.png" onError={() => setLogoError(true)} alt="BTRC logo" className="w-12 h-12 md:w-14 md:h-14 object-contain" />}
        {sealError ? <span className="hidden sm:flex text-xs text-slate-700 border rounded-full w-12 h-12 items-center justify-center">BD</span> : <img src="https://testcitizenportal.neir.btrc.gov.bd/assets/images/govt-seal.svg" onError={() => setSealError(true)} alt="Government seal" className="hidden sm:block w-11 h-11 md:w-14 md:h-14 object-contain" />}
      </button>
      <nav aria-label="Citizen portal navigation" className="hidden md:flex items-center gap-2">
        {links.map(l => <button key={l.route} onClick={() => navigate(l.route)} className={currentRoute === l.route ? 'text-sm font-semibold text-[#00838F] bg-[#E0F7FA] rounded-xl px-4 py-3' : 'text-sm font-medium text-slate-700 hover:bg-[#E0F7FA] rounded-xl px-4 py-3'}>{language === 'bn' ? l.bn : l.en}</button>)}
      </nav>
      <div className="hidden md:flex items-center gap-3">
        <label className="flex items-center gap-1 text-sm text-slate-800"><Globe2 size={17}/><span className="sr-only">Language</span>
          <select className="bg-transparent py-2 px-1 outline-none" aria-label="Language" value={language} onChange={e => onLanguageChange(e.target.value as Language)}><option value="en">English</option><option value="bn">বাংলা</option></select>
        </label>
        {auth}
      </div>
      <button className="md:hidden border rounded-lg p-2" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div>
    {menuOpen && <div className="md:hidden px-4 py-3 border-t space-y-2 bg-white">
      {links.map(l => <button key={l.route} onClick={() => navigate(l.route)} className="block w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[#E0F7FA]">{language === 'bn' ? l.bn : l.en}</button>)}
      <label className="text-xs text-slate-600 flex justify-between items-center py-2">Language<select className="border rounded-md px-2 py-1" value={language} onChange={e => onLanguageChange(e.target.value as Language)}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
      {auth}
    </div>}
    {currentRoute === 'proposed' && <button className="block bg-amber-50 text-amber-900 text-xs text-center w-full py-2" onClick={() => navigate('home')}>Proposed design is a separate prototype. Return to current portal.</button>}
  </header>;
};
