/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { 
  Laptop, 
  Smartphone, 
  UserCheck, 
  KeyRound, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Phone, 
  Send,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface UserGuidesViewProps {
  language: Language;
  onOpenLogin: () => void;
}

export const UserGuidesView: React.FC<UserGuidesViewProps> = ({
  language,
  onOpenLogin,
}) => {
  const isBn = language === 'bn';

  // Active view: 'web' or 'mobile'
  const [guideMode, setGuideMode] = useState<'web' | 'mobile'>('web');
  
  // Specific guide tab
  const [activeGuideTopic, setActiveGuideTopic] = useState<'registration' | 'password_reset' | 'imported_handset'>('registration');

  // Interactive phone dialer mockup state
  const [dialedCode, setDialedCode] = useState('*#06#');
  const [dialResultVisible, setDialResultVisible] = useState(false);

  // Interactive SMS mockup state
  const [smsRecipient, setSmsRecipient] = useState('16002');
  const [smsBody, setSmsBody] = useState('KYD 352093081234567');
  const [smsResponses, setSmsResponses] = useState<string[]>([]);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const handleDialPress = (char: string) => {
    if (dialedCode.length < 10) {
      setDialedCode((prev) => prev + char);
    }
  };

  const handleDialSubmit = () => {
    if (dialedCode === '*#06#' || dialedCode.includes('*#06#')) {
      setDialResultVisible(true);
    } else {
      alert(isBn ? 'অনুগ্রহ করে *#06# ডায়াল করুন।' : 'Please dial *#06#');
    }
  };

  const handleSendSms = () => {
    if (!smsBody.trim()) return;
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setSmsResponses((prev) => [
        ...prev,
        isBn
          ? `[১৬০০২ বিটিআরসি]: হ্যান্ডসেটের আইএমইআই (৩৫২০৯৩০৮১২৩৪৫৬৭) বিটিআরসি ডাটাবেজে অন্তর্ভুক্ত রয়েছে। এটি বৈধ হ্যান্ডসেট।`
          : `[16002 BTRC]: Handset IMEI (352093081234567) is registered in BTRC NEIR database. Device is LEGITIMATE.`,
      ]);
    }, 800);
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006a4e]">
            {isBn ? 'ব্যবহার নির্দেশিকা' : 'Official Guidelines'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {isBn ? 'এনইআইআর নাগরিক ব্যবহার নির্দেশিকা' : 'NEIR Citizen Portal User Guides'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'ওয়েব পোর্টাল ও মোবাইল ফোনের মাধ্যমে হ্যান্ডসেট যাচাই ও নিবন্ধনের সম্পূর্ণ নিয়মাবলী'
              : 'Step-by-step procedures for web portal accounts, IMEI checks, and password reset'}
          </p>
        </div>

        {/* View Mode Switcher (Web vs Mobile) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setGuideMode('web')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              guideMode === 'web'
                ? 'bg-white text-[#006a4e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>{isBn ? 'ওয়েব পোর্টাল নির্দেশিকা' : 'Web Portal View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setGuideMode('mobile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              guideMode === 'mobile'
                ? 'bg-white text-[#006a4e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? 'মোবাইল / এসএমএস নির্দেশিকা' : 'Mobile / SMS View'}</span>
          </button>
        </div>
      </div>

      {/* WEB PORTAL VIEW */}
      {guideMode === 'web' && (
        <div className="space-y-6">
          {/* Topic Selector Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveGuideTopic('registration')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeGuideTopic === 'registration'
                  ? 'border-[#006a4e] text-[#006a4e]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isBn ? 'নাগরিক নিবন্ধন নির্দেশিকা' : 'Account Registration Guide'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGuideTopic('imported_handset')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeGuideTopic === 'imported_handset'
                  ? 'border-[#006a4e] text-[#006a4e]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isBn ? 'বিদেশি হ্যান্ডসেট নিবন্ধন' : 'Special Handset Registration'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGuideTopic('password_reset')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeGuideTopic === 'password_reset'
                  ? 'border-[#006a4e] text-[#006a4e]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>{isBn ? 'পাসওয়ার্ড পুনরুদ্ধার নির্দেশিকা' : 'Password Reset Guide'}</span>
            </button>
          </div>

          {/* Guide Content Cards */}
          <div className="bg-white rounded-b-xl shadow-xs border border-t-0 border-slate-200 p-6 space-y-6">
            {activeGuideTopic === 'registration' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isBn
                      ? 'নাগরিক পোর্টালে নতুন একাউন্ট খোলার নিয়মাবলী'
                      : 'How to Register a New Citizen Account on BTRC NEIR'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBn
                      ? 'জাতীয় পরিচয়পত্র ও মোবাইল ভেরিফিকেশনের মাধ্যমে ৪টি সহজ ধাপে একাউন্ট তৈরি করুন।'
                      : 'Create your account in 4 simple steps with NID & mobile verification.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                      ১
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                      {isBn ? 'ওয়েবসাইটে প্রবেশ' : 'Visit Portal'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'এনইআইআর সিটিজেন পোর্টালে গিয়ে ওপরের ডানদিকের "লগইন / নিবন্ধন" বাটনে ক্লিক করুন।'
                        : 'Navigate to NEIR portal and click "Sign In / Register" at top right.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                      ২
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                      {isBn ? 'এনআইডি তথ্য প্রদান' : 'Provide NID Info'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার নাম, জন্ম তারিখ এবং ১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর নির্ভুলভাবে টাইপ করুন।'
                        : 'Enter your legal name, date of birth, and 10 or 17 digit NID number accurately.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                      ৩
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                      {isBn ? 'মোবাইল ওটিপি যাচাই' : 'Mobile OTP Verification'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'আপনার সক্রিয় মোবাইল নম্বরে প্রেরিত ৬ ডিজিটের ওটিপি কোডটি টাইপ করে যাচাই সম্পন্ন করুন।'
                        : 'Submit the 6-digit OTP code sent to your mobile handset via SMS.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold text-xs">
                      ৪
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                      {isBn ? 'পাসওয়ার্ড সেট ও সক্রিয়করণ' : 'Set Password & Active'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBn
                        ? 'একটি নিরাপদ পাসওয়ার্ড সেট করে নিবন্ধন সম্পন্ন করুন এবং সরাসরি ড্যাশবোর্ডে প্রবেশ করুন।'
                        : 'Define a secure password, complete sign up, and access your personal dashboard.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="px-5 py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2"
                  >
                    <span>{isBn ? 'এখনই নিবন্ধন ফর্মে যান' : 'Open Registration Form'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeGuideTopic === 'imported_handset' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isBn
                      ? 'বিদেশ থেকে আনীত অথবা উপহারের হ্যান্ডসেট নিবন্ধনের নিয়মাবলী'
                      : 'Special Handset & Customs Registration Process'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBn
                      ? 'যাত্রী ব্যাগেজ বিধিমালা অনুযায়ী বৈধভাবে হ্যান্ডসেট শুল্কমুক্ত বা শুল্ক পরিশোধ সাপেক্ষে সক্রিয় করার উপায়।'
                      : 'Procedures for registering personal imported phones under passenger baggage provisions.'}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-2 text-amber-950">
                  <span className="font-bold block text-sm">
                    {isBn ? 'প্রয়োজনীয় ডকুমেন্টস:' : 'Required Supporting Documents:'}
                  </span>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{isBn ? 'বিদেশ ভ্রমণের পাসপোর্ট কপি (ইমিগ্রেশন আগমনী সিলসহ পৃষ্ঠা)' : 'Passport copy with airport arrival immigration stamp'}</li>
                    <li>{isBn ? 'বিমানবন্দর কাস্টমসের ব্যাগেজ ডিক্লারেশন স্লিপ / শুল্ক পরিশোধের রশিদ' : 'Customs baggage declaration slip or duty payment receipt'}</li>
                    <li>{isBn ? 'ক্রয় রশিদ বা ইনভয়েস (প্রযোজ্য ক্ষেত্রে)' : 'Purchase invoice or commercial store receipt'}</li>
                    <li>{isBn ? 'হ্যান্ডসেটের ১৫ ডিজিটের আইএমইআই নম্বর (সিম-১ ও সিম-২)' : 'Handset 15-digit IMEI 1 & IMEI 2'}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeGuideTopic === 'password_reset' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isBn
                      ? 'পাসওয়ার্ড ভুলে গেলে তা পুনরুদ্ধারের নিয়মাবলী'
                      : 'Citizen Account Password Reset & Recovery Procedure'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBn
                      ? 'নিবন্ধিত মোবাইল নম্বরে ওটিপি কোড ব্যবহার করে সহজেই পাসওয়ার্ড রিসেট করুন।'
                      : 'Recover your login access using mobile SMS OTP verification.'}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#006a4e]">ধাপ ১:</span>
                    <span>{isBn ? 'লগইন উইন্ডোতে "পাসওয়ার্ড ভুলে গেছেন?" লিংকে ক্লিক করুন।' : 'Click "Forgot password?" on the citizen sign in modal.'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#006a4e]">ধাপ ২:</span>
                    <span>{isBn ? 'আপনার নিবন্ধিত মোবাইল নম্বর বা জাতীয় পরিচয়পত্র (NID) নম্বর লিখুন।' : 'Provide your registered mobile number or National ID.'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#006a4e]">ধাপ ৩:</span>
                    <span>{isBn ? 'এসএমএসে প্রাপ্ত ৬ ডিজিটের ওটিপি লিখুন (পরীক্ষার জন্য ৪৮২৯১০ ব্যবহার করতে পারেন)।' : 'Input the 6-digit OTP code received via SMS (e.g. 482910 in prototype).'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#006a4e]">ধাপ ৪:</span>
                    <span>{isBn ? 'নতুন পাসওয়ার্ড সেট করে সংরক্ষণ করুন।' : 'Create and confirm your new secure password.'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE / SMS VIEW */}
      {guideMode === 'mobile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dialer Simulator */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006a4e] flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {isBn ? 'মোবাইল ডায়ালারের মাধ্যমে আইএমইআই দেখা' : 'Find IMEI on Phone Dialer'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? '*#06# ডায়াল সিমুলেটর' : '*#06# Dial Simulation'}
                </p>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="max-w-xs mx-auto bg-slate-900 text-white rounded-3xl p-5 shadow-xl border-4 border-slate-800">
              {/* Screen Display */}
              <div className="bg-slate-800 rounded-xl p-4 min-h-[90px] flex flex-col justify-center items-center text-center">
                {dialResultVisible ? (
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Device IMEI
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
                      352093081234567
                    </span>
                    <span className="text-[10px] text-slate-400 block">IMEI2: 352093081234568</span>
                  </div>
                ) : (
                  <div className="font-mono text-2xl font-bold tracking-widest text-emerald-300">
                    {dialedCode || '---'}
                  </div>
                )}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setDialResultVisible(false);
                      handleDialPress(k);
                    }}
                    className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-emerald-700 text-sm font-bold transition cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Call Action Button */}
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDialSubmit}
                  className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  {isBn ? 'ডায়াল কল' : 'Call / Check'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDialedCode('');
                    setDialResultVisible(false);
                  }}
                  className="px-3 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs transition cursor-pointer"
                >
                  {isBn ? 'মুছুন' : 'Clear'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center">
              {isBn
                ? 'যেকোনো মোবাইল হ্যান্ডসেটের ডায়ালারে *#06# চাপলেই আইএমইআই প্রদর্শিত হয়।'
                : 'Dialing *#06# works universally on Android, iPhone, and Feature Phones.'}
            </p>
          </div>

          {/* SMS 16002 Simulator */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006a4e] flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {isBn ? '১৬০০২ নম্বরে এসএমএস পাঠানোর নিয়ম' : 'Verify via SMS to 16002'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? 'KYD <space> ১৫ ডিজিট আইএমইআই' : 'KYD <space> 15 Digit IMEI'}
                </p>
              </div>
            </div>

            {/* Chat/SMS View */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 min-h-[220px] flex flex-col justify-between">
              {/* Message Feed */}
              <div className="space-y-2 overflow-y-auto max-h-[160px]">
                <div className="flex justify-end">
                  <div className="bg-[#006a4e] text-white text-xs p-2.5 rounded-lg rounded-tr-none max-w-[80%] shadow-2xs font-mono">
                    {smsBody}
                  </div>
                </div>

                {smsResponses.map((msg, i) => (
                  <div key={i} className="flex justify-start">
                    <div className="bg-white text-slate-800 text-xs p-2.5 rounded-lg rounded-tl-none max-w-[85%] border border-slate-200 shadow-2xs">
                      {msg}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input & Send */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <div className="w-16 shrink-0 text-center font-mono text-xs font-bold text-emerald-800 bg-emerald-50 py-1.5 rounded border border-emerald-200">
                  {smsRecipient}
                </div>
                <input
                  type="text"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  placeholder="KYD 352093081234567"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={isSendingSms}
                  className="px-3 py-1.5 bg-[#006a4e] hover:bg-[#044c38] text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isSendingSms ? '...' : (isBn ? 'পাঠান' : 'Send')}
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900">
              <span className="font-bold">{isBn ? 'ট্যারিফ বিজ্ঞপ্তি:' : 'Tariff Notice:'}</span>{' '}
              {isBn
                ? '১৬০০২ নম্বরে প্রেরিত এসএমএস সম্পূর্ণ চার্জমুক্ত (টোল ফ্রি)।'
                : 'SMS sent to 16002 is completely free of charge on all mobile operators.'}
            </div>
          </div>
        </div>
      )}

      {/* PDF Download Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
            <Download className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              {isBn ? 'অফিসিয়াল ব্যবহার নির্দেশিকা ডাউনলোড (PDF)' : 'Download Official Citizen Manual (PDF)'}
            </h4>
            <p className="text-xs text-slate-500">
              {isBn ? 'মুদ্রণযোগ্য বিস্তারিত নিয়মাবলী ও ব্যাগেজ নীতিমালা' : 'Printable full guide & passenger baggage regulations'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            alert(isBn ? 'ব্যবহার নির্দেশিকা পিডিএফ ডাউনলোড প্রক্রিয়া শুরু হয়েছে।' : 'User Manual PDF download initiated.');
          }}
          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 shadow-2xs transition cursor-pointer flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>{isBn ? 'পিডিএফ ডাউনলোড (2.4 MB)' : 'Download PDF (2.4 MB)'}</span>
        </button>
      </div>
    </div>
  );
};
