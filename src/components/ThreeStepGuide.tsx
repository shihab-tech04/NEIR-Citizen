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
const imageColors=['#B2EBF2','#D1C4E9','#DCEDC8'];
export const ThreeStepGuide:React.FC<Props> = () => <div className="neir-source-steps-wrap">
  {sections.map((section,g)=><section key={section.heading} className="neir-source-guide-section" style={{backgroundColor:section.background}}>
    <div className="neir-source-guide-inner">
      <header className="neir-source-guide-heading">
        <h2>3 Steps &amp;</h2>
        <p>{section.heading}</p>
      </header>
      <div className="neir-source-steps-row">
        {section.steps.map((step,i)=><React.Fragment key={g+'-'+i}>
          <article className="neir-source-step-card">
            <div className="neir-source-step-art" style={{backgroundColor:imageColors[i]}}>
              <img src={`${import.meta.env.BASE_URL}neir-source/images/step-${g*3+i+1}.svg`} alt={`Step ${i+1} illustration`} loading="lazy"/>
            </div>
            <div className="neir-source-step-content"><h3>Step {i+1}</h3><p>{step}</p></div>
          </article>
          {i<2 && <div className="neir-source-step-arrow"><img src={`${import.meta.env.BASE_URL}neir-source/frames/right-arrow.png`} alt="" aria-hidden="true" loading="lazy"/></div>}
        </React.Fragment>)}
      </div>
    </div>
  </section>)}
</div>;