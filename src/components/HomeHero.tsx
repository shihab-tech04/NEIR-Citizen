/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types.ts';
import { ShieldCheck, Bell, Smartphone, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';

interface HomeHeroProps {
  language: Language;
  onScrollToVerifier: () => void;
  onOpenGuides: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  language,
  onScrollToVerifier,
  onOpenGuides,
}) => {
  const isBn = language === 'bn';

  return (
    <div className="w-full space-y-4">
      {/* Official Announcement Marquee / Notice Bar */}
      <div className="bg-emerald-900 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-3 shadow-xs overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-300 shrink-0 bg-emerald-950 px-2.5 py-1 rounded">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>{isBn ? 'জরুরি বিজ্ঞপ্তি' : 'Official Notice'}</span>
        </div>
        <div className="truncate text-emerald-100 text-xs">
          {isBn
            ? 'মোবাইল ফোন হ্যান্ডসেট ক্রয়ের পূর্বে মেসেজ অপশনে KYD <space> ১৫ ডিজিটের IMEI লিখে ১৬০০২ নম্বরে পাঠিয়ে হ্যান্ডসেটের বৈধতা নিশ্চিত করুন।'
            : 'Before purchasing any mobile phone handset, verify its authenticity by sending SMS: KYD <space> 15 digit IMEI to 16002.'}
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-linear-to-r from-[#006a4e] via-[#055c45] to-[#014130] rounded-2xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-emerald-400/5 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-xs border border-white/10">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>
              {isBn ? 'জাতীয় সরঞ্জাম পরিচয় রেজিস্টার (এনইআইআর)' : 'National Equipment Identity Register (NEIR)'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {isBn
              ? 'বৈধ মোবাইল ফোন ব্যবহার করি, নিরাপদ বাংলাদেশ গড়ি'
              : 'Verify & Register Your Mobile Handset Legitimacy'}
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm md:text-base leading-relaxed">
            {isBn
              ? 'বিটিআরসি কর্তৃক পরিচালিত এনইআইআর সিস্টেমে আপনার ব্যবহৃত মোবাইল হ্যান্ডসেটের আইএমইআই (IMEI) নম্বর যাচাই করুন এবং বিদেশ থেকে ব্যক্তিগতভাবে আনীত হ্যান্ডসেটের দ্রুত নিবন্ধন সম্পন্ন করুন।'
              : 'Ensure telecommunication security, verify handset legitimacy in the central BTRC database, and register privately imported mobile devices under your National ID.'}
          </p>

          {/* Quick Metrics / Key Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-black/20 p-2.5 rounded-lg border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-emerald-200 block">
                {isBn ? 'কেন্দ্রীয় ডাটাবেজ' : 'Central Registry'}
              </span>
              <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'সক্রিয় ও সংযুক্ত' : 'Active & Synced'}</span>
              </span>
            </div>

            <div className="bg-black/20 p-2.5 rounded-lg border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-emerald-200 block">
                {isBn ? 'এসএমএস ভেরিফিকেশন' : 'Direct SMS Lookup'}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-300">
                16002 (KYD)
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-black/20 p-2.5 rounded-lg border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] text-emerald-200 block">
                {isBn ? 'নাগরিক সেবা হেল্পলাইন' : 'Toll-Free Support'}
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                100 (BTRC)
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onScrollToVerifier}
              className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-slate-900" />
              <span>{isBn ? 'এখনই আইএমইআই যাচাই করুন' : 'Verify IMEI Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenGuides}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>{isBn ? 'ব্যবহার নির্দেশিকা দেখুন' : 'View User Guides'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
