import React from 'react';
import { ArrowRight } from 'lucide-react';
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
    { title: 'যাচাইয়ের তথ্য', description: 'আবেদনের কারণ ও ভ্রমণ বা ক্রয়ের তথ্য দিন।' },
    { title: 'প্রয়োজনীয় নথি', description: 'প্রয়োজনীয় ছবি বা PDF সংযুক্ত করুন।' },
  ] : [
    { title: 'Device information', description: 'Enter IMEI, brand, model and serial number.' },
    { title: 'Verification details', description: 'Add the reason and travel or purchase details.' },
    { title: 'Supporting documents', description: 'Attach relevant images or PDFs.' },
  ];

  return (
    <section className="neir-special-registration-section" aria-labelledby="neir-special-registration-heading">
      <div className="neir-source-guide-inner neir-special-registration-inner">
        <div className="neir-special-registration-content">
          <h2 id="neir-special-registration-heading">
            {bn ? 'বিশেষ নিবন্ধন' : 'Special Registration'}
          </h2>
          <p className="neir-special-registration-description">
            {bn
              ? 'বিদেশ থেকে আনা বা অতিরিক্ত যাচাই প্রয়োজন এমন ডিভাইস নিবন্ধনের আবেদন করুন। ডিভাইসের তথ্য ও প্রয়োজনীয় নথি প্রস্তুত রাখুন।'
              : 'Register a device brought from abroad or needing additional verification. Have your device details and documents ready.'}
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
