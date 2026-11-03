import React, { useState } from 'react';
import { UiButton, UiInput, UiSelect, UiTextarea } from '../ui/index.ts';
import type { Language } from '../types.ts';
import type { QueryTicket } from '../utils/queryTracker.ts';
import { CircleHelp, FileText, Search, Send } from 'lucide-react';

type Props = { language: Language; initialImei?: string; queryList: QueryTicket[]; onAddQuery: (newTicket: QueryTicket) => void; };
export const ContactUsView: React.FC<Props> = ({ language, queryList, onAddQuery }) => {
  const [tab, setTab] = useState<'submit' | 'status'>('submit');
  const [fullName,setFullName] = useState('');
  const [mobile,setMobile] = useState('');
  const [email,setEmail] = useState('');
  const [purpose,setPurpose] = useState('');
  const [summary,setSummary] = useState('');
  const [number,setNumber] = useState('');
  const [result,setResult] = useState('');
  const [error,setError] = useState('');
  const inputClass = 'neir-ui-form-control';
  const isBn = language === 'bn';
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setResult('');
    if (!fullName.trim() || !/^01\d{9}$/.test(mobile) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !purpose.trim() || !summary.trim()) {
      setError(isBn ? 'সব আবশ্যিক ঘর পূরণ করুন এবং সঠিক মোবাইল নম্বর ও ইমেইল দিন।' : 'Complete all required fields with a valid mobile number and email.');
      return;
    }
    const ticketId = 'QUERY-' + Math.floor(100000 + Math.random() * 900000);
    onAddQuery({
      ticketId, citizenName: fullName, mobile, email, category: purpose, categoryBangla: purpose,
      subject: summary.slice(0, 80), details: summary, createdAt: new Date().toLocaleString('en-BD'),
      status: 'received', statusBangla: 'Received', officialNoteBangla: '',
      officialNoteEnglish: 'Saved to this browser session.',
      timeline: [{stage:'Query created',timestamp:new Date().toLocaleString('en-BD'),details:'Stored in this browser session only.'}],
    });
    setResult((isBn ? 'অনুসন্ধান নম্বর তৈরি হয়েছে: ' : 'Query created: ') + ticketId + '.');
    setNumber(ticketId);
  };
  const lookup = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setResult('');
    if (!number.trim()) {setError(isBn ? 'অনুসন্ধান নম্বর লিখুন।' : 'Query Ticket Number is required.');return;}
    const ticket = queryList.find(q => q.ticketId.toUpperCase() === number.trim().toUpperCase() && q.ticketId.startsWith('QUERY-'));
    setResult(ticket ? (isBn ? 'অনুসন্ধান পাওয়া গেছে: ' : 'Query found: ') + ticket.ticketId + (isBn ? ' — গ্রহণ করা হয়েছে।' : ' — Received.') : (isBn ? 'এই সেশনে কোনো মিল পাওয়া যায়নি।' : 'No matching query found in this session.'));
  };
  return <section className="neir-source-subpage neir-source-contact-page space-y-7">
    <header className="text-center py-7 space-y-3"><h1 className="text-3xl sm:text-4xl font-bold text-slate-950">{isBn ? 'আমরা আপনাকে সহায়তা করতে এখানে আছি!' : "We're here to help!"}</h1>
      <p className="text-base text-slate-700 max-w-3xl mx-auto">{isBn ? 'NEIR পোর্টাল সম্পর্কে সহায়তা বা প্রশ্ন থাকলে আমাদের সঙ্গে যোগাযোগ করুন।' : 'If you need assistance or have any questions regarding the NEIR Portal Bangladesh, feel free to reach out to us. We are here to help and support you.'}</p>
    </header>
    <div className="grid grid-cols-2 gap-3 sm:gap-5">
      <UiButton aria-pressed={tab === 'submit'} onClick={() => {setTab('submit');setResult('');setError('');}} className="neir-ui-choice-tab">
        <Send className="mx-auto mb-2" size={26} /> {isBn ? 'নতুন অনুসন্ধান পাঠান' : 'Submit New Query'}
      </UiButton>
      <UiButton aria-pressed={tab === 'status'} onClick={() => {setTab('status');setResult('');setError('');}} className="neir-ui-choice-tab">
        <Search className="mx-auto mb-2" size={26} /> {isBn ? 'অনুসন্ধানের অবস্থা দেখুন' : 'Check Query Status'}
      </UiButton>
    </div>
    <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-9 shadow-sm">
      {tab === 'submit' ? <form className="space-y-5" onSubmit={submit}>
        <h2 className="text-center text-2xl sm:text-3xl font-semibold text-slate-900">{isBn ? 'আপনার অনুসন্ধান জমা দিন' : 'Submit Your Query'}</h2><hr className="border-slate-200"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block text-sm font-medium sm:col-span-2">{isBn ? 'পুরো নাম' : 'Full Name'} <span className="text-red-600">*</span><UiInput required className={inputClass} placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} /></label>
          <label className="block text-sm font-medium">{isBn ? 'মোবাইল নম্বর' : 'Enter your mobile number'} <span className="text-red-600">*</span><UiInput required inputMode="numeric" maxLength={11} className={inputClass} placeholder="Mobile Number (01XXXXXXXXX)" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,11))} /></label>
          <label className="block text-sm font-medium">{isBn ? 'ইমেইল' : 'Email'} <span className="text-red-600">*</span><UiInput required type="email" className={inputClass} placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium sm:col-span-2">{isBn ? 'অনুসন্ধানের ধরন' : 'Choose Purpose Type'} <span className="text-red-600">*</span><UiSelect required className={inputClass} aria-label={isBn ? 'অনুসন্ধানের ধরন' : 'Choose Purpose Type'} value={purpose} onChange={e => setPurpose(e.target.value)}><option value="">{isBn ? 'একটি ধরন নির্বাচন করুন' : 'Select a purpose type'}</option><option value="General inquiry">{isBn ? 'সাধারণ অনুসন্ধান' : 'General inquiry'}</option></UiSelect><span className="block text-xs text-slate-500 mt-1">{isBn ? 'আপনার অনুসন্ধানের বিষয় নির্বাচন করুন।' : 'Select the subject of your inquiry.'}</span></label>
        </div>
        <label className="block text-sm font-medium">{isBn ? 'সমস্যার বিবরণ' : 'Issues Summary'} <span className="text-red-600">*</span><UiTextarea required className={inputClass} rows={4} placeholder="Tell us more about the issue you are facing" value={summary} onChange={e => setSummary(e.target.value)} /></label>
        <UiButton type="submit" variant="primary" className="neir-ui-form-action">{isBn ? 'জমা দিন' : 'Submit'}</UiButton>
      </form> : <form className="space-y-5" onSubmit={lookup}>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{isBn ? 'অনুসন্ধানের অবস্থা যাচাই করুন' : 'Check Your Query Ticket Status'}</h2>
        <label className="block text-sm font-medium">{isBn ? 'অনুসন্ধান নম্বর' : 'Query Ticket Number'} <span className="text-red-600">*</span><UiInput required className={inputClass} placeholder="Query Ticket Number" value={number} onChange={e => setNumber(e.target.value)} /></label>
        <UiButton type="submit" variant="primary" className="neir-ui-form-action">{isBn ? 'অবস্থা দেখুন' : 'Check Query Status'}</UiButton>
      </form>}
      {error && <p role="alert" className="bg-red-50 text-red-800 rounded-lg p-3 mt-5 text-sm">{error}</p>}
      {result && <p role="status" className="bg-sky-50 text-sky-950 rounded-lg p-3 mt-5 text-sm">{result}</p>}
      <p className="flex gap-2 text-xs text-slate-500 mt-6"><CircleHelp size={15} /> {isBn ? 'এই ব্রাউজার সেশন চলাকালে অনুসন্ধানের ইতিহাস দেখা যাবে।' : 'Query history is available during this browser session.'}</p>
    </div>
  </section>;
};
