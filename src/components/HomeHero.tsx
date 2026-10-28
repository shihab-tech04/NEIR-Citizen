import React, {useState} from 'react';
import type {Language} from '../types.ts';
import {Info, ArrowRight} from 'lucide-react';
type Props = {language:Language; onScrollToVerifier:()=>void; onOpenGuides:()=>void};
export const HomeHero:React.FC<Props> = ({language}) => {
  const [imei,setImei]=useState('');
  const [error,setError]=useState('');
  const [demoResult,setDemoResult]=useState('');
  const bn=language==='bn';
  const verify=(event:React.FormEvent)=>{
    event.preventDefault();setError('');setDemoResult('');
    if(!/^\d{14}$/.test(imei)){setError(bn?'আইএমইআই-এর প্রথম ১৪টি সংখ্যা লিখুন।':'Please enter the first 14 digits of your IMEI.');return;}
    setDemoResult(bn?'ডেমো: প্রকৃত NEIR ডাটাবেজ যাচাই হয়নি।':'Demo only: no live BTRC/NEIR device lookup was performed.');
  };
  return <section className="neir-source-hero" aria-label="NEIR IMEI verification">
    <div className="neir-source-hero-inner">
      <div className="neir-source-hero-copy">
        <h1>{bn?'ন্যাশনাল ইকুইপমেন্ট আইডেন্টিটি রেজিস্টার (NEIR)':'National Equipment Identity Register (NEIR)'}</h1>
        <p className="neir-source-description">{bn?'বাংলাদেশের মোবাইল ডিভাইস ডাটাবেসে আপনার ফোনের আইএমইআই নম্বর যাচাই করুন।':"Verify your phone's IMEI number with the official Bangladesh Mobile Device Database. Find out if your device is authentic, imported legally, and not reported as lost, stolen, or cloned."}</p>
        <div className="neir-source-verification-card" id="imei-verifier">
          <h2>{bn?'আপনার ফোনের ভেরিফিকেশন স্ট্যাটাস দেখুন':"Check Your phone's Verification Status instantly"}</h2>
          <form onSubmit={verify} noValidate>
            <div className="neir-source-input-wrap">
              <label className="sr-only" htmlFor="neir-imei-input">Please enter the first 14 digits of your IMEI</label>
              <p className="neir-source-imei-mobile-label" aria-hidden="true">First 14 digits of your IMEI</p>
              <input id="neir-imei-input" type="text" inputMode="numeric" maxLength={14} minLength={14} placeholder="Please enter the first 14 digits of your IMEI" value={imei} onChange={e=>{setImei(e.target.value.replace(/\D/g,'').slice(0,14));setError('');setDemoResult('');}}/>
              <span className="neir-source-imei-help" title="Dial *#06# to find the 15-digit IMEI" aria-label="IMEI help"><Info size={16}/></span>
            </div>
            <button className="neir-source-verify-button" type="submit"><span className="neir-source-verify-long">{bn?'ফোনের স্ট্যাটাস যাচাই করুন':"Check phone's Verification Status now"}</span><span className="neir-source-verify-short">{bn?'যাচাই':'check'}</span><ArrowRight size={20}/></button>
            {error && <p className="neir-source-error" role="alert">{error}</p>}
            {demoResult && <p className="neir-source-demo-result" role="status">{demoResult}</p>}
          </form>
        </div>
      </div>
      <div className="neir-source-hero-media">
        <img src={`${import.meta.env.BASE_URL}neir-source/gifs/neir-herobanner.gif`} alt="Official NEIR handset verification illustration" decoding="async"/>
      </div>
    </div>
  </section>;
};