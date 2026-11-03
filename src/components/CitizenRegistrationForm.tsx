import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { UiButton, UiInput } from '../ui/index.ts';
import type { Language } from '../types.ts';
import './CitizenRegistrationForm.css';

type Props = {
  language: Language;
  mobile: string;
  onMobileChange: (mobile: string) => void;
  step: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onLogin: () => void;
};

const digitOnly = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);
const checks = (value: string) => [
  /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value),
  /[^a-zA-Z\d\s]/.test(value), value.length >= 8,
];
const testCode = () => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String((values[0] % 900000) + 100000);
};

export const CitizenRegistrationForm: React.FC<Props> = ({
  language, mobile, onMobileChange, step, onStepChange, onComplete, onLogin,
}) => {
  const isBn = language === 'bn';
  const [documentDigits, setDocumentDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== 2 || secondsRemaining <= 0) return;
    const timeout = window.setTimeout(() => setSecondsRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [secondsRemaining, step]);

  const generateDemoCode = () => {
    setDemoCode(testCode());
    setOtp('');
    setAttempts(0);
    setSecondsRemaining(300);
    setError('');
  };

  const changeOtp = (value: string, index: number) => {
    const numbers = digitOnly(value, 6);
    const next = otp.padEnd(6, ' ').split('');
    if (!numbers.length) next[index] = ' ';
    numbers.split('').forEach((digit, offset) => {
      if (index + offset < 6) next[index + offset] = digit;
    });
    const updated = next.join('').trimEnd().replace(/ /g, '');
    setOtp(updated);
    setError('');
    inputRefs.current[Math.min(5, index + Math.max(numbers.length, 1))]?.focus();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (step === 1) {
      if (!/^01\d{9}$/.test(mobile)) {
        setError(isBn ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।' : 'Enter a valid 11-digit mobile number.');
        return;
      }
      if (!/^\d{4}$/.test(documentDigits)) {
        setError(isBn ? 'নথির শেষ চারটি সংখ্যা লিখুন।' : 'Enter the last four digits of the document ID.');
        return;
      }
      generateDemoCode();
      onStepChange(2);
      return;
    }
    if (step === 2) {
      if (secondsRemaining === 0) {
        setError(isBn ? 'কোডের মেয়াদ শেষ। নতুন কোড নিন।' : 'Code expired. Request a new demonstration code.');
        return;
      }
      if (!/^\d{6}$/.test(otp) || otp !== demoCode) {
        setAttempts(a => a + 1);
        setError(isBn ? 'ছয় সংখ্যার সঠিক কোড লিখুন।' : 'Enter the correct six-digit demonstration code.');
        if (attempts >= 4) { setSecondsRemaining(0); setError('Too many attempts. Request a new demonstration code.'); }
        return;
      }
      onStepChange(3);
      return;
    }
    if (!checks(newPassword).every(Boolean)) {
      setError(isBn ? 'পাসওয়ার্ডের সব শর্ত পূরণ করুন।' : 'Your password must meet all five requirements.');
      return;
    }
    if (newPassword !== confirmation) {
      setError(isBn ? 'দুটি পাসওয়ার্ড একই হতে হবে।' : 'The two passwords must match.');
      return;
    }
    onComplete();
  };

  const countdown = `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, '0')}`;
  const passwordRules = [
    isBn ? 'কমপক্ষে একটি ছোট হাতের অক্ষর' : 'At least one lowercase letter',
    isBn ? 'কমপক্ষে একটি বড় হাতের অক্ষর' : 'At least one uppercase letter',
    isBn ? 'কমপক্ষে একটি সংখ্যা' : 'At least one number',
    isBn ? 'কমপক্ষে একটি বিশেষ চিহ্ন' : 'At least one special character',
    isBn ? 'কমপক্ষে ৮ অক্ষর' : 'Minimum 8 characters',
  ];
  const rulesPassed = checks(newPassword);

  return (
    <form className="neir-reg-form" onSubmit={submit} noValidate>
      <div className="neir-reg-content" key={step}>
        <section className="neir-reg-explanation" aria-label={isBn ? 'নিবন্ধনের ধাপ' : 'Registration step'}>
          <h3>{step === 1 ? (isBn ? 'মোবাইল নম্বর ও ডকুমেন্ট আইডি' : 'Phone Number & Doc ID')
            : step === 2 ? (isBn ? 'ওটিপি যাচাইকরণ' : 'OTP Verification')
              : (isBn ? 'পাসওয়ার্ড তৈরি করুন' : 'Create password')}</h3>
          {step === 1 ? <>
            <p>{isBn ? 'নিচের তথ্য লিখুন:' : 'Please enter the following details:'}</p>
            <ul>
              <li>{isBn ? 'আপনার বর্তমানে ব্যবহৃত মোবাইল নম্বর' : 'Your currently used mobile number'}</li>
              <li>{isBn ? 'এই সিম নিবন্ধনে ব্যবহৃত নথির শেষ ৪ সংখ্যা (NID, স্মার্ট NID, পাসপোর্ট ইত্যাদি)' :
                'The last 4 digits of the document used to register this SIM (NID, Smart NID, Passport, etc.)'}</li>
            </ul>
            <p>{isBn ? 'একটি নথি দিয়ে সর্বোচ্চ ১০টি নম্বর নিবন্ধিত থাকতে পারে। সেগুলোর যেকোনো একটি দিয়ে এগিয়ে যেতে পারবেন।' :
              'Your document ID may have up to 10 registered mobile numbers. Enter any one to proceed.'}</p>
          </> : step === 2 ? <>
            <p>{isBn ? 'এই নম্বরের জন্য ছয় সংখ্যার যাচাইকরণ কোড:' : 'Six-digit verification code for mobile number:'}
              <strong className="neir-reg-phone"> {mobile}</strong></p>
            <p className="neir-reg-demo-warning">{isBn ? 'এটি প্রদর্শনী: কোনো SMS পাঠানো হয়নি।' :
              'Demonstration only: no SMS is sent and the document is not verified.'}</p>
          </> : <>
            <p>{isBn ? 'অক্ষর, সংখ্যা ও চিহ্ন দিয়ে একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন।' :
              'Create a strong password with a mix of letters, numbers and symbols.'}</p>
            <ul className="neir-reg-password-rules">
              {passwordRules.map((rule, i) => <li key={rule} className={rulesPassed[i] ? 'is-valid' : ''}>
                <Check aria-hidden="true" size={15} />{rule}
              </li>)}
            </ul>
          </>}
        </section>
        <section className="neir-reg-fields">
          {step === 1 && <>
            <div className="neir-reg-field">
              <label htmlFor="reg-mobile">{isBn ? 'মোবাইল নম্বর' : 'Enter Your Mobile Number'} <span aria-hidden="true">*</span></label>
              <UiInput id="reg-mobile" value={mobile} autoComplete="tel-national" required
                inputMode="numeric" maxLength={11} placeholder="Mobile Number (01XXXXXXXXX)"
                onChange={e => { onMobileChange(digitOnly(e.target.value, 11)); setError(''); }} />
            </div>
            <div className="neir-reg-field">
              <label htmlFor="reg-document">{isBn ? 'সিম কেনার সময় ব্যবহৃত নথির শেষ ৪ সংখ্যা' : 'Last 4 digits of Doc ID used to buy SIM'} <span aria-hidden="true">*</span></label>
              <UiInput id="reg-document" value={documentDigits} required maxLength={4}
                autoComplete="off" inputMode="numeric" placeholder="Type Last 4 Digits"
                onChange={e => {setDocumentDigits(digitOnly(e.target.value, 4)); setError('');}} />
            </div>
          </>}
          {step === 2 && <>
            <div className="neir-reg-field">
              <label id="reg-otp-label">{isBn ? 'ওটিপি লিখুন' : 'Enter OTP'} <span aria-hidden="true">*</span></label>
              <div className="neir-reg-otp-group" role="group" aria-labelledby="reg-otp-label">
                {Array.from({length:6}, (_, i) => (
                  <input key={i} id={i === 0 ? 'reg-otp' : `reg-otp-${i}`}
                    ref={el => { inputRefs.current[i] = el; }}
                    aria-label={isBn ? `কোড সংখ্যা ${i+1}` : `OTP digit ${i+1}`}
                    value={otp[i] || ''} maxLength={6} inputMode="numeric" autoComplete={i===0?'one-time-code':'off'}
                    onChange={e=>changeOtp(e.target.value,i)}
                    onPaste={e=>{e.preventDefault();changeOtp(e.clipboardData.getData('text'),0);}}
                    onKeyDown={e=>{if(e.key==='Backspace'&&!otp[i]&&i>0)inputRefs.current[i-1]?.focus();}}
                  />
                ))}
              </div>
            </div>
            <div className="neir-reg-otp-tools">
              <p className="neir-reg-timer" role="timer">{countdown}</p>
              <button type="button" className="neir-reg-resend" disabled={secondsRemaining > 0}
                onClick={generateDemoCode}><RefreshCw size={15} aria-hidden="true" /> {isBn ? 'আবার কোড নিন' : 'Re-send OTP'}</button>
            </div>
            {demoCode && <p className="neir-reg-demo-code" role="status">
              {isBn ? 'ডেমো কোড' : 'Demo code (not an SMS)'}: <strong>{demoCode}</strong>
            </p>}
          </>}
          {step === 3 && <>
            <div className="neir-reg-field">
              <label htmlFor="reg-pass">{isBn ? 'নতুন পাসওয়ার্ড' : 'Enter your New Password'} <span aria-hidden="true">*</span></label>
              <div className="neir-reg-password-wrap">
                <UiInput id="reg-pass" value={newPassword} minLength={8} maxLength={128}
                  type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  placeholder={isBn ? 'পাসওয়ার্ড লিখুন' : 'Type your password'}
                  onChange={e=>{setNewPassword(e.target.value);setError('');}} />
                <button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>
                  {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="neir-reg-field">
              <label htmlFor="reg-pass-confirm">{isBn ? 'নতুন পাসওয়ার্ড আবার লিখুন' : 'Re-Enter your New Password'} <span aria-hidden="true">*</span></label>
              <div className="neir-reg-password-wrap">
                <UiInput id="reg-pass-confirm" value={confirmation} maxLength={128}
                  autoComplete="new-password" type={showConfirmation?'text':'password'}
                  placeholder={isBn?'পাসওয়ার্ড আবার লিখুন':'Re-Type your password'}
                  onChange={e=>{setConfirmation(e.target.value);setError('');}} />
                <button type="button" aria-label={showConfirmation?'Hide confirmation':'Show confirmation'} onClick={()=>setShowConfirmation(v=>!v)}>
                  {showConfirmation?<EyeOff size={18}/>:<Eye size={18}/>}
                </button>
              </div>
            </div>
          </>}
          {error && <p role="alert" className="neir-original-field-error neir-reg-error">{error}</p>}
        </section>
      </div>
      <footer className="neir-reg-footer">
        <p className="neir-reg-demo-disclaimer">{isBn
          ? 'শুধুমাত্র প্রোটোটাইপ। এটি সরকারি পরিচয় যাচাই বা প্রকৃত অ্যাকাউন্ট তৈরি করে না।'
          : 'Prototype only. This does not verify identity or create a persistent citizen account.'}</p>
        <UiButton type="submit" variant="primary" className="neir-reg-submit">
          {step===1 ? (isBn?'ওটিপি অনুরোধ':'Request for OTP')
            :step===2 ? (isBn?'যাচাই করে এগিয়ে যান':'Verify and Proceed'):(isBn?'অ্যাকাউন্ট তৈরি করুন':'Create account')}
          <ArrowRight size={18} aria-hidden="true" />
        </UiButton>
      </footer>
      <p className="neir-reg-existing">{isBn ? 'আগেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
        <button type="button" onClick={onLogin}>{isBn?'লগইন':'Login'}</button>
      </p>
    </form>
  );
};
