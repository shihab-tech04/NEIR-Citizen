import React from 'react';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import type { Language } from '../types.ts';

type Props = {
  language: Language;
  onApply: () => void;
  completionMessage?: string;
};

/** Entry point only: the 3-step form itself is the existing citizen registration modal. */
export const SpecialRegistrationSection: React.FC<Props> = ({ language, onApply, completionMessage }) => {
  const bn = language === 'bn';
  return (
    <section className="neir-special-registration-section" aria-labelledby="neir-special-registration-heading">
      <div className="neir-special-registration-content">
        <p className="neir-special-registration-kicker">
          <ClipboardCheck size={18} aria-hidden="true" />
          {bn ? 'ডিভাইস নিবন্ধন' : 'Device registration'}
        </p>
        <h2 id="neir-special-registration-heading">
          {bn ? 'বিশেষ নিবন্ধন কী?' : 'What is Special Registration?'}
        </h2>
        <p className="neir-special-registration-description">
          {bn
            ? 'বিদেশ থেকে আনা বা অতিরিক্ত যাচাই প্রয়োজন এমন মোবাইল ডিভাইসের জন্য বিশেষ নিবন্ধন আবেদন করা যায়। প্রথমে ডিভাইসের IMEI ও বিবরণ দিন, তারপর আবেদনের কারণ ও প্রয়োজনীয় কাগজপত্র যোগ করুন।'
            : 'Special Registration is a request to review a mobile device that needs additional registration verification, such as a handset brought from abroad. You provide its IMEI, device details, the reason for registration, and supporting documents for review.'}
        </p>
        <div className="neir-special-registration-instructions" aria-label={bn ? 'আবেদনের ধাপ' : 'Application steps'}>
          <p><strong>{bn ? '১. ডিভাইসের তথ্য' : '1. Device information'}</strong>
            {bn ? ' — IMEI-এর প্রথম ১৪টি সংখ্যা, ব্র্যান্ড ও মডেল দিন।' : ' — Enter the first 14 IMEI digits, brand and model.'}</p>
          <p><strong>{bn ? '২. যাচাইয়ের তথ্য' : '2. Verification details'}</strong>
            {bn ? ' — আবেদনের কারণ এবং প্রয়োজনীয় ভ্রমণ বা ক্রয়-সংক্রান্ত তথ্য দিন।' : ' — Select the application reason and provide relevant travel or purchase details.'}</p>
          <p><strong>{bn ? '৩. প্রয়োজনীয় নথি' : '3. Supporting documents'}</strong>
            {bn ? ' — প্রযোজ্য ছবি বা PDF সংযুক্ত করে তথ্য যাচাই করুন।' : ' — Attach the applicable PNG, JPG or PDF documents and review the form.'}</p>
        </div>
        <p className="neir-special-registration-disclaimer">
          {bn ? 'এই প্রোটোটাইপে আবেদনটি পরীক্ষামূলক; BTRC-তে কোনো বাস্তব আবেদন জমা হয় না।'
              : 'This prototype validates the form locally only; it does not submit an application to BTRC.'}
        </p>
        {completionMessage && <p role="status" className="neir-special-registration-status">{completionMessage}</p>}
      </div>
      <div className="neir-special-registration-action">
        <button className="neir-special-registration-button" type="button" onClick={onApply}>
          {bn ? 'বিশেষ নিবন্ধনের আবেদন করুন' : 'Apply for Special Registration'}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
