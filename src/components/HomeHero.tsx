import React, { useState } from 'react';
import type { Language } from '../types.ts';
import { Info, Search, Smartphone } from 'lucide-react';

type Props = { language: Language; onScrollToVerifier: () => void; onOpenGuides: () => void };
export const HomeHero: React.FC<Props> = ({ language }) => {
  const [imei, setImei] = useState('');
  const [error, setError] = useState('');
  const [demoResult, setDemoResult] = useState('');
  const [hasImage, setHasImage] = useState(true);
  const isBn = language === 'bn';
  const verify = (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setDemoResult('');
    if (!/^\d{14}$/.test(imei)) {
      setError(isBn ? 'অনুগ্রহ করে আইএমইআই-এর প্রথম ১৪টি সংখ্যা লিখুন।' : 'Please enter the first 14 digits of your IMEI.');
      return;
    }
    setDemoResult(isBn
      ? 'শুধুমাত্র ডেমো: ইনপুট যাচাই হয়েছে। এটি প্রকৃত NEIR ডাটাবেজে অনুসন্ধান করেনি।'
      : 'Demonstration only: the IMEI format is valid. No live NEIR database verification was performed.');
  };
  return (
    <section className="w-full rounded-b-[32px] bg-[#E0F7FA] px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 lg:gap-16">
        <div className="space-y-5">
          <h1 className="font-bold tracking-tight leading-tight text-[30px] sm:text-[38px] xl:text-[46px] text-slate-950">
            {isBn ? 'ন্যাশনাল ইকুইপমেন্ট আইডেন্টিটি রেজিস্টার (NEIR)' : 'National Equipment Identity Register (NEIR)'}
          </h1>
          <p className="text-base sm:text-lg text-slate-900 leading-relaxed">
            {isBn
              ? 'বাংলাদেশের অফিসিয়াল মোবাইল ডিভাইস ডাটাবেসে আপনার ফোনের IMEI নম্বর যাচাই করুন।'
              : "Verify your phone's IMEI number with the official Bangladesh Mobile Device Database. Find out if your device is authentic, imported legally, and not reported as lost, stolen, or cloned."}
          </p>
          <div id="imei-verifier" className="rounded-[24px] bg-white p-5 sm:p-7 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              {isBn ? 'আপনার ফোনের ভেরিফিকেশন স্ট্যাটাস দেখুন' : "Check Your phone's Verification Status instantly"}
            </h2>
            <form onSubmit={verify} className="space-y-3">
              <label htmlFor="neir-imei-input" className="sr-only">First 14 digits of your IMEI</label>
              <div className="relative">
                <input id="neir-imei-input" className="w-full border border-slate-300 rounded-[20px] px-5 py-4 pr-12 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:outline-none" type="text"
                  inputMode="numeric" autoComplete="off" maxLength={14} minLength={14}
                  placeholder="Please enter the first 14 digits of your IMEI"
                  value={imei} onChange={e => {setImei(e.target.value.replace(/\D/g, '').slice(0,14));setError('');setDemoResult('');}} />
                <span title="IMEI can be found by dialing *#06#" className="absolute right-4 top-4 text-slate-400"><Info size={19} /></span>
              </div>
              <button type="submit" className="w-full rounded-[16px] bg-[#00ACC1] hover:bg-[#00838F] text-white py-3.5 font-semibold flex justify-center items-center gap-2">
                <Search size={18} /> {isBn ? 'ফোনের ভেরিফিকেশন স্ট্যাটাস যাচাই করুন' : "Check phone's Verification Status now"}
              </button>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              {demoResult && <p role="status" className="rounded-lg bg-sky-50 text-sky-900 p-3 text-sm">{demoResult}</p>}
            </form>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[250px]">
          {hasImage
            ? <img src="https://testcitizenportal.neir.btrc.gov.bd/assets/gifs/neir-herobanner.gif" alt="NEIR mobile handset verification illustration" loading="lazy" onError={() => setHasImage(false)} className="w-full max-w-lg h-auto object-contain" />
            : <div className="flex flex-col gap-4 items-center justify-center w-full h-[310px] text-cyan-800 bg-white/60 rounded-[32px]"><Smartphone size={94} strokeWidth={1.2} /><p className="font-semibold">NEIR Citizen Portal</p></div>}
        </div>
      </div>
    </section>
  );
};
