/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, UserSession } from '../types.ts';
import { 
  X, 
  Smartphone, 
  PlusCircle, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  User, 
  CreditCard,
  LogOut,
  Calendar
} from 'lucide-react';

interface CitizenDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  session: UserSession;
  onAddHandset: (newHandset: {
    imei: string;
    brand: string;
    model: string;
    registeredOn: string;
    status: 'Active' | 'Under Review' | 'Flagged';
  }) => void;
  onLogout: () => void;
}

export const CitizenDashboardModal: React.FC<CitizenDashboardModalProps> = ({
  isOpen,
  onClose,
  language,
  session,
  onAddHandset,
  onLogout,
}) => {
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'devices' | 'register_new'>('devices');

  // Form for registering new imported handset
  const [newBrand, setNewBrand] = useState('Apple');
  const [newModel, setNewModel] = useState('iPhone 15 Pro');
  const [newImei1, setNewImei1] = useState('359203112345678');
  const [newImei2, setNewImei2] = useState('');
  const [passportNumber, setPassportNumber] = useState('A09876543');
  const [customsSlipNo, setCustomsSlipNo] = useState('HSIA-CUS-2026-9921');
  const [fileAttached, setFileAttached] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRegisterHandset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImei1 || !newBrand || !newModel) return;

    onAddHandset({
      imei: newImei1.trim(),
      brand: newBrand,
      model: newModel,
      registeredOn: '27 Oct 2026 (Today)',
      status: 'Under Review',
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('devices');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="bg-[#006a4e] text-white p-5 flex items-center justify-between border-b-2 border-emerald-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-600">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {isBn ? 'নাগরিক ড্যাশবোর্ড' : 'Citizen Profile & Handsets'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isBn ? session.nameBangla : session.name} | NID: {session.nid}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-2.5 py-1 text-xs bg-red-600/80 hover:bg-red-700 rounded text-white flex items-center gap-1 cursor-pointer transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগআউট' : 'Logout'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`flex-1 py-3 text-center transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'devices'
                ? 'bg-white text-[#006a4e] border-b-2 border-[#006a4e]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {isBn ? 'নিবন্ধিত হ্যান্ডসেটের তালিকা' : 'Registered Handsets'} ({session.registeredHandsets.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register_new')}
            className={`flex-1 py-3 text-center transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'register_new'
                ? 'bg-white text-[#006a4e] border-b-2 border-[#006a4e]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'বিদেশি / বিশেষ হ্যান্ডসেট নিবন্ধন' : 'Register New Handset'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {isBn ? 'আপনার জাতীয় পরিচয়পত্রের অধীনে নিবন্ধিত হ্যান্ডসেটসমূহ:' : 'Devices Registered Under Your National ID:'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register_new')}
                  className="text-xs text-[#006a4e] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isBn ? 'নতুন হ্যান্ডসেট যোগ করুন' : 'Add Handset'}</span>
                </button>
              </div>

              {session.registeredHandsets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p>{isBn ? 'এখনও কোনো হ্যান্ডসেট যুক্ত করা হয়নি।' : 'No handsets registered yet.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {session.registeredHandsets.map((phone, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">
                              {phone.brand} {phone.model}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              phone.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {phone.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            IMEI: {phone.imei}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {isBn ? 'নিবন্ধনের তারিখ:' : 'Registered On:'} {phone.registeredOn}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block shadow-2xs">
                          {isBn ? '✓ বিটিআরসি অনুমোদিত' : '✓ BTRC Verified'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'register_new' && (
            <div>
              {submitSuccess ? (
                <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-base">
                    {isBn ? 'আবেদন সফলভাবে দাখিল হয়েছে!' : 'Application Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {isBn
                      ? 'আপনার দাখিলকৃত হ্যান্ডসেটটির তথ্য বিটিআরসি এনইআইআর যাচাই প্রক্রিয়ায় রয়েছে।'
                      : 'Your device registration documents are currently being processed by BTRC.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterHandset} className="space-y-4 text-xs">
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg text-xs leading-relaxed">
                    <strong>{isBn ? 'নির্দেশনা: ' : 'Instruction: '}</strong>
                    {isBn
                      ? 'বিদেশ হতে ব্যক্তিগতভাবে আনা বা উপহারপ্রাপ্ত হ্যান্ডসেটের জন্য পাসপোর্ট ও বিমানবন্দর কাস্টমস ব্যাগেজ রশিদ আপলোড করতে হবে।'
                      : 'For foreign-purchased or gift handsets, upload passport copy and airport customs luggage declaration token.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'ব্র্যান্ডের নাম *' : 'Handset Brand *'}
                      </label>
                      <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'মডেল / সংস্করণ *' : 'Handset Model *'}
                      </label>
                      <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'আইএমইআই-১ (১৫ ডিজিট) *' : 'IMEI 1 (15 Digits) *'}
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={newImei1}
                        onChange={(e) => setNewImei1(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'আইএমইআই-২ (ডুয়েল সিম হলে)' : 'IMEI 2 (Optional for Dual SIM)'}
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={newImei2}
                        onChange={(e) => setNewImei2(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'পাসপোর্ট নম্বর *' : 'Passport Number *'}
                      </label>
                      <input
                        type="text"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'কাস্টমস টোকেন / স্লিপ নম্বর *' : 'Customs Slip / Token No *'}
                      </label>
                      <input
                        type="text"
                        value={customsSlipNo}
                        onChange={(e) => setCustomsSlipNo(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Attachment Box */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isBn ? 'কাস্টমস রশিদ ও পাসপোর্টের কপি আপলোড *' : 'Customs Receipt & Passport Copy *'}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">
                        {fileAttached
                          ? (isBn ? 'সংযুক্তি: customs_receipt_hsia_2026.pdf (সংযুক্ত)' : 'Attached: customs_receipt_hsia_2026.pdf')
                          : (isBn ? 'ফাইল নির্বাচন করুন বা ড্রপ করুন' : 'Click to select or drag and drop files')}
                      </p>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                  >
                    {isBn ? 'নিবন্ধন আবেদন দাখিল করুন' : 'Submit Handset Registration Request'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
