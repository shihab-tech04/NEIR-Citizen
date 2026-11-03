import React, {useEffect, useState} from 'react';
import { useNeirDialogFocus } from '../ui/useNeirDialogFocus.ts';
import { UiInput, UiButton } from '../ui/index.ts';
import { CitizenRegistrationForm } from './CitizenRegistrationForm.tsx';
import {X,Maximize2,Minimize2,Phone,Lock,Eye,ArrowRight,ArrowLeft} from 'lucide-react';
import type {Language,UserSession} from '../types.ts';
interface Props {isOpen:boolean; onClose:()=>void; onBack?:()=>void; language:Language; onLoginSuccess:(session:Partial<UserSession>)=>void; initialView?:'login'|'register'; registrationIntent?:boolean; handoffPending?:boolean}
type View='login'|'register'|'forgot';
export const LoginModal:React.FC<Props> = ({isOpen,onClose,onBack,onLoginSuccess,initialView='login',language,registrationIntent=false,handoffPending=false}) => {
 const [view,setView]=useState<View>(initialView);
 const [expanded,setExpanded]=useState(false);
 const [mobile,setMobile]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [error,setError]=useState('');
 const [submitted,setSubmitted]=useState(false);
 const [isAuthenticating,setIsAuthenticating]=useState(false);
 const [regStep,setRegStep]=useState(1);
 const dialogRef=useNeirDialogFocus<HTMLDivElement>({ isOpen, onClose, initialFocusSelector:'[aria-label="Close"]' });
 useEffect(()=>{if(isOpen){setView(initialView);setError('');setSubmitted(false);setRegStep(1);setMobile('');setPassword('');setIsAuthenticating(false);}},[initialView,isOpen]);

 const demoSignIn=()=>{
  const m=mobile||'01700000000';
  onLoginSuccess({isLoggedIn:true,name:'Demo NEIR Citizen',mobile:m,nid:'DEMO-NID',email:'demo@example.invalid',registeredHandsets:[]});
  if(!registrationIntent)onClose();
 };
 // Only the synthetic NEIR test accounts can pass this database-backed demo login.
 const submitLogin=async(e:React.FormEvent)=>{
   e.preventDefault();
   if(isAuthenticating)return;
   setSubmitted(true);setError('');
   if(!mobile)return;
   if(!/^01\d{9}$/.test(mobile)){setError('Enter a valid 11-digit mobile number.');return;}
   if(!password)return;
   setIsAuthenticating(true);
   try{
     const response=await fetch('https://wjsdylxbvdnraztktbtg.supabase.co/functions/v1/neir-demo-login',{
       method:'POST',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({mobile,password}),
     });
     if(!response.ok){
       setError(response.status===401?'Incorrect mobile number or password.':'Demo sign-in is temporarily unavailable. Please try again.');
       return;
     }
     const result:unknown=await response.json();
     if(!result||typeof result!=='object'||!('mobile' in result)||!('name' in result)||
        typeof result.mobile!=='string'||typeof result.name!=='string'){
       setError('Demo sign-in is temporarily unavailable. Please try again.');
       return;
     }
     onLoginSuccess({isLoggedIn:true,name:result.name,nameBangla:'',mobile:result.mobile,nid:'DEMO-NID',email:'',registeredHandsets:[]});
     if(!registrationIntent)onClose();
   }catch{
     setError('Unable to reach the demo sign-in service. Please try again.');
   }finally{
     setIsAuthenticating(false);
   }
 };
 const modalTitle=view==='login'?'Login':view==='register'?'User Registration':'Forgot Password';
 const canGoBack=view!=='login'||regStep>1||Boolean(onBack);
 const goBack=()=>{
   setError('');
   setSubmitted(false);
   if(view==='register' && regStep>1){setRegStep(step=>step-1);return;}
   if(view!=='login'){setView('login');return;}
   onBack?.();
 };
 useEffect(()=>{
   if(isOpen && canGoBack){
     const back=dialogRef.current?.querySelector<HTMLButtonElement>('.neir-modal-back');
     back?.focus({preventScroll:true});
   }
 },[view,regStep,isOpen]);
 if(!isOpen)return null;
 const inputStyle='neir-original-dialog-input';
 return <div className={"neir-dialog-backdrop neir-modal-backdrop"+(registrationIntent?" neir-auth-for-registration":"")+(handoffPending?" neir-auth-handoff-exit":"")} onMouseDown={e=>{if(e.target===e.currentTarget&&!handoffPending)onClose();}}>
  <div ref={dialogRef} className={'neir-original-dialog neir-modal-surface'+(view==='register'?' neir-original-dialog--registration':'')+(expanded?' neir-dialog-maximized':'')} role="dialog" aria-modal="true" aria-labelledby="neir-dialog-heading" tabIndex={-1}>
   <div className="neir-original-dialog-top">
    <div className="neir-modal-header-leading">
      {canGoBack && <button type="button" className="neir-modal-back"
        aria-label={language==='bn'?'পেছনে যান':'Back'} onClick={goBack}>
        <ArrowLeft size={22} strokeWidth={1.8} aria-hidden="true" />
      </button>}
      <h2 id="neir-dialog-heading">{modalTitle}</h2>
    </div>
    <div className="neir-original-dialog-actions">
      <button aria-label={expanded?'Restore dialog':'Maximize'} onClick={()=>setExpanded(!expanded)} type="button">{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>
      <button aria-label="Close" onClick={onClose} type="button"><X size={16}/></button>
    </div>
   </div>
   {handoffPending && <p className="neir-login-transition-status" role="status">{language === 'bn' ? 'আবেদন ফর্ম খোলা হচ্ছে…' : 'Opening your Special Registration form…'}</p>}
   <div className="neir-original-dialog-body neir-modal-animated-content" key={view}>
    {view==='login' && <form onSubmit={submitLogin} noValidate>
      <hr/>
      <label htmlFor="login-mobile">Enter your mobile number <span>*</span></label>
      <div className="neir-dialog-input-icon"><Phone size={17}/><UiInput id="login-mobile" autoComplete="username" placeholder="Mobile Number (01XXXXXXXXX)" inputMode="numeric" maxLength={11} className={inputStyle} value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,'').slice(0,11));setError('')}} aria-invalid={submitted&&(!mobile||!/^01\d{9}$/.test(mobile))}/></div>
      {submitted&&!mobile && <p role="alert" className="neir-original-field-error">Mobile number is required</p>}
      {submitted&&mobile&&!/^01\d{9}$/.test(mobile)&& <p role="alert" className="neir-original-field-error">Enter a valid 11-digit mobile number.</p>}
      <label htmlFor="login-password">Enter your password</label>
      <div className="neir-dialog-input-icon"><Lock size={17}/><UiInput id="login-password" type={showPassword?'text':'password'} placeholder="Enter your password" autoComplete="current-password" className={inputStyle} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} aria-invalid={submitted&&!password}/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}><Eye size={17}/></button></div>
      {submitted&&!password && <p role="alert" className="neir-original-field-error">Password is required</p>}
      <hr/>
      {error&&!(!/^01\d{9}$/.test(mobile)) && <p role="alert" className="neir-original-field-error">{error}</p>}
      <UiButton variant="primary" className="neir-dialog-primary" type="submit" disabled={isAuthenticating} aria-busy={isAuthenticating}>{isAuthenticating?'LOGGING IN…':'LOGIN'} <ArrowRight size={18} aria-hidden="true"/></UiButton>
      <div className="neir-dialog-links"><p className="neir-dialog-switch">Did you forget your password? <button onClick={()=>{setView('forgot');setError('')}} type="button">Forgot Password</button></p>
      <p className="neir-dialog-switch">Don't have an account? <button onClick={()=>{setView('register');setError('')}} type="button">Sign Up</button></p></div>
    </form>}
    {view==='register' && <CitizenRegistrationForm
      language={language} mobile={mobile} onMobileChange={setMobile}
      step={regStep} onStepChange={setRegStep}
      onComplete={demoSignIn} onLogin={() => {setView('login');setError('');}} />}
    {view==='forgot'&&<form onSubmit={e=>{e.preventDefault();setError('This prototype cannot reset official passwords. Use the official BTRC portal.');}}>
      <label htmlFor="forgot-mobile">Enter your registered mobile number</label>
      <UiInput id="forgot-mobile" className={inputStyle} inputMode="numeric" maxLength={11} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="Mobile Number (01XXXXXXXXX)"/>
      <UiButton variant="primary" type="submit" className="neir-dialog-primary">Request OTP</UiButton>
      {error&&<p role="status" className="neir-original-field-error">{error}</p>}
      <p className="neir-dialog-switch"><button type="button" onClick={()=>setView('login')}>Back to Login</button></p>
    </form>}
   </div>
  </div>
 </div>;
};