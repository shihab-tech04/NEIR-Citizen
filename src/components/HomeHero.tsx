import React, {useState} from 'react';
import type {Language} from '../types.ts';
import {Info, ArrowRight} from 'lucide-react';
import { UiInput, UiButton } from '../ui/index.ts';
type Props = {language:Language; onScrollToVerifier:()=>void; onOpenGuides:()=>void};
export const HomeHero:React.FC<Props> = ({language}) => {
  const [imei,setImei]=useState('');
  const [error,setError]=useState('');
  const [demoResult,setDemoResult]=useState('');
  const bn=language==='bn';
  const verify=(event:React.FormEvent)=>{
    event.preventDefault();setError('');setDemoResult('');
    if(!/^\d{14}$/.test(imei)){setError(bn?'আইএমইআই-এর প্রথম ১৪টি সংখ্যা লিখুন।':'Please enter the first 14 digits of your IMEI.');return;}
    setDemoResult(bn?'ডিভাইসের তথ্য জানতে আমার প্রোফাইলের IMEI অনুসন্ধান ব্যবহার করুন।':'Open My Profile to search device details and registration status.');
  };
  return <section className="neir-source-hero" aria-label={bn ? 'NEIR IMEI যাচাই' : 'NEIR IMEI verification'}>
    <div className="neir-source-hero-inner">
      <div className="neir-source-hero-copy">
        <h1>{bn?'ন্যাশনাল ইকুইপমেন্ট আইডেন্টিটি রেজিস্টার (NEIR)':'National Equipment Identity Register (NEIR)'}</h1>
        <p className="neir-source-description">{bn?'বাংলাদেশের মোবাইল ডিভাইস ডাটাবেসে আপনার ফোনের আইএমইআই নম্বর যাচাই করুন।':"Search your phone's IMEI to view its device information and registration status."}</p>
        <div className="neir-source-verification-card" id="imei-verifier">
          <h2>{bn?'আপনার ফোনের ভেরিফিকেশন স্ট্যাটাস দেখুন':"Check Your phone's Verification Status instantly"}</h2>
          <form onSubmit={verify} noValidate>
            <div className="neir-source-input-wrap">
              <label className="sr-only" htmlFor="neir-imei-input">{bn ? 'IMEI নম্বরের প্রথম ১৪টি সংখ্যা লিখুন' : 'Please enter the first 14 digits of your IMEI'}</label>
              <p className="neir-source-imei-mobile-label" aria-hidden="true">{bn ? 'IMEI নম্বরের প্রথম ১৪টি সংখ্যা' : 'First 14 digits of your IMEI'}</p>
              <UiInput id="neir-imei-input" uiSize="default" type="text" inputMode="numeric" maxLength={14} minLength={14} placeholder={bn ? 'IMEI নম্বরের প্রথম ১৪টি সংখ্যা লিখুন' : 'Please enter the first 14 digits of your IMEI'} value={imei} onChange={e=>{setImei(e.target.value.replace(/\D/g,'').slice(0,14));setError('');setDemoResult('');}}/>
              <span className="neir-source-imei-help" title={bn ? '১৫-সংখ্যার IMEI জানতে *#06# ডায়াল করুন' : 'Dial *#06# to find the 15-digit IMEI'} aria-label={bn ? 'IMEI সহায়তা' : 'IMEI help'}><Info size={16}/></span>
            </div>
            <UiButton variant="primary" className="neir-source-verify-button" type="submit"><span className="neir-source-verify-long">{bn?'ফোনের স্ট্যাটাস যাচাই করুন':"Check phone's Verification Status now"}</span><span className="neir-source-verify-short">{bn?'যাচাই':'check'}</span><ArrowRight size={20}/></UiButton>
            {error && <p className="neir-source-error" role="alert">{error}</p>}
            {demoResult && <p className="neir-source-demo-result" role="status">{demoResult}</p>}
          </form>
        </div>
      </div>
      <div className="neir-source-hero-media">
        <img src={`${import.meta.env.BASE_URL}neir-source/gifs/neir-herobanner.gif`} alt={bn ? 'NEIR ডিভাইস যাচাইয়ের চিত্র' : 'NEIR handset verification illustration'} decoding="async"/>
      </div>
    </div>
  </section>;
};