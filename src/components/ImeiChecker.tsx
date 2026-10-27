/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { checkImeiStatus, HandsetRecord, SAMPLE_HANDSETS } from '../utils/imei.ts';
import { 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Smartphone, 
  Info, 
  Printer, 
  Copy, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ImeiCheckerProps {
  language: Language;
  onNavigateToContact?: (prefillImei?: string) => void;
  onNavigateToRegister?: () => void;
}

export const ImeiChecker: React.FC<ImeiCheckerProps> = ({
  language,
  onNavigateToContact,
  onNavigateToRegister,
}) => {
  const isBn = language === 'bn';

  const [imeiInput, setImeiInput] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9M2');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HandsetRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate random 5-character alphanumeric captcha
  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handlePresetSelect = (presetImei: string) => {
    setImeiInput(presetImei);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResult(null);

    const clean = imeiInput.trim().replace(/[-\s]/g, '');

    if (clean.length !== 15 || !/^\d+$/.test(clean)) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে সঠিক ১৫ ডিজিটের আইএমইআই (IMEI) নম্বর লিখুন।'
          : 'Please enter a valid 15-digit numeric IMEI number.'
      );
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setErrorMessage(
        isBn
          ? 'ক্যাপচা কোড সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Security captcha does not match. Please try again.'
      );
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      const res = checkImeiStatus(clean);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMessage(res.message || 'Lookup failed');
      }
    }, 600);
  };

  const handleCopyImei = () => {
    if (result) {
      navigator.clipboard?.writeText(result.imei);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="imei-verifier" className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#006a4e] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-800/80 flex items-center justify-center border border-emerald-500/50">
            <Smartphone className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {isBn ? 'মোবাইল হ্যান্ডসেটের আইএমইআই যাচাই' : 'Verify Mobile Handset IMEI'}
            </h2>
            <p className="text-xs text-emerald-200">
              {isBn
                ? 'আপনার হ্যান্ডসেটটি বৈধ বা বিটিআরসি অনুমোদিত কিনা এখনই যাচাই করুন'
                : 'Instantly check whether your handset is legally imported or registered in NEIR'}
            </p>
          </div>
        </div>

        <div className="text-xs bg-black/20 text-emerald-100 px-3 py-1.5 rounded-full border border-emerald-400/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{isBn ? 'জাতীয় ডাটাবেজ সক্রিয়' : 'National Database Live'}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* IMEI Input */}
            <div className="md:col-span-7">
              <label htmlFor="imei-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {isBn ? '১৫ ডিজিটের আইএমইআই নম্বর লিখুন *' : 'Enter 15-Digit IMEI Number *'}
              </label>
              <div className="relative">
                <input
                  id="imei-input"
                  type="text"
                  maxLength={15}
                  value={imeiInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setImeiInput(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={isBn ? 'যেমন: ৩৫২০৯৩০৮১২৩৪৫৬৭' : 'e.g. 352093081234567'}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-emerald-100 outline-none text-slate-800 font-mono text-base tracking-wider transition"
                />
                <span className={`absolute right-3 top-3 text-xs font-mono font-medium ${
                  imeiInput.length === 15 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                }`}>
                  {imeiInput.length}/15
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {isBn
                    ? 'আইএমইআই জানতে মোবাইল ডায়ালারে *#06# চাপুন'
                    : 'To find IMEI, dial *#06# on your mobile phone'}
                </span>
              </p>
            </div>

            {/* Captcha Input */}
            <div className="md:col-span-5">
              <label htmlFor="captcha-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {isBn ? 'ক্যাপচা কোড লিখুন *' : 'Security Captcha Code *'}
              </label>
              <div className="flex items-center gap-2">
                {/* Visual Captcha Box */}
                <div 
                  className="bg-slate-100 px-3 py-2 rounded-lg border border-slate-300 font-mono text-lg font-black tracking-widest text-[#006a4e] select-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:6px_6px] flex items-center justify-center min-w-[100px]"
                  title="Security Captcha"
                >
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
                  title={isBn ? 'ক্যাপচা পরিবর্তন করুন' : 'Refresh Captcha'}
                  aria-label="Refresh Captcha"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <input
                  id="captcha-input"
                  type="text"
                  maxLength={6}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Code"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#006a4e] focus:ring-2 focus:ring-emerald-100 outline-none text-slate-800 font-mono uppercase text-sm tracking-widest"
                />
              </div>
            </div>
          </div>

          {/* Quick Sample IMEI Preset Selector for UX Demonstration */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-1.5">
              {isBn ? 'পরীক্ষার জন্য নমুনা আইএমইআই (ক্লিক করুন):' : 'Sample Test IMEIs (Click to populate):'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('352093081234567');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Samsung S24 (Valid)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('864982049876543');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Xiaomi Local Assembled</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('359203112345678');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>iPhone (Pending Customs)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('861111002223334');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Walton Local Made</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('869999008888777');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Stolen / Blacklisted</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('351234567890123');
                  setCaptchaInput(captchaCode);
                }}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Cloned / Not in DB</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs rounded-r flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isChecking}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'অনুসন্ধান করা হচ্ছে...' : 'Verifying in NEIR...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{isBn ? 'যাচাই করুন' : 'Verify IMEI'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Verification Result Card */}
        {result && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className={`rounded-xl border p-5 ${
              result.registrationStatus === 'valid'
                ? 'bg-emerald-50/70 border-emerald-300'
                : result.registrationStatus === 'grey_market'
                ? 'bg-amber-50/70 border-amber-300'
                : result.registrationStatus === 'blacklisted'
                ? 'bg-red-50/80 border-red-300'
                : 'bg-slate-50 border-slate-300'
            }`}>
              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {result.registrationStatus === 'valid' ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : result.registrationStatus === 'grey_market' ? (
                    <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  ) : result.registrationStatus === 'blacklisted' ? (
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1 bg-white border border-slate-300 text-slate-700">
                      {isBn ? 'যাচাইকরণের ফলাফল' : 'Verification Outcome'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {isBn ? result.statusBangla : result.statusEnglish}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyImei}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'আইএমইআই কপি' : 'Copy IMEI')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Specification Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-xs">
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'হ্যান্ডসেটের ব্র্যান্ড' : 'Brand Name'}</span>
                  <span className="text-slate-900 font-bold text-sm">{result.brand}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'মডেল / সংস্করণ' : 'Device Model'}</span>
                  <span className="text-slate-900 font-bold text-sm">{result.model}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'টিএসি (TAC কোড)' : 'Type Allocation Code'}</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">{result.tac}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'ডিভাইসের ধরন' : 'Equipment Category'}</span>
                  <span className="text-slate-900 font-semibold">{result.equipmentType}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'নিবন্ধনের তারিখ' : 'Registration Record'}</span>
                  <span className="text-slate-900 font-semibold">{result.registeredDate || 'N/A'}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{isBn ? 'অনুমোদিত আমদানিকারক / সংযোজনকারী' : 'Importer / Manufacturer'}</span>
                  <span className="text-slate-900 font-semibold truncate block" title={result.importerOrManufacturer}>
                    {result.importerOrManufacturer || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Details & Recommendation note */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  <strong className="text-slate-900">{isBn ? 'বিটিআরসি নির্দেশনা: ' : 'BTRC Advisory: '}</strong>
                  {isBn ? result.detailsBangla : result.detailsEnglish}
                </p>

                {/* Conditional Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {result.registrationStatus === 'grey_market' && onNavigateToRegister && (
                    <button
                      type="button"
                      onClick={onNavigateToRegister}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition cursor-pointer"
                    >
                      <span>{isBn ? 'সিটিজেন পোর্টালে হ্যান্ডসেট নিবন্ধন করুন' : 'Register Personal Handset Now'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {result.registrationStatus === 'blacklisted' && onNavigateToContact && (
                    <button
                      type="button"
                      onClick={() => onNavigateToContact(result.imei)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white font-medium transition cursor-pointer"
                    >
                      <span>{isBn ? 'বিটিআরসি সহায়তা ডেস্কে যোগাযোগ করুন' : 'Lodge Incident / Contact Desk'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setImeiInput('');
                      refreshCaptcha();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                  >
                    <span>{isBn ? 'অন্য আইএমইআই যাচাই করুন' : 'Check Another Handset'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
