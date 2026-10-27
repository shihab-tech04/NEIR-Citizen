/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { 
  QueryTicket, 
  generateTicketId, 
  findTicket 
} from '../utils/queryTracker.ts';
import { 
  Send, 
  Search, 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Upload, 
  Copy, 
  Check, 
  HelpCircle,
  RefreshCw,
  Building
} from 'lucide-react';

interface ContactUsViewProps {
  language: Language;
  initialImei?: string;
  queryList: QueryTicket[];
  onAddQuery: (newTicket: QueryTicket) => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({
  language,
  initialImei = '',
  queryList,
  onAddQuery,
}) => {
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'submit' | 'status'>('submit');

  // Submit form state
  const [citizenName, setCitizenName] = useState('Md. Shakil Ahmed');
  const [mobile, setMobile] = useState('01711223344');
  const [email, setEmail] = useState('shakil.ahmed@example.com');
  const [category, setCategory] = useState('IMEI Verification Issue');
  const [handsetBrand, setHandsetBrand] = useState('Samsung');
  const [handsetModel, setHandsetModel] = useState('Galaxy A54');
  const [imei, setImei] = useState(initialImei);
  const [subject, setSubject] = useState('IMEI status inquiry for official purchased device');
  const [details, setDetails] = useState('I purchased this phone from an authorized outlet in Dhaka. When checking on NEIR portal, it asks for importer verification. Please check.');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('5W8P3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<QueryTicket | null>(null);
  const [copied, setCopied] = useState(false);

  // Status check state
  const [searchTicketId, setSearchTicketId] = useState('BTRC-NEIR-2026-1042');
  const [searchMobile, setSearchMobile] = useState('01711223344');
  const [foundTicket, setFoundTicket] = useState<QueryTicket | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !mobile || !subject || !details) return;

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      alert(isBn ? 'ক্যাপচা কোড সঠিক নয়!' : 'Invalid captcha code!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = generateTicketId();
      const newTicket: QueryTicket = {
        ticketId,
        citizenName,
        mobile,
        email,
        category,
        categoryBangla: category,
        imei: imei || undefined,
        brand: handsetBrand || undefined,
        model: handsetModel || undefined,
        subject,
        details,
        createdAt: '27 Oct 2026, Just Now',
        status: 'received',
        statusBangla: 'গৃহীত হয়েছে (Received)',
        officialNoteBangla: 'আপনার অভিযোগটি সফলভাবে সিস্টেমে নথিভুক্ত হয়েছে। কারিগরি কর্মকর্তা শীঘ্রই পর্যালোচনা করবেন।',
        officialNoteEnglish: 'Your query has been logged into the BTRC NEIR Helpdesk system. Technical desk will review shortly.',
        timeline: [
          {
            stage: 'Query Submitted',
            timestamp: '27 Oct 2026, Just Now',
            details: 'Query submitted by citizen via BTRC NEIR Citizen Portal.',
          },
        ],
      };

      onAddQuery(newTicket);
      setCreatedTicket(newTicket);
    }, 700);
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setFoundTicket(null);

    if (!searchTicketId.trim()) {
      setSearchError(
        isBn ? 'অনুগ্রহ করে ট্র্যাকিং আইডি লিখুন।' : 'Please enter tracking ticket ID.'
      );
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const res = findTicket(searchTicketId, searchMobile, queryList);
      if (res) {
        setFoundTicket(res);
      } else {
        setSearchError(
          isBn
            ? 'প্রদত্ত ট্র্যাকিং আইডি বা মোবাইল নম্বরের বিপরীতে কোনো অভিযোগ পাওয়া যায়নি।'
            : 'No matching query found for this Ticket ID and Mobile Number.'
        );
      }
    }, 500);
  };

  const handleCopyTicket = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006a4e]">
            {isBn ? 'যোগাযোগ ও অভিযোগ সেল' : 'Contact & Citizen Helpdesk'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {isBn ? 'অভিযোগ দাখিল ও অনুসন্ধান ট্র্যাকিং' : 'Citizen Query & Incident Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'আইএমইআই গরমিল, আনীত হ্যান্ডসেট নিবন্ধন সংক্রান্ত সমস্যা বা সাধারণ অনুসন্ধানের জন্য বিটিআরসি ডেস্ক'
              : 'Direct communication desk for IMEI disputes, special handset queries and official assistance'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-white text-[#006a4e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isBn ? 'নতুন অভিযোগ দাখিল' : 'Submit New Query'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'status'
                ? 'bg-white text-[#006a4e] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>{isBn ? 'অভিযোগের অবস্থা যাচাই' : 'Check Query Status'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Left Form Area */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          {/* TAB 1: Submit New Query */}
          {activeTab === 'submit' && (
            <div>
              {createdTicket ? (
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg text-emerald-950">
                      {isBn ? 'আপনার অভিযোগটি সফলভাবে দাখিল হয়েছে!' : 'Query Lodged Successfully!'}
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      {isBn
                        ? 'আপনার ট্র্যাকিং আইডি নিচে দেওয়া হলো। ভবিষ্যতে অনুসন্ধানের জন্য এটি সংরক্ষণ করুন।'
                        : 'Your tracking ticket ID is generated below. Please save it for future tracking.'}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-emerald-300 shadow-2xs font-mono font-bold text-base text-[#006a4e]">
                    <span>{createdTicket.ticketId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyTicket(createdTicket.ticketId)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                      title="Copy"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTicketId(createdTicket.ticketId);
                        setSearchMobile(createdTicket.mobile);
                        setActiveTab('status');
                        setFoundTicket(createdTicket);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#006a4e] text-white text-xs font-semibold cursor-pointer"
                    >
                      {isBn ? 'এখনই স্ট্যাটাস ট্র্যাক করুন' : 'Track Status Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatedTicket(null)}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      {isBn ? 'আরেকটি অভিযোগ দাখিল করুন' : 'Lodge Another Query'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuery} className="space-y-4 text-xs">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-800">
                      {isBn ? 'নাগরিক জিজ্ঞাসা বা অভিযোগের বিবরণ' : 'Citizen Query & Grievance Form'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBn ? 'অনুগ্রহ করে সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন।' : 'Please supply verified contact details for follow-up.'}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isBn ? 'অভিযোগের ধরন / বিষয়শ্রেণী *' : 'Query Category *'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-[#006a4e]"
                    >
                      <option value="IMEI Verification Issue">IMEI Verification Issue / আইএমইআই তথ্য গরমিল</option>
                      <option value="Handset Registration Issue">Handset Registration Issue / বিদেশ হতে আনীত ফোন নিবন্ধন সমস্যা</option>
                      <option value="Lost or Stolen Device Block">Lost or Stolen Device / হারানো বা চুরি হওয়া হ্যান্ডসেট রিপোর্ট</option>
                      <option value="NID Verification Mismatch">NID Verification / এনআইডি মেলবন্ধন সংক্রান্ত</option>
                      <option value="General Query">General Query / সাধারণ নাগরিক জিজ্ঞাসা</option>
                    </select>
                  </div>

                  {/* Citizen Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'নাগরিকের নাম *' : 'Citizen Name *'}
                      </label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'ইমেইল এড্রেস' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                      />
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'ব্র্যান্ড' : 'Brand Name'}
                      </label>
                      <input
                        type="text"
                        value={handsetBrand}
                        onChange={(e) => setHandsetBrand(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? 'মডেল' : 'Model'}
                      </label>
                      <input
                        type="text"
                        value={handsetModel}
                        onChange={(e) => setHandsetModel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isBn ? '১৫ ডিজিটের আইএমইআই (যদি থাকে)' : 'IMEI (If Applicable)'}
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={imei}
                        onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isBn ? 'অভিযোগের শিরোনাম / বিষয় *' : 'Subject *'}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isBn ? 'বিস্তারিত বর্ণনা *' : 'Detailed Description *'}
                    </label>
                    <textarea
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                      required
                    />
                  </div>

                  {/* Captcha */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="bg-slate-100 px-3 py-2 rounded-lg font-mono font-black text-emerald-800 tracking-widest text-base select-none border border-slate-300">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:text-emerald-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      maxLength={6}
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder={isBn ? 'ক্যাপচা কোড লিখুন' : 'Enter captcha'}
                      className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase tracking-widest"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isBn ? 'দাখিল হচ্ছে...' : 'Submitting Query...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isBn ? 'অভিযোগ জমা দিন' : 'Submit Query'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Check Query Status */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {isBn ? 'দাখিলকৃত অভিযোগের বর্তমান অবস্থা যাচাই' : 'Track Existing Query Status'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn ? 'আপনার ট্র্যাকিং টিকিট আইডি ও মোবাইল নম্বর প্রদান করুন।' : 'Enter your ticket tracking code to view live review timeline.'}
                </p>
              </div>

              {/* Sample Ticket Pills for Easy Review */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  {isBn ? 'নমুনা টিকিট ট্র্যাকিং (ক্লিক করুন):' : 'Sample Registered Tickets (Click to track):'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTicketId('BTRC-NEIR-2026-1042');
                      setSearchMobile('01711223344');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 rounded text-[11px] font-mono text-slate-700 cursor-pointer"
                  >
                    BTRC-NEIR-2026-1042 (In Review)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTicketId('BTRC-NEIR-2026-2891');
                      setSearchMobile('01819876543');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 rounded text-[11px] font-mono text-slate-700 cursor-pointer"
                  >
                    BTRC-NEIR-2026-2891 (Resolved)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearchStatus} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                <div className="sm:col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isBn ? 'ট্র্যাকিং টিকিট আইডি *' : 'Tracking Ticket ID *'}
                  </label>
                  <input
                    type="text"
                    value={searchTicketId}
                    onChange={(e) => setSearchTicketId(e.target.value)}
                    placeholder="BTRC-NEIR-2026-XXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase outline-none focus:border-[#006a4e]"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    value={searchMobile}
                    onChange={(e) => setSearchMobile(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full py-2 px-3 rounded-lg bg-[#006a4e] hover:bg-[#044c38] text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isBn ? 'অনুসন্ধান' : 'Track'}</span>
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Found Ticket Result Card */}
              {foundTicket && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                        {foundTicket.ticketId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {foundTicket.subject}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isBn ? 'দাখিলের তারিখ:' : 'Lodged on:'} {foundTicket.createdAt}
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      foundTicket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : foundTicket.status === 'in_review'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {isBn ? foundTicket.statusBangla : foundTicket.status}
                    </span>
                  </div>

                  {/* Grievance Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">{isBn ? 'বিষয়শ্রেণী' : 'Category'}</span>
                      <span className="font-semibold text-slate-800">{foundTicket.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isBn ? 'নাগরিকের নাম' : 'Citizen'}</span>
                      <span className="font-semibold text-slate-800">{foundTicket.citizenName}</span>
                    </div>
                    {foundTicket.imei && (
                      <div>
                        <span className="text-slate-500 block">{isBn ? 'সংশ্লিষ্ট আইএমইআই' : 'Associated IMEI'}</span>
                        <span className="font-mono font-semibold text-slate-800">{foundTicket.imei}</span>
                      </div>
                    )}
                    {foundTicket.brand && (
                      <div>
                        <span className="text-slate-500 block">{isBn ? 'ডিভাইস' : 'Device'}</span>
                        <span className="font-semibold text-slate-800">{foundTicket.brand} {foundTicket.model}</span>
                      </div>
                    )}
                  </div>

                  {/* Official Action Note */}
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block">
                      {isBn ? 'বিটিআরসি অফিসিয়াল পর্যবেক্ষণ ও সিদ্ধান্ত:' : 'BTRC Official Desk Decision:'}
                    </span>
                    <p className="text-emerald-800 leading-relaxed">
                      {isBn ? foundTicket.officialNoteBangla : foundTicket.officialNoteEnglish}
                    </p>
                  </div>

                  {/* Progress Timeline */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      {isBn ? 'কার্যক্রমের পর্যায়ক্রমিক বিবরণ:' : 'Activity Log & Timeline:'}
                    </span>
                    <div className="space-y-2">
                      {foundTicket.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[#006a4e] mt-1.5 shrink-0"></div>
                          <div>
                            <span className="font-bold text-slate-800">{step.stage}</span>
                            <span className="text-slate-400 ml-2 font-mono text-[11px]">({step.timestamp})</span>
                            <p className="text-slate-600 mt-0.5">{step.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Coordinates Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#006a4e]" />
              <span>{isBn ? 'বিটিআরসি সদর দপ্তর' : 'BTRC Headquarters'}</span>
            </h4>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">
                    {isBn ? 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন' : 'Bangladesh Telecommunication Regulatory Commission'}
                  </strong>
                  <p>
                    {isBn
                      ? 'বিটিআরসি ভবন, প্লট: ই-৫/এ, আগারগাঁও প্রশাসনিক এলাকা, শেরেবাংলা নগর, ঢাকা-১২০৭।'
                      : 'BTRC Bhaban, Plot: E-5/A, Agargaon Administrative Area, Sher-e-Bangla Nagar, Dhaka-1207.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-slate-500 block">{isBn ? 'কল সেন্টার' : 'Call Center'}</span>
                  <span className="font-bold text-slate-900 text-sm">100 (Toll-Free)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-slate-500 block">{isBn ? 'ইমেইল সহায়তা' : 'Email Support'}</span>
                  <span className="font-semibold text-slate-900">neir@btrc.gov.bd</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-slate-500 block">{isBn ? 'কার্যসময়' : 'Office Hours'}</span>
                  <span className="text-slate-800">
                    {isBn ? 'রবিবার - বৃহস্পতিবার: সকাল ৯:০০ - বিকাল ৫:০০' : 'Sunday - Thursday: 9:00 AM - 5:00 PM'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>{isBn ? 'জরুরি বিজ্ঞপ্তি' : 'Important Note'}</span>
            </span>
            <p className="leading-relaxed">
              {isBn
                ? 'চুরি হওয়া হ্যান্ডসেটের ক্ষেত্রে জিডি নম্বর ও সংশ্লিষ্ট থানার নাম বিবরণে উল্লেখ করা বাধ্যতামূলক।'
                : 'For lost/stolen handsets, mentioning the police GD number and police station name is required.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
