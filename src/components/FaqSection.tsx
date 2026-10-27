/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language } from '../types.ts';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'general' | 'imei' | 'registration' | 'stolen';
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: '1',
    category: 'general',
    questionBn: 'এনইআইআর (NEIR) কী এবং এর মূল উদ্দেশ্য কী?',
    questionEn: 'What is NEIR and what is its primary objective?',
    answerBn: 'এনইআইআর (National Equipment Identity Register) হলো বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি) এর একটি কেন্দ্রীয় প্রযুক্তিগত সিস্টেম, যা দেশের সকল মোবাইল অপারেটরের নেটওয়ার্কে ব্যবহৃত হ্যান্ডসেটের আইএমইআই (IMEI) তথ্য সংরক্ষণ করে। এর মাধ্যমে অবৈধ, ক্লোন ও চোরাচালানকৃত মোবাইল হ্যান্ডসেট ব্যবহার রোধ করা এবং জাতীয় সাইবার নিরাপত্তা নিশ্চিত করা হয়।',
    answerEn: 'NEIR (National Equipment Identity Register) is a central regulatory platform established by BTRC to store and reconcile IMEI numbers across all national mobile network operators. It stops counterfeit, cloned, and smuggled handsets while strengthening telecom security.',
  },
  {
    id: '2',
    category: 'imei',
    questionBn: 'একটি নতুন বা পুরোনো ফোন কেনার পূর্বে কীভাবে নিশ্চিত হব যে এটি বৈধ?',
    questionEn: 'How can I ensure a phone is legitimate before buying it?',
    answerBn: 'হ্যান্ডসেটের মেসেজ অপশনে যান এবং টাইপ করুন: KYD <space> ১৫ ডিজিটের আইএমইআই (যেমন: KYD 123456789012345) এবং পাঠিয়ে দিন ১৬০০২ নম্বরে। ফিরতি মেসেজে বিটিআরসির ডাটাবেজে হ্যান্ডসেটটি বৈধভাবে অন্তর্ভুক্ত রয়েছে কি না তা নিশ্চিত করা হবে। অথবা এই পোর্টালে সরাসরি ১৫ ডিজিটের আইএমইআই লিখে তাৎক্ষণিক অনুসন্ধান করতে পারেন।',
    answerEn: 'Before purchasing, type KYD <space> 15 digit IMEI and send SMS to 16002. A return SMS will immediately tell you if the device is legally registered in BTRC database. Alternatively, use the IMEI verification tool on this portal.',
  },
  {
    id: '3',
    category: 'registration',
    questionBn: 'বিদেশ হতে ব্যক্তিগতভাবে আনা বা উপহারপ্রাপ্ত হ্যান্ডসেট কীভাবে নিবন্ধন করব?',
    questionEn: 'How do I register a personal handset brought from abroad or received as a gift?',
    answerBn: 'নাগরিক পোর্টালে আপনার জাতীয় পরিচয়পত্র (NID) ও মোবাইল নম্বর দিয়ে একাউন্ট তৈরি করুন। লগইন করে "বিশেষ হ্যান্ডসেট নিবন্ধন" মেন্যুতে গিয়ে পাসপোর্ট নম্বর, এয়ারপোর্ট কাস্টমস শুল্ক পরিশোধের স্লিপ (প্রযোজ্য ক্ষেত্রে) বা ব্যাগেজ ডিক্লারেশন কপি আপলোড করে আবেদন জমা দিন। যাচাই শেষে বিটিআরসি কর্তৃক হ্যান্ডসেটটি বৈধ তালিকায় যুক্ত হবে।',
    answerEn: 'Create a citizen account using your National ID (NID) and active mobile number. After logging in, go to "Special Handset Registration", provide your passport number, customs duty receipt/baggage clearance copy, and submit the request. It will be verified and added to the whitelist.',
  },
  {
    id: '4',
    category: 'registration',
    questionBn: 'যাত্রী ব্যাগেজ বিধিমালা অনুযায়ী একজন নাগরিক বিদেশ থেকে কয়টি মোবাইল হ্যান্ডসেট শুল্কমুক্ত আনতে পারেন?',
    questionEn: 'According to Passenger Baggage Rules, how many handsets can a passenger bring duty-free?',
    answerBn: 'বর্তমান ব্যাগেজ বিধিমালা অনুযায়ী একজন যাত্রী বিদেশ ভ্রমণ শেষে সর্বোচ্চ ২টি মোবাইল হ্যান্ডসেট সম্পূর্ণ শুল্কমুক্ত সুবিধায় সাথে আনতে পারেন। এর অতিরিক্ত হ্যান্ডসেটের ক্ষেত্রে বিমানবন্দর কাস্টমসে নির্ধারিত শুল্ক প্রদান সাপেক্ষে অনুমোদন গ্রহণ করতে হয়।',
    answerEn: 'Under prevailing baggage rules, an inbound traveler can bring up to 2 mobile handsets duty-free. Any handset beyond that requires formal customs clearance with payment of duty at the port of entry.',
  },
  {
    id: '5',
    category: 'stolen',
    questionBn: 'হ্যান্ডসেট চুরি বা হারিয়ে গেলে এনইআইআর এর মাধ্যমে কী করা উচিত?',
    questionEn: 'What should be done through NEIR if a handset is lost or stolen?',
    answerBn: 'হ্যান্ডসেট হারালে অবিলম্বে নিকটস্থ থানায় গিয়ে জিডি (সাধারণ ডায়েরি) সম্পন্ন করুন। আইনশৃঙ্খলা রক্ষাকারী বাহিনী তাদের অফিসিয়াল পোর্টালে তথ্য আপলোড করলে এনইআইআর সেন্ট্রাল সিস্টেমে ওই আইএমইআই ব্লকলিস্ট করা হয়, যাতে কোনো সিম ব্যবহার করে হ্যান্ডসেটটি পরিচালনা করা না যায়।',
    answerEn: 'Immediately file a General Diary (GD) with the local police station. Law enforcement authorities update the central NEIR blacklist, terminating cellular network services across all national operators for that device.',
  },
  {
    id: '6',
    category: 'general',
    questionBn: 'বিদেশি পর্যটকদের রোমিং সিম ব্যবহারে কোনো বাধা আছে কি?',
    questionEn: 'Are international roaming SIM cards affected when visiting Bangladesh?',
    answerBn: 'না। বিদেশি পাসপোর্টধারী ভ্রমণকারী ও পর্যটকদের আন্তর্জাতিক রোমিং সিম ব্যবহারে এনইআইআর কোনো প্রতিবন্ধকতা তৈরি করে না। তারা নির্বিঘ্নে রোমিং সুবিধা ব্যবহার করতে পারবেন।',
    answerEn: 'No. Tourists and international travelers utilizing international roaming SIMs are exempt and can roam freely without restriction on local cellular infrastructure.',
  },
];

interface FaqSectionProps {
  language: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ language }) => {
  const isBn = language === 'bn';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['1', '2']);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const qText = isBn ? item.questionBn : item.questionEn;
    const aText = isBn ? item.answerBn : item.answerEn;
    const matchesSearch =
      searchQuery.trim() === '' ||
      qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="faq-section" className="w-full bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006a4e]">
            {isBn ? 'সহায়তা ও তথ্য' : 'Information & Support'}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            {isBn ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h3>
          <p className="text-xs text-slate-500">
            {isBn
              ? 'এনইআইআর এবং হ্যান্ডসেট নিবন্ধন সম্পর্কিত সর্বাধিক জিজ্ঞাসিত প্রশ্নাবলী'
              : 'Common queries regarding NEIR system, mobile verification, and baggage rules'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'প্রশ্ন খুঁজুন...' : 'Search questions...'}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#006a4e] focus:ring-1 focus:ring-emerald-200 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'সকল প্রশ্ন' : 'All Topics'}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('general')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
            activeCategory === 'general'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'এনইআইআর পরিচিতি' : 'About NEIR'}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('imei')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
            activeCategory === 'imei'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'আইএমইআই যাচাই' : 'IMEI Verification'}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('registration')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
            activeCategory === 'registration'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'হ্যান্ডসেট নিবন্ধন ও কাস্টমস' : 'Registration & Customs'}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('stolen')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
            activeCategory === 'stolen'
              ? 'bg-[#006a4e] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'হারানো ফোন ও ব্লকলিস্ট' : 'Stolen / Blacklist'}
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {isBn ? 'কোনো প্রশ্নোত্তর খুঁজে পাওয়া যায়নি।' : 'No matching questions found.'}
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="border border-slate-200 rounded-lg overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-4 py-3.5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left gap-3 cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {isBn ? faq.questionBn : faq.questionEn}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 py-3.5 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                    {isBn ? faq.answerBn : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
