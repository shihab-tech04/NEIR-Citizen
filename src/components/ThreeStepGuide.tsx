/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { Phone, MessageSquare, ShieldCheck, ArrowRight, Smartphone, Check, Sparkles } from 'lucide-react';

interface ThreeStepGuideProps {
  language: Language;
  onOpenMobileGuide: () => void;
  onOpenWebGuide: () => void;
}

export const ThreeStepGuide: React.FC<ThreeStepGuideProps> = ({
  language,
  onOpenMobileGuide,
  onOpenWebGuide,
}) => {
  const isBn = language === 'bn';

  // Interactive micro-simulation state for steps
  const [dialStepCompleted, setDialStepCompleted] = useState(false);
  const [smsSimSent, setSmsSimSent] = useState(false);

  return (
    <section className="w-full bg-white rounded-xl shadow-xs border border-slate-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006a4e]">
            {isBn ? 'সহজ ৩টি ধাপ' : 'Easy 3 Steps'}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            {isBn
              ? 'মোবাইল ফোন হ্যান্ডসেট যাচাই ও নিবন্ধনের নিয়মাবলী'
              : 'Official Steps for Handset Verification & Registration'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenWebGuide}
          className="text-xs font-semibold text-[#006a4e] hover:text-[#044c38] flex items-center gap-1 cursor-pointer"
        >
          <span>{isBn ? 'বিস্তারিত সম্পূর্ণ গাইড' : 'View Full Guide'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ১
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {isBn ? 'ধাপ ১: আইএমইআই জানা' : 'Step 1: Find IMEI'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-slate-900 font-semibold text-sm">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>*#06# {isBn ? 'ডায়াল করুন' : 'Dial *#06#'}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'আপনার হ্যান্ডসেটের ডায়াল অপশনে গিয়ে *#06# চাপুন। সাথে সাথে স্ক্রিনে ১৫ ডিজিটের আইএমইআই (IMEI) নম্বর ভেসে উঠবে।'
                : 'Open your mobile phone dialer and press *#06#. Your 15-digit IMEI number will appear instantly on screen.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setDialStepCompleted(!dialStepCompleted)}
              className="w-full text-xs font-semibold py-2 px-3 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {dialStepCompleted
                  ? (isBn ? '✓ আইএমইআই: ৩৫২০৯৩০৮১২৩৪৫৬৭' : '✓ IMEI: 352093081234567')
                  : (isBn ? 'ডায়াল টেস্ট করুন' : 'Test Dial Mock')}
              </span>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ২
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {isBn ? 'ধাপ ২: এসএমএস বা অনলাইন' : 'Step 2: Verify SMS / Web'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-slate-900 font-semibold text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>KYD &lt;space&gt; 15 Digit IMEI</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'মেসেজ অপশনে গিয়ে KYD লিখে স্পেস দিয়ে ১৫ ডিজিটের আইএমইআই লিখে ১৬০০২ নম্বরে পাঠান অথবা এই পোর্টালে সার্চ করুন।'
                : 'Write KYD followed by a space and your 15-digit IMEI, then send to 16002, or verify directly in this portal.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSmsSimSent(!smsSimSent)}
              className="w-full text-xs font-semibold py-2 px-3 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {smsSimSent
                  ? (isBn ? '✓ ১৬০০২ ফিরতি এসএমএস: হ্যান্ডসেটটি বৈধ' : '✓ 16002 Reply: Handset is Valid')
                  : (isBn ? 'এসএমএস নমুনা দেখুন' : 'Simulate SMS to 16002')}
              </span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ৩
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {isBn ? 'ধাপ ৩: হ্যান্ডসেট নিবন্ধন' : 'Step 3: Registration'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'নাগরিক পোর্টালে নিবন্ধন' : 'Citizen Portal Registration'}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'বিদেশ হতে ব্যক্তিগতভাবে আনা বা উপহার হিসেবে পাওয়া হ্যান্ডসেট পাসপোর্ট ও কাস্টমস শুল্ক স্লিপ দিয়ে পোর্টালে নিবন্ধন করুন।'
                : 'Register foreign-purchased or gifted mobile phones by logging into your citizen portal account with luggage customs slip.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onOpenWebGuide}
              className="w-full text-xs font-semibold py-2 px-3 rounded bg-[#006a4e] hover:bg-[#044c38] text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isBn ? 'নিবন্ধন গাইড পড়ুন' : 'Read Registration Guide'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
