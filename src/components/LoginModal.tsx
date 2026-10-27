/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Language, UserSession } from '../types.ts';
import { 
  X, 
  User, 
  Lock, 
  Phone, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound,
  Building2,
  RefreshCw
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (session: Partial<UserSession>) => void;
  initialView?: 'login' | 'register';
}

type ModalView = 'login' | 'register' | 'forgot_step1' | 'forgot_step2' | 'forgot_step3' | 'trader';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  initialView = 'login',
}) => {
  const isBn = language === 'bn';

  const [currentView, setCurrentView] = useState<ModalView>(initialView);
  useEffect(() => { if (isOpen) setCurrentView(initialView); }, [isOpen, initialView]);

  // Login form state
  const [identifier, setIdentifier] = useState('01711223344');
  const [password, setPassword] = useState('Btrc@1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('Md. Zahid Hasan');
  const [regNid, setRegNid] = useState('19942691234567890');
  const [regDob, setRegDob] = useState('1994-06-15');
  const [regMobile, setRegMobile] = useState('01799887766');
  const [regEmail, setRegEmail] = useState('zahid.hasan@example.com');
  const [regPassword, setRegPassword] = useState('Pass@2026');
  const [regConfirmPassword, setRegConfirmPassword] = useState('Pass@2026');
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot Password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim() || !password.trim()) {
      setLoginError(
        isBn
          ? 'অনুগ্রহ করে মোবাইল নম্বর/এনআইডি এবং পাসওয়ার্ড লিখুন।'
          : 'Please enter your mobile/NID and password.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        isLoggedIn: true,
        name: 'Md. Zahid Hasan',
        nameBangla: 'মো: জাহিদ হাসান',
        nid: identifier.length >= 10 ? identifier : '19942691234567890',
        mobile: identifier.startsWith('01') ? identifier : '01711223344',
        email: 'zahid.citizen@example.com',
        registeredHandsets: [
          {
            imei: '352093081234567',
            brand: 'Samsung',
            model: 'Galaxy S24 Ultra',
            registeredOn: '12 Jan 2024',
            status: 'Active',
          },
          {
            imei: '861111002223334',
            brand: 'Walton',
            model: 'Primo RM4',
            registeredOn: '18 Jul 2023',
            status: 'Active',
          },
        ],
      });
      onClose();
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regNid.trim() || !regMobile.trim() || !regPassword.trim()) {
      setRegError(
        isBn
          ? 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।'
          : 'Please fill in all mandatory fields.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(
        isBn ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        isLoggedIn: true,
        name: regName,
        nameBangla: regName,
        nid: regNid,
        mobile: regMobile,
        email: regEmail,
        registeredHandsets: [],
      });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Modal Top Header */}
        <div className="bg-[#006a4e] text-white p-5 flex items-center justify-between border-b-2 border-emerald-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-600">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 id="modal-headline" className="font-bold text-base leading-tight">
                {currentView === 'login' && (isBn ? 'নাগরিক একাউন্ট লগইন' : 'Citizen Account Login')}
                {currentView === 'register' && (isBn ? 'নতুন নাগরিক নিবন্ধন' : 'Citizen Registration')}
                {currentView.startsWith('forgot') && (isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password')}
                {currentView === 'trader' && (isBn ? 'আমদানিকারক / ব্যবসায়ী লগইন' : 'Importer / Vendor Portal')}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isBn ? 'বিটিআরসি এনইআইআর সেন্ট্রাল পোর্টাল' : 'BTRC NEIR Central Portal'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs between Citizen & Trader */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
              currentView === 'login' || currentView === 'register' || currentView.startsWith('forgot')
                ? 'bg-white text-[#006a4e] border-b-2 border-[#006a4e]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isBn ? 'নাগরিক সেবা' : 'Citizen Access'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('trader')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
              currentView === 'trader'
                ? 'bg-white text-[#006a4e] border-b-2 border-[#006a4e]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isBn ? 'আমদানিকারক / ভেন্ডর' : 'Importer / Vendor'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* VIEW 1: Citizen Login */}
          {currentView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">{isBn ? 'ডেমো অ্যাকাউন্ট:' : 'Demo Account:'}</span>
                  <p className="text-[11px] text-emerald-700">01711223344 / Btrc@1234</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('01711223344');
                    setPassword('Btrc@1234');
                  }}
                  className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded cursor-pointer"
                >
                  {isBn ? 'অটো-পূরণ' : 'Auto Fill'}
                </button>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'মোবাইল নম্বর অথবা জাতীয় পরিচয়পত্র (NID)' : 'Mobile Number or National ID (NID)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isBn ? 'যেমন: 01711223344' : 'e.g. 01711223344'}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] focus:ring-1 focus:ring-emerald-200 outline-none"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentView('forgot_step1')}
                    className="text-[11px] text-[#006a4e] hover:underline cursor-pointer"
                  >
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] focus:ring-1 focus:ring-emerald-200 outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600 select-none">
                  {isBn ? 'আমাকে মনে রাখুন' : 'Remember my login'}
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'যাচাই হচ্ছে...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Register */}
              <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                <span>{isBn ? 'কোনো একাউন্ট নেই? ' : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="font-bold text-[#006a4e] hover:underline cursor-pointer"
                >
                  {isBn ? 'নতুন নিবন্ধন করুন' : 'Register Here'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: Citizen Register */}
          {currentView === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={isBn ? 'জাতীয় পরিচয়পত্র অনুযায়ী' : 'As per National ID'}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'এনআইডি (NID) *' : 'NID (10/17 Digit) *'}
                  </label>
                  <input
                    type="text"
                    value={regNid}
                    onChange={(e) => setRegNid(e.target.value)}
                    placeholder="19942691234..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'জন্ম তারিখ *' : 'Date of Birth *'}
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'সক্রিয় মোবাইল নম্বর *' : 'Active Mobile Number *'}
                </label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'ইমেইল এড্রেস' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'নিশ্চিত করুন *' : 'Confirm *'}
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{isBn ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration'}</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                <span>{isBn ? 'ইতোমধ্যে একাউন্ট আছে? ' : 'Already registered? '}</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="font-bold text-[#006a4e] hover:underline cursor-pointer"
                >
                  {isBn ? 'লগইন করুন' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: Forgot Password Steps */}
          {currentView === 'forgot_step1' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBn
                  ? 'আপনার নিবন্ধিত মোবাইল নম্বর বা এনআইডি প্রদান করুন। আমরা একটি ওটিপি (OTP) যাচাইকরণ কোড পাঠাব।'
                  : 'Enter your registered mobile number or NID to receive an OTP verification code.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'মোবাইল / এনআইডি' : 'Mobile / NID'}
                </label>
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="01711223344"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('forgot_step2')}
                className="w-full py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs transition cursor-pointer"
              >
                {isBn ? 'ওটিপি (OTP) পাঠান' : 'Send Verification OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  {isBn ? '← লগইনে ফিরে যান' : '← Back to Login'}
                </button>
              </div>
            </div>
          )}

          {currentView === 'forgot_step2' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg">
                <span className="font-bold block">
                  {isBn ? 'নমুনা ওটিপি প্রদর্শিত:' : 'Simulated Verification OTP:'}
                </span>
                <span className="font-mono text-base font-black text-amber-800 tracking-widest">
                  482910
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? '৬ ডিজিটের ওটিপি লিখুন' : 'Enter 6-digit OTP'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="482910"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tracking-widest text-center text-sm focus:border-[#006a4e] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('forgot_step3')}
                className="w-full py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs transition cursor-pointer"
              >
                {isBn ? 'কোড যাচাই করুন' : 'Verify Code'}
              </button>
            </div>
          )}

          {currentView === 'forgot_step3' && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-4 rounded-lg text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">
                    {isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password reset successfully!'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false);
                      setCurrentView('login');
                    }}
                    className="mt-2 px-4 py-1.5 rounded bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    {isBn ? 'নতুন পাসওয়ার্ড দিয়ে লগইন করুন' : 'Sign in with new password'}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    {isBn ? 'আপনার নতুন পাসওয়ার্ড সেট করুন:' : 'Set your new secure password:'}
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-[#006a4e] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setForgotSuccess(true)}
                    className="w-full py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs transition cursor-pointer"
                  >
                    {isBn ? 'পাসওয়ার্ড হালনাগাদ করুন' : 'Save New Password'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* VIEW 4: Trader / Importer Notice */}
          {currentView === 'trader' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5">
                <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">
                    {isBn ? 'আমদানিকারক ও প্রস্তুতকারক পোর্টাল' : 'Authorized Importer / Manufacturer Portal'}
                  </h4>
                  <p className="text-slate-600 mt-1">
                    {isBn
                      ? 'বাণিজ্যিক আমদানিকারক ও স্থানীয় মোবাইল সংযোজনকারী প্রতিষ্ঠানসমূহ বিটিআরসি অনুমোদিত ট্রেডার পোর্টাল থেকে বাল্ক আইএমইআই (Bulk IMEI) ডেপ্লয়মেন্ট সাবমিট করুন।'
                      : 'Commercial telecom vendors, authorized importers, and local handset assemblers must use their dedicated BTRC Vendor Gateway credentials.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">
                  {isBn ? 'প্রতিষ্ঠান লাইসেন্স / ভেন্ডর আইডি' : 'BTRC Vendor / Importer License ID'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. BTRC-IMP-88219"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(isBn ? 'প্রোটোটাইপ মোড: ট্রেডার গেটওয়ে সংরক্ষিত।' : 'Prototype mode: Importer gateway placeholder.');
                }}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isBn ? 'ভেন্ডর ড্যাশবোর্ডে প্রবেশ' : 'Access Vendor Gateway'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
