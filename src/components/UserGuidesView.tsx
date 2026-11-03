import React, { useState } from 'react';
import type { Language } from '../types.ts';

type Props = { language: Language; onOpenLogin?: () => void };
type Guide = 'register' | 'reset';
const registration = [
  { title: 'Step 1: Initiate Account Registration', description: 'Access the system and click the “Register” button to begin the account creation process.', image: 'acc-guide-web-step-1.png' },
  { title: 'Step 2: Provide Mobile Number & Verification Details', description: 'Enter your mobile number and input the last four (4) digits of the document ID used at the time of SIM purchase. Click “Request OTP” to receive a one-time password on your registered mobile number.', image: 'acc-guide-web-step-2.png' },
  { title: 'Step 3: Request OTP & Verify OTP', description: 'Enter the received OTP and click “Verify and Proceed”.', image: 'acc-guide-web-step-3.png' },
  { title: 'Step 4: Set Account Password', description: 'Create a new password and re-enter it to confirm. Then click “Create Account” to complete the registration.', image: 'acc-guide-web-step-4.png' },
];
const mobileRegistration = [
  { title: 'Step 1: Initiate Account Registration', description: 'Access the system and click the “Log In” button to begin the account creation process.', image: 'acc-guide-mobile-step-1.png' },
  { title: 'Step 2: Proceed to Sign up', description: 'Click on the “Sign up” button to proceed registration.', image: 'acc-guide-mobile-step-2.png' },
  { title: 'Step 3: Provide Mobile Number & Verification Details', description: 'Enter your mobile number and input the last four (4) digits of the document ID used at the time of SIM purchase. Click “Request OTP” to receive a one-time password on your registered mobile number.', image: 'acc-guide-mobile-step-3.png' },
  { title: 'Step 4: Request OTP & Verify OTP', description: 'Enter the received OTP and click “Verify and Proceed”.', image: 'acc-guide-mobile-step-4.png' },
  { title: 'Step 5: Set Account Password', description: 'Create a new password and re-enter it to confirm. Then click “Create Account” to complete the registration.', image: 'acc-guide-mobile-step-5.png' },
];
const reset = [
  { title: 'Step 1: Open the Login Screen', description: 'Access the system and click the “Login” button to begin the Password Reset process', image: 'pwd-guide-web-step-1.png' },
  { title: 'Step 2: Select Reset Password', description: 'Tap “Reset Password” to begin the password reset process.', image: 'pwd-guide-web-step-2.png' },
  { title: 'Step 3: Enter Mobile Number', description: 'Your account is linked to a document ID (NID, Smart NID, Passport, etc.) that may have up to 10 registered mobile numbers. Enter any one of those numbers to receive an OTP and continue resetting your password.', image: 'pwd-guide-web-step-3.png' },
  { title: 'Step 4: Enter OTP', description: 'Enter the OTP sent to your registered mobile number. And then tap on “Verify And Proceed”.', image: 'pwd-guide-web-step-4.png' },
  { title: 'Step 5: Set and Confirm a New Password', description: 'Enter your new password and re-enter it to confirm. Tap “Reset Password” to complete the process.', image: 'pwd-guide-web-step-5.png' },
];
const bnRegistration = [
  ['ধাপ ১: অ্যাকাউন্ট নিবন্ধন শুরু করুন','পোর্টালে প্রবেশ করে নতুন অ্যাকাউন্ট তৈরির জন্য নিবন্ধন বাটন নির্বাচন করুন।'],
  ['ধাপ ২: মোবাইল ও পরিচয় যাচাইয়ের তথ্য দিন','মোবাইল নম্বর এবং সিম কেনার সময় ব্যবহৃত পরিচয়পত্রের শেষ চারটি সংখ্যা লিখে ওটিপি অনুরোধ করুন।'],
  ['ধাপ ৩: ওটিপি যাচাই করুন','পাওয়া ওটিপি লিখে যাচাই করে পরবর্তী ধাপে যান।'],
  ['ধাপ ৪: পাসওয়ার্ড নির্ধারণ করুন','নতুন পাসওয়ার্ড লিখুন এবং নিশ্চিত করে অ্যাকাউন্ট তৈরি করুন।'],
];
const bnMobileRegistration = [
  ['ধাপ ১: নিবন্ধন শুরু করুন','মোবাইলে পোর্টাল খুলে লগইন বাটন চাপুন।'],
  ['ধাপ ২: সাইন আপ নির্বাচন করুন','নতুন অ্যাকাউন্ট তৈরির জন্য সাইন আপ নির্বাচন করুন।'],
  ...bnRegistration.slice(1).map(([title,description],index)=>['ধাপ '+(index+3)+': '+title.split(': ')[1],description]),
];
const bnPasswordReset = [
  ['ধাপ ১: লগইন পৃষ্ঠা খুলুন','পোর্টালের লগইন পৃষ্ঠা খুলে পাসওয়ার্ড পুনর্নির্ধারণ প্রক্রিয়া শুরু করুন।'],
  ['ধাপ ২: পাসওয়ার্ড পুনর্নির্ধারণ নির্বাচন করুন','পাসওয়ার্ড ভুলে গেলে Forgot Password অপশন নির্বাচন করুন।'],
  ['ধাপ ৩: নিবন্ধিত মোবাইল নম্বর লিখুন','অ্যাকাউন্টের সঙ্গে যুক্ত মোবাইল নম্বর লিখে ওটিপি অনুরোধ করুন।'],
  ['ধাপ ৪: ওটিপি যাচাই করুন','নিবন্ধিত নম্বরে আসা ওটিপি লিখে পরিচয় নিশ্চিত করুন।'],
  ['ধাপ ৫: নতুন পাসওয়ার্ড দিন','নতুন পাসওয়ার্ড লিখে নিশ্চিত করুন, তারপর অ্যাকাউন্টে লগইন করুন।'],
];
export const UserGuidesView: React.FC<Props> = ({language}) => {
  const [guide,setGuide] = useState<Guide>('register');
  const [platform,setPlatform] = useState<'web' | 'mobile'>('web');
  const [broken,setBroken] = useState<string[]>([]);
  const isBn = language === 'bn';
  const isReg = guide === 'register';
  const isMobileReg = isReg && platform === 'mobile';
  const steps = isMobileReg ? mobileRegistration : isReg ? registration : reset;
  const bnSteps = isMobileReg ? bnMobileRegistration : isReg ? bnRegistration : bnPasswordReset;
  const base = isReg ? (isMobileReg ? 'acc-guide-mobile-steps/' : 'acc-guide-web-steps/') : 'pwd-guide-web-steps/';
  const fullImage = isReg ? (isMobileReg ? 'acc-guide-mobile-full-process.png' : 'acc-guide-web-full-process.png') : 'pwd-guide-web-full-process.png';
  const url = (file:string) => import.meta.env.BASE_URL + 'neir-source/user-guides/' + base + file;
  const image = (file:string, alt:string) => broken.includes(file)
    ? <div className="bg-slate-50 border rounded-2xl py-12 px-4 text-center text-sm text-slate-500">Illustration unavailable: {alt}</div>
    : <img src={url(file)} alt={alt} loading="lazy" onError={() => setBroken(v => [...v, file])} className="w-full rounded-xl object-contain border border-slate-100 bg-white" />;
  return <section className="neir-source-subpage neir-source-guide-page space-y-8">
    <header className="text-center space-y-3"><h1 className="text-3xl md:text-[44px] text-slate-950 font-bold">{isBn ? 'NEIR ব্যবহার নির্দেশিকা' : 'User Guide of NEIR'}</h1>
      <p className="text-base sm:text-lg text-slate-700">{isBn ? 'পোর্টালের সেবাগুলো সহজে ব্যবহার করার ধাপে ধাপে নির্দেশিকা।' : 'A complete user guide to help you navigate the system.'}</p></header>
    <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xl mx-auto">
      <button onClick={() => {setGuide('register');setPlatform('web');}} aria-pressed={isReg} className="neir-ui-choice-tab neir-source-guide-tile"><img className="neir-source-guide-tile-img" src={`${import.meta.env.BASE_URL}neir-source/user-guides/tab-img/acc-reg.png`} alt=""/>{isBn ? 'অ্যাকাউন্ট নিবন্ধন' : 'Account Registration'}</button>
      <button onClick={() => {setGuide('reset');setPlatform('web');}} aria-pressed={!isReg} className="neir-ui-choice-tab neir-source-guide-tile"><img className="neir-source-guide-tile-img" src={`${import.meta.env.BASE_URL}neir-source/user-guides/tab-img/pwd-res.png`} alt=""/>{isBn ? 'পাসওয়ার্ড পুনর্নির্ধারণ' : 'Password Reset'}</button>
    </div>
    <div className="neir-source-guide-content bg-white rounded-[32px] p-5 sm:p-8 lg:p-12 space-y-7">
      <div className="neir-source-guide-intro space-y-4"><h2 className="text-2xl sm:text-3xl font-semibold">{isBn ? (isReg ? 'অ্যাকাউন্ট নিবন্ধন' : 'পাসওয়ার্ড পুনর্নির্ধারণ') : (isReg ? 'Account Registration' : 'Password Reset')}</h2>
        <p className="leading-relaxed text-slate-700">{isReg
          ? 'Account registration feature allows you to verify your identity, securely manage your registered devices and SIMs, check their status, and access services like device whitelisting, ensuring only legally registered devices are connected to you.'
          : 'Use this feature if you forget your password or cannot sign in. Enter any registered mobile number linked to your account. An OTP will be sent to that number to verify your identity and help you create a new password.'}</p>
        <p className="font-medium text-slate-900">{isBn ? (isReg ? 'অ্যাকাউন্ট তৈরির সহজ ধাপগুলো অনুসরণ করুন।' : 'পাসওয়ার্ড পরিবর্তনের ধাপগুলো অনুসরণ করুন।') : (isReg ? 'Quick steps to help you create your account easily.' : 'Quick steps to help you reset your password easily.')}</p></div>
      <div className="neir-source-guide-platform flex gap-2 border-b border-slate-200 pb-3" role="tablist" aria-label="Guide platform">
        <button role="tab" aria-selected={platform === 'web'} onClick={() => setPlatform('web')} className="neir-guide-platform-tab">{isBn ? 'ওয়েব' : 'Web'}</button>
        <button role="tab" aria-selected={platform === 'mobile'} onClick={() => setPlatform('mobile')} className="neir-guide-platform-tab">{isBn ? 'মোবাইল' : 'Mobile'}</button>
      </div>
        <div className="space-y-10">{steps.map((step,index) => <article key={step.title} className="neir-guide-step-card grid grid-cols-1 md:grid-cols-2 items-center gap-5 md:gap-8">
          <div className="neir-guide-step-text"><h3 className="text-lg sm:text-xl font-semibold mb-3">{isBn ? bnSteps[index]?.[0] : step.title}</h3><p className="text-sm sm:text-base text-slate-700 leading-7">{isBn ? bnSteps[index]?.[1] : step.description}</p></div>
          <div className="neir-guide-step-visual">{image(step.image, step.title)}</div>
        </article>)}
          <div className="neir-guide-overview pt-5 border-t space-y-4"><h3 className="text-xl font-semibold">{isBn ? (isReg ? 'নিবন্ধন প্রক্রিয়া এক নজরে' : 'পাসওয়ার্ড পুনর্নির্ধারণ এক নজরে') : (isReg ? 'User Registration Process at a glance' : 'Reset Password Process at a glance')}</h3>
          {image(fullImage, 'Complete ' + (isReg ? 'registration' : 'password reset') + ' process')}</div>
        </div>
    </div>
  </section>;
};
