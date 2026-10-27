import React, { useState } from 'react';
import type { Language } from '../types.ts';
import { ArrowRight, Info } from 'lucide-react';

type Props = { language: Language; onScrollToVerifier: () => void; onOpenGuides: () => void };
export const HomeHero: React.FC<Props> = ({ language }) => {
 const [imei,setImei]=useState(''); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
 const [imageSrc,setImageSrc]=useState('https://192.168.105.108/assets/gifs/neir-herobanner.gif');
 const isBn=language==='bn';
 function submit(e: React.FormEvent) {
  e.preventDefault(); setError(''); setNotice('');
  if(!/^\\d{14}$/.test(imei)) {setError('Please enter the first 14 digits of your IMEI.');return;}
  setNotice('Demo only: IMEI format validated. No official NEIR lookup was performed.');
 }
 return <section className="neir-source-hero w-full bg-[#e0f7fa]">
   <div className="mx-auto max-w-[1328px] w-full px-4 sm:px-6 py-16 lg:py-[68px] grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-[52px] items-center">
    <div className="min-w-0">
      <h1 className="text-black font-bold text-[30px] md:text-[37px] lg:text-[43px] leading-[1.48] tracking-tight mb-3">{isBn?'ন্যাশনাল ইকুইপমেন্ট আইডেন্টিটি রেজিস্টার (NEIR)':'National Equipment Identity Register (NEIR)'}</h1>
      <p className="text-black text-[16px] md:text-[18px] leading-[1.6] mb-4">{isBn?'বাংলাদেশের মোবাইল ডিভাইস ডাটাবেসে আপনার ফোনের IMEI যাচাই করুন।':"Verify your phone's IMEI number with the official Bangladesh Mobile Device Database. Find out if your device is authentic, imported legally, and not reported as lost, stolen, or cloned."}</p>
      <div id="imei-verifier" className="bg-white rounded-[24px] p-[30px]">
       <h2 className="font-semibold text-black text-[18px] md:text-[19px] leading-7 mb-4">Check Your phone's Verification Status instantly</h2>
       <form onSubmit={submit} className="space-y-3">
        <label className="sr-only" htmlFor="neir-imei">First 14 digits of your IMEI</label>
        <div className="relative"><input id="neir-imei" inputMode="numeric" maxLength={14} autoComplete="off" value={imei} onChange={e=>setImei(e.target.value.replace(/\\D/g,'').slice(0,14))} placeholder="Please enter the first 14 digits of your IMEI" className="w-full h-[56px] rounded-full border border-[#d1dce8] px-6 pr-12 text-[15px] text-slate-800 outline-none focus:border-[#00acc1]"/><Info size={16} className="absolute top-5 right-5 text-[#8198b5]"/></div>
        <button type="submit" className="w-full bg-[#00acc1] hover:bg-[#009cb0] text-white font-medium rounded-full h-[54px] px-5 flex justify-between items-center text-[15px]"><span>Check phone's Verification Status now</span><ArrowRight size={21}/></button>
       </form>
       {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-3 text-sm text-[#006677]">{notice}</p>}
      </div>
    </div>
    <div className="w-full rounded-[30px] bg-white flex items-center justify-center overflow-hidden min-h-[430px] lg:min-h-[545px]">
      <img src={imageSrc} onError={()=>{if(imageSrc.startsWith('https://192.'))setImageSrc('https://testcitizenportal.neir.btrc.gov.bd/assets/gifs/neir-herobanner.gif');else setImageSrc('');}} alt="NEIR mobile device verification" className={imageSrc?'w-full h-full object-contain':'hidden'} />
      {!imageSrc&&<p className="text-sm text-slate-600 p-6">Original NEIR illustration unavailable. Source asset required for visual parity.</p>}
    </div>
   </div>
 </section>;
};