import React, { useState } from 'react';
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
  const inputClass = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm mt-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none';
  const isBn = language === 'bn';
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setResult('');
    if (!fullName.trim() || !/^01\d{9}$/.test(mobile) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !purpose.trim() || !summary.trim()) {
      setError('Complete all required fields with a valid mobile number and email.');
      return;
    }
    const ticketId = 'DEMO-NEIR-' + Math.floor(100000 + Math.random() * 900000);
    onAddQuery({
      ticketId, citizenName: fullName, mobile, email, category: purpose, categoryBangla: purpose,
      subject: summary.slice(0, 80), details: summary, createdAt: new Date().toLocaleString('en-BD'),
      status: 'received', statusBangla: 'Demo received', officialNoteBangla: '',
      officialNoteEnglish: 'Browser-local demo entry. Not submitted to BTRC.',
      timeline: [{stage:'Demo entry created',timestamp:new Date().toLocaleString('en-BD'),details:'Stored in this browser session only.'}],
    });
    setResult('Demo query created: ' + ticketId + '. This is not an official BTRC ticket and was not submitted to any server.');
    setNumber(ticketId);
  };
  const lookup = (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setResult('');
    if (!number.trim()) {setError('Query Ticket Number is required.');return;}
    const ticket = queryList.find(q => q.ticketId.toUpperCase() === number.trim().toUpperCase() && q.ticketId.startsWith('DEMO-'));
    setResult(ticket ? 'Demo query found: ' + ticket.ticketId + ' — locally received (not a BTRC service status).' : 'No matching demo query in this session. Official BTRC query tracking is not connected.');
  };
  return <section className="neir-source-subpage neir-source-contact-page space-y-7">
    <header className="text-center py-7 space-y-3"><h1 className="text-3xl sm:text-4xl font-bold text-slate-950">{isBn ? 'আমরা আপনাকে সহায়তা করতে এখানে আছি!' : "We're here to help!"}</h1>
      <p className="text-base text-slate-700 max-w-3xl mx-auto">If you need assistance or have any questions regarding the NEIR Portal Bangladesh, feel free to reach out to us. We are here to help and support you.</p>
    </header>
    <div className="grid grid-cols-2 gap-3 sm:gap-5">
      <button aria-pressed={tab === 'submit'} onClick={() => {setTab('submit');setResult('');setError('');}} className={tab === 'submit' ? 'rounded-3xl p-4 sm:p-6 bg-white border-[8px] border-[#00ACC1] text-[#00838F] font-semibold' : 'rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 text-slate-700'}>
        <Send className="mx-auto mb-2" size={26} /> Submit New Query
      </button>
      <button aria-pressed={tab === 'status'} onClick={() => {setTab('status');setResult('');setError('');}} className={tab === 'status' ? 'rounded-3xl p-4 sm:p-6 bg-white border-[8px] border-[#00ACC1] text-[#00838F] font-semibold' : 'rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 text-slate-700'}>
        <Search className="mx-auto mb-2" size={26} /> Check Query Status
      </button>
    </div>
    <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-9 shadow-sm">
      {tab === 'submit' ? <form className="space-y-5" onSubmit={submit}>
        <h2 className="text-center text-2xl sm:text-3xl font-semibold text-slate-900">Submit Your Query</h2><hr className="border-slate-200"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block text-sm font-medium sm:col-span-2">Full Name <span className="text-red-600">*</span><input required className={inputClass} placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} /></label>
          <label className="block text-sm font-medium">Enter your mobile number <span className="text-red-600">*</span><input required inputMode="numeric" maxLength={11} className={inputClass} placeholder="Mobile Number (01XXXXXXXXX)" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,11))} /></label>
          <label className="block text-sm font-medium">Email <span className="text-red-600">*</span><input required type="email" className={inputClass} placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium sm:col-span-2">Choose Purpose Type <span className="text-red-600">*</span><select required className={inputClass} aria-label="Choose Purpose Type" value={purpose} onChange={e => setPurpose(e.target.value)}><option value="">Select a purpose type</option><option value="Demo inquiry">Demo inquiry (prototype only)</option></select><span className="block text-xs text-slate-500 mt-1">The original dropdown options were not included in the supplied HTML. This temporary choice is visibly labeled demo.</span></label>
        </div>
        <label className="block text-sm font-medium">Issues Summary <span className="text-red-600">*</span><textarea required className={inputClass} rows={4} placeholder="Tell us more about the issue you are facing" value={summary} onChange={e => setSummary(e.target.value)} /></label>
        <button type="submit" className="bg-[#00ACC1] hover:bg-[#00838F] text-white font-semibold rounded-xl px-8 py-3">Submit</button>
      </form> : <form className="space-y-5" onSubmit={lookup}>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Check Your Query Ticket Status</h2>
        <label className="block text-sm font-medium">Query Ticket Number <span className="text-red-600">*</span><input required className={inputClass} placeholder="Query Ticket Number" value={number} onChange={e => setNumber(e.target.value)} /></label>
        <button type="submit" className="bg-[#00ACC1] hover:bg-[#00838F] text-white font-semibold rounded-xl px-8 py-3">Check Query Status</button>
      </form>}
      {error && <p role="alert" className="bg-red-50 text-red-800 rounded-lg p-3 mt-5 text-sm">{error}</p>}
      {result && <p role="status" className="bg-sky-50 text-sky-950 rounded-lg p-3 mt-5 text-sm">{result}</p>}
      <p className="flex gap-2 text-xs text-slate-500 mt-6"><CircleHelp size={15} /> Frontend prototype: forms and ticket lookup operate only in memory. No messages are sent.</p>
    </div>
  </section>;
};
