import React from 'react';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import type { Language } from '../types.ts';

type Props = {
  language: Language;
  onApply: () => void;
  completionMessage?: string;
};

/** New page entry point; the existing three-step citizen wizard owns registration state. */
export const SpecialRegistrationSection: React.FC<Props> = ({ language, onApply, completionMessage }) => {
  const bn = language === 'bn';
  const instructions = bn ? [
    { title: 'ডিভাইসের তথ্য', description: 'IMEI, ব্র্যান্ড, মডেল ও সিরিয়াল নম্বর দিন।' },
    { title: 'যাচাইয়ের তথ্য', description: 'আবেদনের কারণ ও ভ্রমণ বা ক্রয়-সংক্রান্ত তথ্য দিন।' },
    { title: 'প্রয়োজনীয় নথি', description: 'প্রযোজ্য ছবি বা PDF নথি সংযুক্ত করুন।' },
  ] : [
    { title: 'Device information', description: 'Provide your IMEI, brand, model and serial number.' },
    { title: 'Verification details', description: 'Enter the reason for registration and relevant travel or purchase details.' },
    { title: 'Supporting documents', description: 'Attach the applicable images or PDF documents.' },
  ];

  return (
    <section className="neir-special-registration-section" aria-labelledby="neir-special-registration-heading">
      <div className="neir-source-guide-inner neir-special-registration-inner">
        <div className="neir-special-registration-content">
          <p className="neir-special-registration-kicker">
            <ClipboardCheck size={20} aria-hidden="true" />
            {bn ? 'ডিভাইস নিবন্ধন' : 'Device registration'}
          </p>
          <h2 id="neir-special-registration-heading">
            {bn ? 'বিশেষ নিবন্ধন' : 'Special Registration'}
          </h2>
          <p className="neir-special-registration-description">
            {bn
              ? 'বিদেশ থেকে আনা বা অতিরিক্ত যাচাই প্রয়োজন এমন মোবাইল ডিভাইস নিবন্ধনের জন্য আবেদন করুন। আবেদন করতে ডিভাইসের তথ্য, নিবন্ধনের কারণ এবং প্রয়োজনীয় নথি প্রস্তুত রাখুন।'
              : 'Need to register a mobile device brought from abroad or one that requires additional verification? Prepare your device information, registration details and supporting documents to apply.'}
          </p>
          <div className="neir-special-registration-action">
            <button className="neir-special-registration-button" type="button" onClick={onApply}>
              {bn ? 'বিশেষ নিবন্ধনের আবেদন করুন' : 'Apply for Special Registration'}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
          {completionMessage && <p role="status" className="neir-special-registration-status">{completionMessage}</p>}
        </div>
        <div className="neir-special-registration-instructions" aria-label={bn ? 'আবেদনের ধাপ' : 'Application steps'}>
          <h3 className="neir-special-registration-list-heading">
            {bn ? 'আবেদন করার ধাপ' : 'How to apply'}
          </h3>
          <ol className="neir-special-registration-list">
            {instructions.map((instruction, index) => (
              <li className="neir-special-registration-step" key={instruction.title}>
                <span className="neir-special-registration-number" aria-hidden="true">{index + 1}</span>
                <div className="neir-special-registration-step-copy">
                  <h4>{instruction.title}</h4>
                  <p>{instruction.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
