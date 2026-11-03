import React, {useEffect, useState} from 'react';
import type {AppRoute, Language, UserSession} from '../types.ts';
import {Home, CircleHelp, ChevronDown, Menu, X, UserRound, LogOut, ArrowRight} from 'lucide-react';
import { UiSelect } from '../ui/index.ts';

type Props = {
  currentRoute: AppRoute; onRouteChange: (route:AppRoute)=>void;
  language:Language; onLanguageChange:(language:Language)=>void;
  session:UserSession; onOpenLogin:()=>void; onOpenRegister:()=>void;
  onOpenDashboard:()=>void; onLogout:()=>void;
};
const menu = [
  {route:'home' as AppRoute,en:'Home',bn:'হোম',icon:Home},
  {route:'guides' as AppRoute,en:'User Guides',bn:'ব্যবহার নির্দেশিকা',icon:CircleHelp},
];
export const Header:React.FC<Props> = ({currentRoute,onRouteChange,language,onLanguageChange,session,onOpenLogin,onOpenRegister,onOpenDashboard,onLogout}) => {
  const [open,setOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [mobileProfileOpen,setMobileProfileOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const dismiss=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('keydown',dismiss);
    return ()=>window.removeEventListener('keydown',dismiss);
  },[open]);
  const navigate=(route:AppRoute)=>{onRouteChange(route);setOpen(false);setProfileOpen(false);};
  const controls = <div className="neir-header-auth">
    {session.isLoggedIn ? <div className="neir-profile-container">
      <button type="button" className="neir-profile-icon" aria-label="Citizen profile menu" aria-expanded={profileOpen} onClick={()=>setProfileOpen(!profileOpen)}><UserRound size={25}/></button>
      {profileOpen && <div className="neir-profile-dropdown">
        <p className="neir-profile-name">{session.name}</p>
        <button onClick={()=>navigate('dashboard')}><UserRound size={16}/> {language==='bn'?'আমার প্রোফাইল':'My Profile'}</button>
        <button onClick={()=>{setProfileOpen(false);onLogout();}}><LogOut size={16}/> {language==='bn'?'লগআউট':'Logout'}</button>
      </div>}
    </div> : <>
      <button type="button" className="neir-nav-btn neir-auth-register" onClick={onOpenRegister}>{language==='bn'?'নিবন্ধন':'Register'}</button>
      <button type="button" className="neir-nav-btn neir-auth-login" onClick={onOpenLogin}>{language==='bn'?'লগইন':'Login'}</button>
    </>}
  </div>;
  return <header className="neir-original-header">
    <div className="neir-menubar">
      <button className="neir-logo-wrap" type="button" onClick={()=>navigate('home')} aria-label="NEIR Citizen home">
        <img src={`${import.meta.env.BASE_URL}neir-source/images/btrc-logo.png`} alt="BTRC logo"/>
        <img src={`${import.meta.env.BASE_URL}neir-source/images/govt-seal.svg`} alt="Government of Bangladesh seal"/>
      </button>
      <nav className="neir-main-navigation" aria-label="NEIR portal navigation">
        {menu.map(item=>{const Icon=item.icon;return <button key={item.route} type="button" onClick={()=>navigate(item.route)} className={'neir-nav-btn neir-menu-button'+(currentRoute===item.route?' neir-active':'')} aria-current={currentRoute===item.route?'page':undefined}><Icon size={16} strokeWidth={2.5}/>{language==='bn'?item.bn:item.en}</button>})}
      </nav>
      <div className="neir-header-end">
        <div className="neir-language-select"><UiSelect aria-label={language==='bn'?'ভাষা':'Language'} value={language} onChange={e=>onLanguageChange(e.target.value as Language)}><option value="en">English</option><option value="bn">বাংলা</option></UiSelect><ChevronDown size={16} aria-hidden="true"/></div>
        {controls}
      </div>
      <div className="neir-source-mobile-auth">
        <label className="neir-source-mobile-language"><span className="sr-only">{language==='bn'?'ভাষা':'Language'}</span><UiSelect aria-label={language==='bn'?'ভাষা':'Language'} value={language} onChange={e=>onLanguageChange(e.target.value as Language)}><option value="en">English</option><option value="bn">বাংলা</option></UiSelect><ChevronDown size={15} aria-hidden="true"/></label>
        {session.isLoggedIn ? <div className="neir-mobile-profile-container">
            <button type="button" className="neir-source-mobile-login" aria-label="Citizen mobile profile menu" aria-expanded={mobileProfileOpen} aria-haspopup="true" onClick={()=>setMobileProfileOpen(!mobileProfileOpen)}>
              <UserRound size={16}/> {language==='bn'?'প্রোফাইল':'Profile'} <ChevronDown size={18} aria-hidden="true"/>
            </button>
            {mobileProfileOpen && <div className="neir-profile-dropdown neir-mobile-profile-dropdown">
              <p className="neir-profile-name">{session.name}</p>
              <button type="button" onClick={()=>{setMobileProfileOpen(false);onOpenDashboard();}}><UserRound size={16}/> {language==='bn'?'আমার প্রোফাইল':'My Profile'}</button>
              <button type="button" onClick={()=>{setMobileProfileOpen(false);onLogout();}}><LogOut size={16}/> {language==='bn'?'লগআউট':'Logout'}</button>
            </div>}
          </div>
          : <button type="button" className="neir-source-mobile-login" onClick={onOpenLogin}>{language==='bn'?'লগইন':'Login'} <ArrowRight size={18}/></button>}
      </div>
      <button type="button" className="neir-mobile-toggle" aria-label={language==='bn'?'নেভিগেশন মেনু':'Navigation menu'} aria-controls="neir-mobile-menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button>
    </div>
    {open && <nav id="neir-mobile-menu" className="neir-mobile-menu" aria-label={language==='bn'?'মোবাইল নেভিগেশন':'Mobile navigation'}>
      {menu.map(item=>{const Icon=item.icon;return <button key={item.route} type="button" onClick={()=>navigate(item.route)} className="neir-mobile-menu-item"><Icon size={18}/>{language==='bn'?item.bn:item.en}</button>})}
      {!session.isLoggedIn && <button type="button" className="neir-mobile-menu-item neir-mobile-register"
        onClick={()=>{setOpen(false);onOpenRegister();}}>{language==='bn'?'নিবন্ধন':'Register'}</button>}
      <label className="neir-mobile-language">{language==='bn'?'ভাষা':'Language'} <UiSelect value={language} onChange={e=>onLanguageChange(e.target.value as Language)}><option value="en">English</option><option value="bn">বাংলা</option></UiSelect></label>
      {controls}
    </nav>}
  </header>;
};