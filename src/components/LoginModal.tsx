import React, {useEffect, useState} from 'react';
import {X,Maximize2,Minimize2,Phone,Lock,Eye,ArrowRight} from 'lucide-react';
import type {Language,UserSession} from '../types.ts';
interface Props {isOpen:boolean; onClose:()=>void; language:Language; onLoginSuccess:(session:Partial<UserSession>)=>void; initialView?:'login'|'register'}
type View='login'|'register'|'forgot';
export const LoginModal:React.FC<Props> = ({isOpen,onClose,onLoginSuccess,initialView='login'}) => {
 const [view,setView]=useState<View>(initialView);
 const [expanded,setExpanded]=useState(false);
 const [mobile,setMobile]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [error,setError]=useState('');
 const [submitted,setSubmitted]=useState(false);
 const [otp,setOtp]=useState('');
 const [regStep,setRegStep]=useState(1);
 const [newPassword,setNewPassword]=useState('');
 const [documentDigits,setDocumentDigits]=useState('');
 const [confirmPassword,setConfirmPassword]=useState('');
 useEffect(()=>{if(isOpen){setView(initialView);setError('');setSubmitted(false);setRegStep(1);}},[initialView,isOpen]);
 if(!isOpen)return null;
 const demoSignIn=()=>{
  const m=mobile||'01700000000';
  onLoginSuccess({isLoggedIn:true,name:'Demo NEIR Citizen',mobile:m,nid:'DEMO-NID',email:'demo@example.invalid',registeredHandsets:[]});
  onClose();
 };
 const submitLogin=(e:React.FormEvent)=>{
   e.preventDefault();setSubmitted(true);setError('');
   if(!/^01\d{9}$/.test(mobile)){setError('Enter a valid 11-digit mobile number for this offline prototype.');return;}
   if(!password){setError('Password is required.');return;}
   demoSignIn();
 };
 const modalTitle=view==='login'?'Login':view==='register'?'Register':'Forgot Password';
 const inputStyle='neir-original-dialog-input';
 return <div className="neir-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className={'neir-original-dialog'+(expanded?' neir-dialog-maximized':'')} role="dialog" aria-modal="true" aria-labelledby="neir-dialog-heading">
   <div className="neir-original-dialog-top">
    <h2 id="neir-dialog-heading">{modalTitle}</h2>
    <div className="neir-original-dialog-actions">
      <button aria-label={expanded?'Restore dialog':'Maximize'} onClick={()=>setExpanded(!expanded)} type="button">{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>
      <button aria-label="Close" onClick={onClose} type="button"><X size={16}/></button>
    </div>
   </div>
   <div className="neir-original-dialog-body">
    {view==='login' && <form onSubmit={submitLogin} noValidate>
      <hr/>
      <label htmlFor="login-mobile">Enter your mobile number <span>*</span></label>
      <div className="neir-dialog-input-icon"><Phone size={17}/><input id="login-mobile" autoComplete="off" placeholder="Mobile Number (01XXXXXXXXX)" inputMode="numeric" maxLength={11} className={inputStyle} value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,'').slice(0,11));setError('')}}/></div>
      {submitted&&!mobile && <p className="neir-original-field-error">Mobile number is required</p>}
      <label htmlFor="login-password">Enter your password</label>
      <div className="neir-dialog-input-icon"><Lock size={17}/><input id="login-password" type={showPassword?'text':'password'} placeholder="Enter your password" autoComplete="off" className={inputStyle} value={password} onChange={e=>{setPassword(e.target.value);setError('')}}/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}><Eye size={17}/></button></div>
      <hr/>
      <button className="neir-dialog-primary" type="submit">LOGIN <ArrowRight size={18} aria-hidden="true"/></button>
      <div className="neir-dialog-links"><p className="neir-dialog-switch">Did you forget your password? <button onClick={()=>{setView('forgot');setError('')}} type="button">Forgot Password</button></p>
      <p className="neir-dialog-switch">Don't have an account? <button onClick={()=>{setView('register');setError('')}} type="button">Sign Up</button></p></div>
      {error && <p role="alert" className="neir-original-field-error">{error}</p>}
    </form>}
    {view==='register' && <form onSubmit={e=>{e.preventDefault();setError('');if(!/^01\d{9}$/.test(mobile)){setError('Enter an 11-digit demo mobile number.');return;}if(regStep===1){if(!/^\d{4}$/.test(documentDigits)){setError('Enter the last 4 digits of your document ID.');return;}setRegStep(2);return;}if(regStep===2){if(otp!=='1234'){setError('For this offline demo use 1234.');return;}setRegStep(3);return;}if(newPassword.length<4){setError('Enter a demo password of at least 4 characters.');return;}if(newPassword!==confirmPassword){setError('The confirmation password must match.');return;}demoSignIn();}}>
      <p className="neir-dialog-demo-note">Frontend-only registration demonstration. No OTP is sent.</p>
      {regStep===1&&<><label htmlFor="reg-mobile">Enter your mobile number <span>*</span></label><input id="reg-mobile" className={inputStyle} placeholder="Mobile Number (01XXXXXXXXX)" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,11))}/><label htmlFor="reg-document">Last 4 digits of document ID</label><input id="reg-document" className={inputStyle} maxLength={4} inputMode="numeric" required value={documentDigits} onChange={e=>{setDocumentDigits(e.target.value.replace(/\D/g,'').slice(0,4));setError('');}} placeholder="Last 4 digits" /></>}
      {regStep===2&&<><label htmlFor="reg-otp">Enter OTP</label><input id="reg-otp" className={inputStyle} value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Demo code 1234" maxLength={4}/></>}
      {regStep===3&&<><label htmlFor="reg-pass">Set Account Password</label><input id="reg-pass" className={inputStyle} type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Demo password"/><label htmlFor="reg-pass-confirm">Confirm Account Password <span>*</span></label><input id="reg-pass-confirm" className={inputStyle} type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter your demo password" required/></>}
      {error&&<p role="alert" className="neir-original-field-error">{error}</p>}
      <button className="neir-dialog-primary" type="submit">{regStep===1?'Request OTP':regStep===2?'Verify and Proceed':'Create Account'}</button>
      <p className="neir-dialog-switch">Already have an account? <button onClick={()=>setView('login')} type="button">Login</button></p>
    </form>}
    {view==='forgot'&&<form onSubmit={e=>{e.preventDefault();setError('This prototype cannot reset official passwords. Use the official BTRC portal.');}}>
      <label htmlFor="forgot-mobile">Enter your registered mobile number</label>
      <input id="forgot-mobile" className={inputStyle} inputMode="numeric" maxLength={11} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="Mobile Number (01XXXXXXXXX)"/>
      <button type="submit" className="neir-dialog-primary">Request OTP</button>
      {error&&<p role="status" className="neir-original-field-error">{error}</p>}
      <p className="neir-dialog-switch"><button type="button" onClick={()=>setView('login')}>Back to Login</button></p>
    </form>}
   </div>
  </div>
 </div>;
};