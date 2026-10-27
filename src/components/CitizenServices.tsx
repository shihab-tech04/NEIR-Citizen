/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types.ts';
import { Smartphone, PlusCircle, AlertOctagon, HelpCircle, FileSearch, ArrowRight } from 'lucide-react';

interface CitizenServicesProps {
  language: Language;
  onSelectService: (service: 'verify' | 'register' | 'lost' | 'query' | 'guides') => void;
}

export const CitizenServices: React.FC<CitizenServicesProps> = ({
  language,
  onSelectService,
}) => {
  const isBn = language === 'bn';

  const services = [
    {
      id: 'verify' as const,
      icon: Smartphone,
      titleBn: 'হ্যান্ডসেটের আইএমইআই যাচাই',
      titleEn: 'Check Handset Status',
      descBn: 'ক্রয়ের পূর্বে হ্যান্ডসেটের বৈধতা বিটিআরসি ডাটাবেজে যাচাই করুন।',
      descEn: 'Verify authenticity of any mobile phone before purchasing.',
      badgeBn: 'তাৎক্ষণিক',
      badgeEn: 'Instant',
      color: 'emerald',
    },
    {
      id: 'register' as const,
      icon: PlusCircle,
      titleBn: 'বিশেষ / আনীত হ্যান্ডসেট নিবন্ধন',
      titleEn: 'Register Special / Imported Handset',
      descBn: 'বিদেশ থেকে আনীত অথবা উপহারের হ্যান্ডসেটের শুল্কতথ্য নিবন্ধন।',
      descEn: 'Register foreign-purchased or personal gift handsets.',
      badgeBn: 'নাগরিক সেবা',
      badgeEn: 'Citizen Portal',
      color: 'blue',
    },
    {
      id: 'lost' as const,
      icon: AlertOctagon,
      titleBn: 'হারানো / চুরি হওয়া হ্যান্ডসেট ট্র্যাকিং',
      titleEn: 'Lost / Stolen Handset Information',
      descBn: 'আইনশৃঙ্খলা রক্ষাকারী বাহিনীর মাধ্যমে ব্লকলিস্টের তথ্য সংক্রান্ত সহায়তা।',
      descEn: 'Guidelines and reporting for stolen device network-blocking.',
      badgeBn: 'নিরাপত্তা',
      badgeEn: 'Security',
      color: 'red',
    },
    {
      id: 'query' as const,
      icon: FileSearch,
      titleBn: 'অভিযোগ বা অনুসন্ধান ট্র্যাকিং',
      titleEn: 'Track Query / Complaint Status',
      descBn: 'দাখিলকৃত অভিযোগের বর্তমান অগ্রগতি ও সমাধান নোট পরীক্ষা করুন।',
      descEn: 'Check real-time processing status of submitted inquiries.',
      badgeBn: 'ট্র্যাকিং',
      badgeEn: 'Tracking',
      color: 'amber',
    },
  ];

  return (
    <section className="w-full">
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#006a4e]">
          {isBn ? 'নাগরিক সেবাসমূহ' : 'Citizen Services'}
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800">
          {isBn ? 'এনইআইআর অনলাইন সেবাসমূহ' : 'NEIR Key Citizen Services'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    srv.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                    srv.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                    srv.color === 'red' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {isBn ? srv.badgeBn : srv.badgeEn}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#006a4e] transition">
                  {isBn ? srv.titleBn : srv.titleEn}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isBn ? srv.descBn : srv.descEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#006a4e]">
                <span>{isBn ? 'প্রবেশ করুন' : 'Open Service'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
