import React from 'react';
import type {Language} from '../types.ts';
type Props={language:Language;onOpenWebGuide:()=>void;onOpenMobileGuide:()=>void};
const sections=[
  {heading:'Check Phone Registration Status by IMEI',background:'#F1F3F4',steps:[
    'Go to your mobile phone’s messaging option and type KYD, add a space, then enter the 15-digit IMEI number. Example:  KYD 123456789012345',
    'Send the message to 16002.',
    'You will instantly receive a return message with the validity status of your mobile handset.'
  ]},
  {heading:'Check Mobile Numbers Registered Under Your NID',background:'#F1F8E9',steps:[
    'Dial *16001# from any mobile number registered with your NID.',
    'When asked, enter the last 4 digits of your NID number.',
    'You will get an SMS with all mobile numbers registered under your NID (all operators).'
  ]}
];
const headingsBn=['IMEI দিয়ে ফোনের নিবন্ধন অবস্থা জানুন','আপনার NID-এ নিবন্ধিত মোবাইল নম্বর জানুন'];
const stepsBn=[
  [
    'ফোনের মেসেজ অপশনে KYD লিখে একটি স্পেস দিন, তারপর ১৫ সংখ্যার IMEI লিখুন। উদাহরণ: KYD 123456789012345',
    'মেসেজটি 16002 নম্বরে পাঠান।',
    'ফোনের বৈধতা ও নিবন্ধনের অবস্থা জানিয়ে একটি ফিরতি মেসেজ পাবেন।'
  ],
  [
    'আপনার NID দিয়ে নিবন্ধিত যেকোনো মোবাইল নম্বর থেকে *16001# ডায়াল করুন।',
    'অনুরোধ করা হলে NID নম্বরের শেষ ৪টি সংখ্যা লিখুন।',
    'আপনার NID দিয়ে নিবন্ধিত সব অপারেটরের মোবাইল নম্বরের তালিকা SMS-এ পাবেন।'
  ]
];
export const ThreeStepGuide:React.FC<Props> = ({language}) => <div className="neir-source-steps-wrap">
  {sections.map((section,g)=><section key={section.heading} className={'neir-source-guide-section neir-guide--'+g} aria-labelledby={'neir-guide-heading-'+g}>
    <div className="neir-source-guide-inner">
      <header className="neir-source-guide-heading">
        <p>{language==='bn'?'৩টি সহজ ধাপ':'3 simple steps'}</p>
        <h2 id={'neir-guide-heading-'+g}>{language==='bn'?headingsBn[g]:section.heading}</h2>
      </header>
      <div className="neir-source-steps-row">
        {section.steps.map((step,i)=><React.Fragment key={g+'-'+i}>
          <article className="neir-source-step-card">
            <div className={'neir-source-step-art neir-guide-art--'+i}>
              <img src={`${import.meta.env.BASE_URL}neir-source/images/step-${g*3+i+1}.svg`} alt={`Step ${i+1} illustration`} loading="lazy"/>
            </div>
            <div className="neir-source-step-content"><h3>{language==='bn'?'ধাপ':'Step'} {i+1}</h3><p>{language==='bn'?stepsBn[g][i]:step}</p></div>
          </article>
          {i<2 && <div className="neir-source-step-arrow"><img src={`${import.meta.env.BASE_URL}neir-source/frames/right-arrow.png`} alt="" aria-hidden="true" loading="lazy"/></div>}
        </React.Fragment>)}
      </div>
    </div>
  </section>)}
</div>;