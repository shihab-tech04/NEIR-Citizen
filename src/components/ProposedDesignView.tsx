/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Search, 
  CheckCircle, 
  Layers, 
  Lock, 
  Fingerprint, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ProposedDesignViewProps {
  language: Language;
  onReturnToBaseline: () => void;
}

export const ProposedDesignView: React.FC<ProposedDesignViewProps> = ({
  language,
  onReturnToBaseline,
}) => {
  const isBn = language === 'bn';

  const [testImei, setTestImei] = useState('352093081234567');
  const [activeComparePill, setActiveComparePill] = useState<'architecture' | 'accessibility' | 'mobile_first'>('architecture');

  return (
    <div className="w-full space-y-6">
      {/* Scope Protection Header Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-indigo-800/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'ভবিষ্যতের প্রস্তাবিত নতুন ডিজাইন রূপরেখা' : 'Future Proposed Design Prototype (Sandbox)'}</span>
          </div>

          <button
            type="button"
            onClick={onReturnToBaseline}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'মূল বেইসলাইন পোর্টালে ফিরুন (১:১)' : 'Return to 1:1 Baseline'}</span>
          </button>
        </div>

        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isBn ? 'স্মার্ট বাংলাদেশ: নেক্সট-জেন এনইআইআর সিটিজেন এক্সপেরিয়েন্স' : 'Next-Gen Smart NEIR Citizen Experience'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isBn
              ? 'স্কোপ প্রটেকশন নিশ্চিত করতে মূল সরকারি পোর্টালের ১:১ বেইসলাইন পুরোপুরি অপরিবর্তিত রাখা হয়েছে। এই স্ক্রিনটি স্টেকহোল্ডারদের জন্য আধুনিক মোবাইল-ফার্স্ট ও ডিজিটাল সার্ভিস স্ট্যান্ডার্ড (GDS) রূপরেখা উপস্থাপন করে।'
              : 'Isolated design sandbox. The current 1:1 government portal baseline remains untouched in its original route, while this view explores modern ergonomic layouts, instant verification streams, and simplified baggage clearance.'}
          </p>
        </div>

        {/* Design Comparison Tabs */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveComparePill('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeComparePill === 'architecture'
                ? 'bg-white text-slate-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {isBn ? 'স্থাপত্য ও স্কোপ আইসোলেশন' : 'Architecture & Scope Isolation'}
          </button>
          <button
            type="button"
            onClick={() => setActiveComparePill('accessibility')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeComparePill === 'accessibility'
                ? 'bg-white text-slate-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {isBn ? 'অ্যাক্সেসিবিলিটি ও ইউআই পোলিশ' : 'Accessibility & Micro-UX'}
          </button>
          <button
            type="button"
            onClick={() => setActiveComparePill('mobile_first')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeComparePill === 'mobile_first'
                ? 'bg-white text-slate-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {isBn ? 'মোবাইল-ফার্স্ট পাসপোর্ট ইন্টিগ্রেশন' : 'Mobile-First Customs Flow'}
          </button>
        </div>
      </div>

      {/* Modern UI Concept Sandbox */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Smart NEIR 2.0 (Concept)</h3>
              <p className="text-xs text-slate-400">Zero-friction biometric verification and instant customs clearance</p>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            v2.0-proposal
          </span>
        </div>

        {/* Modern Unified Search */}
        <div className="max-w-2xl mx-auto space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
            {isBn ? 'স্মার্ট আইএমইআই / হ্যান্ডসেট সার্চ' : 'Instant AI-Assisted Handset Verification'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={testImei}
              onChange={(e) => setTestImei(e.target.value)}
              placeholder="Enter 15-digit IMEI or scan barcode..."
              className="w-full pl-12 pr-32 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            <button
              type="button"
              className="absolute right-2 top-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Verify
            </button>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 px-1">
            <span>Scan with camera enabled</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Smart NID Connected</span>
            </span>
          </div>
        </div>

        {/* Proposed Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Full Route Isolation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Original BTRC routes (/home, /guides, /faq, /contact) remain in pristine 1:1 legacy mode. The proposed route does not leak styles into the baseline.
            </p>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Automated Customs Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time API reconciliation with National Board of Revenue (NBR) passenger baggage gateway to automatically approve up to 2 handsets.
            </p>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Anti-Theft Stolen Killswitch</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct police GD integration allowing instantaneous cross-operator IMEI blacklisting with emergency verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
