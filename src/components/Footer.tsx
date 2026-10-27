/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types.ts';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const isBn = language === 'bn';

  return (
    <footer className="w-full bg-[#032e22] text-slate-300 text-xs sm:text-sm mt-12 border-t-4 border-[#006a4e]">
      {/* Upper Footer: Contacts & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Col 1: BTRC Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 font-bold border border-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {isBn ? 'বিটিআরসি এনইআইআর' : 'BTRC NEIR'}
              </h3>
              <p className="text-[11px] text-emerald-300">
                {isBn ? 'ন্যাশনাল ইকুইপমেন্ট আইডেনটিটি রেজিস্টার' : 'National Equipment Identity Register'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300/80 leading-relaxed">
            {isBn
              ? 'মোবাইল ফোন হ্যান্ডসেটের আইএমইআই ডাটাবেজ সংরক্ষণ, নকল ও ক্লোন হ্যান্ডসেট রোধ এবং সাইবার নিরাপত্তা নিশ্চিতকরণে বিটিআরসি-এর জাতীয় উদ্যোগ।'
              : 'A national initiative by Bangladesh Telecommunication Regulatory Commission to maintain national IMEI records, prevent handset cloning, and bolster telecommunication security.'}
          </p>
        </div>

        {/* Col 2: Useful Links */}
        <div>
          <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 border-b border-emerald-800/80 pb-1 text-amber-300">
            {isBn ? 'প্রয়োজনীয় লিংক' : 'Important Links'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="http://www.btrc.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>{isBn ? 'বিটিআরসি অফিসিয়াল ওয়েবসাইট' : 'BTRC Official Portal'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://bangladesh.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>{isBn ? 'বাংলাদেশ জাতীয় তথ্য বাতায়ন' : 'National Web Portal'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://services.nidw.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>{isBn ? 'জাতীয় পরিচয়পত্র অনুবিভাগ (NID)' : 'National ID Wing (NID)'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://customs.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>{isBn ? 'বাংলাদেশ কাস্টমস' : 'Bangladesh Customs'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Guidelines & Support */}
        <div>
          <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 border-b border-emerald-800/80 pb-1 text-amber-300">
            {isBn ? 'সহায়তা ও সেবা' : 'Help & Support'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isBn ? 'কল সেন্টার: ১০০ (টোল ফ্রি)' : 'Call Center: 100 (Toll Free)'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-amber-300 text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700">SMS</span>
              <span>{isBn ? '১৬০০২ (KYD <space> ১৫ ডিজিটের IMEI)' : '16002 (KYD <space> 15 Digit IMEI)'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>neir@btrc.gov.bd</span>
            </li>
            <li className="text-[11px] text-slate-400 pt-1">
              {isBn ? 'সাপ্তাহিক কর্মদিবস: রবি - বৃহস্পতি (সকাল ৯টা - বিকাল ৫টা)' : 'Working Days: Sun - Thu (9:00 AM - 5:00 PM)'}
            </li>
          </ul>
        </div>

        {/* Col 4: Office Address */}
        <div>
          <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 border-b border-emerald-800/80 pb-1 text-amber-300">
            {isBn ? 'কার্যালয়ের ঠিকানা' : 'Office Address'}
          </h4>
          <div className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">
                {isBn ? 'বিটিআরসি ভবন' : 'BTRC Bhaban'}
              </p>
              <p>
                {isBn
                  ? 'প্লট: ই-৫/এ, আগারগাঁও প্রশাসনিক এলাকা, শেরেবাংলা নগর, ঢাকা-১২০৭।'
                  : 'Plot: E-5/A, Agargaon Administrative Area, Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#022018] py-4 px-4 sm:px-6 text-center text-[11px] text-slate-400 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()}{' '}
            {isBn
              ? 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি)। সর্বস্বত্ব সংরক্ষিত।'
              : 'Bangladesh Telecommunication Regulatory Commission (BTRC). All Rights Reserved.'}
          </div>
          <div className="flex items-center gap-4 text-emerald-400 text-xs">
            <span>{isBn ? 'গোপনীয়তা নীতিমালা' : 'Privacy Policy'}</span>
            <span>•</span>
            <span>{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}</span>
            <span>•</span>
            <span>{isBn ? 'প্রোটোটাইপ সংস্করণ ১.০' : 'Prototype v1.0'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
