import React from 'react';
import type { Language } from '../types.ts';

type Props = {
  language: Language;
  onOpenWebGuide: () => void;
  onOpenMobileGuide: () => void;
};

const sections = [
  {
    heading: 'Check Phone Registration Status by IMEI',
    headingBn: 'IMEI দিয়ে ফোনের নিবন্ধন অবস্থা জানুন',
    actions: ['Find your IMEI', 'Send the SMS', 'Read the result'],
    actionsBn: ['IMEI নম্বর দেখুন', 'SMS পাঠান', 'ফলাফল পড়ুন'],
    steps: [
      'Dial *#06# on your phone to display the 15-digit IMEI number.',
      'Send KYD, a space and your 15-digit IMEI to 16002. Example: KYD 123456789012345.',
      'Read the SMS reply for handset legality. For a used phone’s current NEIR registration status, use the official portal or dial *16161#.',
    ],
    stepsBn: [
      'ফোনে *#06# ডায়াল করে ১৫ সংখ্যার IMEI নম্বরটি দেখুন।',
      'KYD লিখে স্পেস দিন, তারপর ১৫ সংখ্যার IMEI লিখে 16002 নম্বরে SMS পাঠান। উদাহরণ: KYD 123456789012345।',
      'ফিরতি SMS-এ হ্যান্ডসেটের বৈধতার ফলাফল দেখুন। ব্যবহৃত ফোনের বর্তমান NEIR নিবন্ধন অবস্থা দেখতে সরকারি পোর্টাল বা *16161# ব্যবহার করুন।',
    ],
    alt: [
      'Phone dialer displaying *#06# and a sample 15-digit IMEI.',
      'SMS addressed to 16002 with KYD followed by a 15-digit IMEI.',
      'Neutral IMEI legality reply: not a guaranteed verified status.',
    ],
    altBn: [
      '*#06# ডায়াল করে ১৫ সংখ্যার IMEI দেখার চিত্র।',
      '16002 নম্বরে KYD ও ১৫ সংখ্যার IMEI পাঠানোর চিত্র।',
      'IMEI যাচাইয়ের নিরপেক্ষ ফিরতি SMS-এর চিত্র; নিশ্চিত সফলতার প্রতীক নয়।',
    ],
  },
  {
    heading: 'Check Mobile Numbers Registered Under Your NID',
    headingBn: 'আপনার NID-এ নিবন্ধিত মোবাইল নম্বর জানুন',
    actions: ['Dial the code', 'Enter NID digits', 'Read the SMS'],
    actionsBn: ['কোড ডায়াল করুন', 'NID-এর সংখ্যা দিন', 'SMS দেখুন'],
    steps: [
      'From a mobile number registered with your NID, dial *16001#.',
      'When prompted, enter the last four digits of your NID.',
      'Read the SMS reply to see the mobile numbers linked to your NID. Number details may be masked.',
    ],
    stepsBn: [
      'আপনার NID-এ নিবন্ধিত মোবাইল নম্বর থেকে *16001# ডায়াল করুন।',
      'অনুরোধ করা হলে NID নম্বরের শেষ ৪টি সংখ্যা লিখুন।',
      'ফিরতি SMS-এ আপনার NID-এ নিবন্ধিত নম্বরগুলো দেখুন। কিছু সংখ্যা আংশিক গোপন থাকতে পারে।',
    ],
    alt: [
      'Phone dialer displaying the *16001# NID SIM lookup code.',
      'Phone prompt asking for the final four digits of an NID.',
      'Illustrative SMS with sample masked Bangladesh mobile numbers.',
    ],
    altBn: [
      'NID-এ নিবন্ধিত সিম খুঁজতে *16001# ডায়াল করার চিত্র।',
      'NID-এর শেষ ৪ সংখ্যা দেওয়ার নির্দেশনার চিত্র।',
      'বাংলাদেশের আংশিক গোপন নম্বরসহ নমুনা ফিরতি SMS-এর চিত্র।',
    ],
  },
] as const;

export const ThreeStepGuide: React.FC<Props> = ({ language }) => (
  <div className="neir-source-steps-wrap">
    {sections.map((section, groupIndex) => (
      <section key={section.heading}
        className={'neir-source-guide-section neir-guide--' + groupIndex}
        aria-labelledby={'neir-guide-heading-' + groupIndex}>
        <div className="neir-source-guide-inner">
          <header className="neir-source-guide-heading">
            <p>{language === 'bn' ? '৩টি সহজ ধাপ' : '3 simple steps'}</p>
            <h2 id={'neir-guide-heading-' + groupIndex}>
              {language === 'bn' ? section.headingBn : section.heading}
            </h2>
          </header>
          <div className="neir-source-steps-row">
            {section.steps.map((step, stepIndex) => (
              <React.Fragment key={groupIndex + '-' + stepIndex}>
                <article className="neir-source-step-card">
                  <div className={'neir-source-step-art neir-guide-art--' + stepIndex}>
                    <img
                      src={`${import.meta.env.BASE_URL}neir-guide/step-${groupIndex * 3 + stepIndex + 1}.svg`}
                      alt={language === 'bn' ? section.altBn[stepIndex] : section.alt[stepIndex]}
                      loading="lazy"
                    />
                  </div>
                  <div className="neir-source-step-content">
                    <h3>
                      {language === 'bn' ? 'ধাপ' : 'Step'} {stepIndex + 1}: {' '}
                      {language === 'bn' ? section.actionsBn[stepIndex] : section.actions[stepIndex]}
                    </h3>
                    <p>{language === 'bn' ? section.stepsBn[stepIndex] : step}</p>
                  </div>
                </article>
                {stepIndex < 2 && (
                  <div className="neir-source-step-arrow" aria-hidden="true">
                    <img src={`${import.meta.env.BASE_URL}neir-source/frames/right-arrow.png`}
                      alt="" loading="lazy" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    ))}
  </div>
);
