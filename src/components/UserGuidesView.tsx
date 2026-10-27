import React, { useState } from 'react';
import type { Language } from '../types.ts';

type Props = { language: Language; onOpenLogin: () => void };
type Guide = 'register' | 'reset';
const registration = [
  { title: 'Step 1: Initiate Account Registration', description: 'Access the system and click the “Register” button to begin the account creation process.', image: 'acc-guide-web-step-1.png' },
  { title: 'Step 2: Provide Mobile Number & Verification Details', description: 'Enter your mobile number and input the last four (4) digits of the document ID used at the time of SIM purchase. Click “Request OTP” to receive a one-time password on your registered mobile number.', image: 'acc-guide-web-step-2.png' },
  { title: 'Step 3: Request OTP & Verify OTP', description: 'Enter the received OTP and click “Verify and Proceed”.', image: 'acc-guide-web-step-3.png' },
  { title: 'Step 4: Set Account Password', description: 'Create a new password and re-enter it to confirm. Then click “Create Account” to complete the registration.', image: 'acc-guide-web-step-4.png' },
];
const reset = [
  { title: 'Step 1: Open the Login Screen', description: 'Access the system and click the “Login” button to begin the Password Reset process', image: 'pwd-guide-web-step-1.png' },
  { title: 'Step 2: Select Reset Password', description: 'Tap “Reset Password” to begin the password reset process.', image: 'pwd-guide-web-step-2.png' },
  { title: 'Step 3: Enter Mobile Number', description: 'Your account is linked to a document ID (NID, Smart NID, Passport, etc.) that may have up to 10 registered mobile numbers. Enter any one of those numbers to receive an OTP and continue resetting your password.', image: 'pwd-guide-web-step-3.png' },
  { title: 'Step 4: Enter OTP', description: 'Enter the OTP sent to your registered mobile number. And then tap on “Verify And Proceed”.', image: 'pwd-guide-web-step-4.png' },
  { title: 'Step 5: Set and Confirm a New Password', description: 'Enter your new password and re-enter it to confirm. Tap “Reset Password” to complete the process.', image: 'pwd-guide-web-step-5.png' },
];
export const UserGuidesView: React.FC<Props> = () => {
  const [guide,setGuide] = useState<Guide>('register');
  const [platform,setPlatform] = useState<'web' | 'mobile'>('web');
  const [broken,setBroken] = useState<string[]>([]);
  const isReg = guide === 'register';
  const steps = isReg ? registration : reset;
  const base = isReg ? 'acc-guide-web-steps/' : 'pwd-guide-web-steps/';
  const fullImage = isReg ? 'acc-guide-web-full-process.png' : 'pwd-guide-web-full-process.png';
  const url = (file:string) => '/neir-source/user-guides/' + base + file;
  const image = (file:string, alt:string) => broken.includes(file)
    ? <div className="bg-slate-50 border rounded-2xl py-12 px-4 text-center text-sm text-slate-500">Reference illustration unavailable offline: {alt}</div>
    : <img src={url(file)} alt={alt} loading="lazy" onError={() => setBroken(v => [...v, file])} className="w-full rounded-xl object-contain border border-slate-100 bg-white" />;
  return <section className="max-w-[1300px] mx-auto space-y-8 py-6">
    <header className="text-center space-y-3"><h1 className="text-3xl md:text-[44px] text-slate-950 font-bold">User Guide of NEIR</h1>
      <p className="text-base sm:text-lg text-slate-700">A complete user guide to help you navigate the system.</p></header>
    <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xl mx-auto">
      <button onClick={() => {setGuide('register');setPlatform('web');}} aria-pressed={isReg} className={isReg ? 'bg-white border-[8px] border-[#00ACC1] text-[#00838F] rounded-3xl p-5 text-sm font-semibold' : 'bg-white border border-slate-200 rounded-3xl p-5 text-sm font-semibold'}><img className="neir-source-guide-tile-img" src="/neir-source/user-guides/tab-img/acc-reg.png" alt=""/>Account Registration</button>
      <button onClick={() => {setGuide('reset');setPlatform('web');}} aria-pressed={!isReg} className={!isReg ? 'bg-[#E0F7FA] border-2 border-[#00ACC1] text-[#00838F] rounded-3xl p-5 text-sm font-semibold' : 'bg-white border border-slate-200 rounded-3xl p-5 text-sm font-semibold'}><img className="neir-source-guide-tile-img" src="/neir-source/user-guides/tab-img/pwd-res.png" alt=""/>Password Reset</button>
    </div>
    <div className="bg-white rounded-[32px] p-5 sm:p-8 lg:p-12 space-y-7">
      <div className="space-y-4"><h2 className="text-2xl sm:text-3xl font-semibold">{isReg ? 'Account Registration' : 'Password Reset'}</h2>
        <p className="leading-relaxed text-slate-700">{isReg
          ? 'Account registration feature allows you to verify your identity, securely manage your registered devices and SIMs, check their status, and access services like device whitelisting, ensuring only legally registered devices are connected to you.'
          : 'Use this feature if you forget your password or cannot sign in. Enter any registered mobile number linked to your account. An OTP will be sent to that number to verify your identity and help you create a new password.'}</p>
        <p className="font-medium text-slate-900">{isReg ? 'Quick steps to help you create your account easily.' : 'Quick steps to help you reset your password easily.'}</p></div>
      <div className="flex gap-2 border-b border-slate-200 pb-3" role="tablist" aria-label="Guide platform">
        <button role="tab" aria-selected={platform === 'web'} onClick={() => setPlatform('web')} className={platform === 'web' ? 'bg-[#00ACC1] text-white rounded-xl py-2 px-6 font-semibold' : 'rounded-xl py-2 px-6 bg-slate-100'}>Web</button>
        <button role="tab" aria-selected={platform === 'mobile'} onClick={() => setPlatform('mobile')} className={platform === 'mobile' ? 'bg-[#00ACC1] text-white rounded-xl py-2 px-6 font-semibold' : 'rounded-xl py-2 px-6 bg-slate-100'}>Mobile</button>
      </div>
      {platform === 'mobile' ? <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-sm">The supplied HTML captures the Web guide. The original Mobile instructions are not available in this reference set, so they have not been invented for the prototype.</div>
        : <div className="space-y-10">{steps.map((step,index) => <article key={step.title} className="grid grid-cols-1 md:grid-cols-2 items-start gap-5 md:gap-8">
          <div><h3 className="text-lg sm:text-xl font-semibold mb-3">{step.title}</h3><p className="text-sm sm:text-base text-slate-700 leading-7">{step.description}</p></div>
          <div>{image(step.image, step.title)}</div>
        </article>)}
          <div className="pt-5 border-t space-y-4"><h3 className="text-xl font-semibold">{isReg ? 'User Registration Process at a glance' : 'Reset Password Process at a glance'}</h3>
          {image(fullImage, 'Complete ' + (isReg ? 'registration' : 'password reset') + ' process')}</div>
        </div>}
    </div>
  </section>;
};
