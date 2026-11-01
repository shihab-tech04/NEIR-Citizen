import React, { useState } from 'react';
import { ClipboardCheck, FileText, Search, Smartphone, CheckCircle2 } from 'lucide-react';
import type { Language } from '../types.ts';

type Props = { language: Language };
type Guide = 'imei' | 'special';
const guideContent = {
  en: {
    title: 'User Guide of NEIR',
    intro: 'Find device information and apply for Special Registration.',
    imei: 'Check IMEI',
    special: 'Special Registration',
    imeiSteps: [
      ['Open My Profile', 'Select My Profile from the navigation.', 'profile'],
      ['Search for a device', 'Enter a complete 14- or 15-digit IMEI number and select Search device.', 'search'],
      ['Review device information', 'Check the registration status and device details.', 'device'],
      ['Next step', 'If the handset is greylisted, select Apply for Special Registration.', 'complete'],
    ],
    specialSteps: [
      ['Enter IMEI', 'Enter the complete 14- or 15-digit IMEI number.', 'device'],
      ['Select acquisition method', 'Choose Air Mail, Gift or Foreign Tour.', 'search'],
      ['Complete the details', 'Enter the arrival date and attach the required documents.', 'file'],
      ['Submit the application', 'Submit and track its status under Special Registration applications.', 'complete'],
    ],
    hint: 'Your application status is available in My Profile after submission.',
  },
  bn: {
    title: 'NEIR ব্যবহার নির্দেশিকা',
    intro: 'ডিভাইসের তথ্য দেখুন এবং বিশেষ নিবন্ধনের আবেদন করুন।',
    imei: 'আইএমইআই যাচাই',
    special: 'বিশেষ নিবন্ধন',
    imeiSteps: [
      ['আমার প্রোফাইল খুলুন', 'নেভিগেশন থেকে আমার প্রোফাইল নির্বাচন করুন।', 'profile'],
      ['ডিভাইস খুঁজুন', '১৪ বা ১৫ সংখ্যার পূর্ণ আইএমইআই লিখে ডিভাইস খুঁজুন নির্বাচন করুন।', 'search'],
      ['ডিভাইসের তথ্য দেখুন', 'নিবন্ধনের অবস্থা ও ডিভাইসের বিস্তারিত দেখুন।', 'device'],
      ['পরবর্তী ধাপ', 'ডিভাইসটি গ্রেলিস্টেড হলে বিশেষ নিবন্ধনের আবেদন করুন।', 'complete'],
    ],
    specialSteps: [
      ['আইএমইআই লিখুন', '১৪ বা ১৫ সংখ্যার পূর্ণ আইএমইআই লিখুন।', 'device'],
      ['ডিভাইস পাওয়ার উপায় বাছুন', 'এয়ার মেইল, উপহার বা বিদেশ ভ্রমণ নির্বাচন করুন।', 'search'],
      ['তথ্য পূরণ করুন', 'আগমনের তারিখ এবং প্রয়োজনীয় নথি সংযুক্ত করুন।', 'file'],
      ['আবেদন জমা দিন', 'আবেদন জমা দিয়ে বিশেষ নিবন্ধনের তালিকায় অগ্রগতি দেখুন।', 'complete'],
    ],
    hint: 'আবেদন জমা দেওয়ার পর আমার প্রোফাইলে তার অবস্থা দেখতে পারবেন।',
  },
} as const;

const icons = {
  profile: Smartphone, search: Search, device: Smartphone, file: FileText, complete: CheckCircle2,
};

export const UserGuidesView: React.FC<Props> = ({ language }) => {
  const [guide, setGuide] = useState<Guide>('imei');
  const content = guideContent[language === 'bn' ? 'bn' : 'en'];
  const steps = guide === 'imei' ? content.imeiSteps : content.specialSteps;
  return (
    <section className="neir-source-subpage neir-source-guide-page space-y-8">
      <header className="text-center space-y-3">
        <h1 className="text-3xl md:text-[44px] text-slate-950 font-bold">{content.title}</h1>
        <p className="text-base sm:text-lg text-slate-700">{content.intro}</p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xl mx-auto" role="tablist" aria-label={content.title}>
        <button type="button" role="tab" aria-selected={guide === 'imei'} onClick={() => setGuide('imei')}
          className={guide === 'imei' ? 'bg-white border-[8px] border-[#00ACC1] text-[#00838F] rounded-3xl p-5 text-sm font-semibold' : 'bg-white border border-slate-200 rounded-3xl p-5 text-sm font-semibold'}>
          <Search className="mx-auto mb-3" size={30} aria-hidden="true"/>{content.imei}
        </button>
        <button type="button" role="tab" aria-selected={guide === 'special'} onClick={() => setGuide('special')}
          className={guide === 'special' ? 'bg-white border-[8px] border-[#00ACC1] text-[#00838F] rounded-3xl p-5 text-sm font-semibold' : 'bg-white border border-slate-200 rounded-3xl p-5 text-sm font-semibold'}>
          <ClipboardCheck className="mx-auto mb-3" size={30} aria-hidden="true"/>{content.special}
        </button>
      </div>
      <div className="neir-source-guide-content bg-white rounded-[32px] p-5 sm:p-8 lg:p-12 space-y-7">
        <h2 className="text-2xl sm:text-3xl font-semibold">{guide === 'imei' ? content.imei : content.special}</h2>
        <div className="space-y-7">
          {steps.map(([title,description,kind],index) => {
            const Icon = icons[kind];
            return <article key={title} className="neir-guide-step-card grid grid-cols-1 md:grid-cols-2 items-center gap-5 md:gap-8">
              <div className="neir-guide-step-text">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">{index+1}. {title}</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-7">{description}</p>
              </div>
              <div className="neir-guide-step-visual flex items-center justify-center min-h-36 rounded-xl border border-slate-100 bg-slate-50 text-[#00838F]">
                <Icon size={58} strokeWidth={1.5} aria-label={title}/>
              </div>
            </article>;
          })}
        </div>
        <p className="font-medium text-slate-900 border-t border-slate-200 pt-5">{content.hint}</p>
      </div>
    </section>
  );
};
