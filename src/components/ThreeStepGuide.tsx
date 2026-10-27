import React from 'react';
import type { Language } from '../types.ts';
import { ArrowRight, MessageSquareText, Phone, Smartphone } from 'lucide-react';

interface Props { language: Language; onOpenWebGuide: () => void; onOpenMobileGuide: () => void }
const sourceGuides = [
  {
    title: 'Check Phone Registration Status by IMEI', bg: '#F1F3F4',
    steps: [
      "You can find your phone’s 15-digit IMEI number by dialing *#06# on your phone, You can also check the device box or the purchase invoice. Alternatively, go to Settings, tap About Phone, then select Status to find the IMEI number.",
      'Go to your mobile phone’s messaging option and type KYD, add a space, then enter the 15-digit IMEI number. Example: KYD 123456789012345. Send the message to 16002.',
      'You will instantly receive a return message with the validity status of your mobile handset.',
    ],
  },
  {
    title: 'Check Mobile Numbers Registered Under Your NID', bg: '#F1F8E9',
    steps: [
      'Dial *16001# from any mobile number registered with your NID.',
      'When asked, enter the last 4 digits of your NID number.',
      'You will get an SMS with all mobile numbers registered under your NID (all operators).',
    ],
  },
];
const icons = [Smartphone, MessageSquareText, Phone];
export const ThreeStepGuide: React.FC<Props> = ({ language }) => (
  <div className="space-y-8">
    {sourceGuides.map((group, gi) => (
      <section key={group.title} className="rounded-[32px] p-6 sm:p-12 lg:p-16" style={{backgroundColor: group.bg}}>
        <h2 className="text-center font-bold text-2xl sm:text-3xl mb-10 text-slate-950"><span className="text-[#00838F]">3 Steps &amp;</span> {group.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {group.steps.map((step, i) => {
            const Icon = icons[(i + gi) % icons.length];
            return <div key={i} className="relative rounded-[24px] p-6 bg-white flex flex-col min-h-[210px]">
              <div className="flex gap-2 items-center mb-5"><span className="bg-[#E0F7FA] text-[#00838F] w-12 h-12 flex items-center justify-center rounded-xl"><Icon size={24}/></span><h3 className="text-xl font-semibold text-slate-950">Step {i + 1}</h3></div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-800">{step}</p>
              {i < 2 && <ArrowRight size={22} aria-hidden="true" className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-[#00ACC1] z-10" />}
            </div>;
          })}
        </div>
      </section>
    ))}
  </div>
);
