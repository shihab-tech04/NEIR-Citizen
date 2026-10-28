import React, { useState } from 'react';
import type { Language } from '../types.ts';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Group = { title: string; items: { q: string; a: string }[] };
const sourceGroups: Group[] = [
  {title: 'IMEI Basics', items: [
    {q: 'What is an IMEI number?', a: 'IMEI (International Mobile Equipment Identity) is a unique 15-digit number assigned to every mobile device.'},
    {q: 'How can I find my IMEI?', a: '* Dial *#06#\n* Check the device box\n* Check the invoice\n* Look in device settings (About Phone → Status → IMEI)'}
  ]},
  {title: 'IMEI Status Meanings', items: [
    {q: 'What does “Verified” mean in IMEI Check?', a: 'The device is legal and registered in NEIR with valid documents.'},
    {q: 'What does “Stolen or Blocked” mean?', a: 'The device has been reported as lost or stolen by the original owner or it is blocked by regulatory authority (BTRC).'}
  ]},
  {title: 'Troubleshooting Special Cases', items: [
    {q: 'Why am I seeing multiple IMEI numbers on my dashboard?', a: 'You are seeing multiple IMEI numbers because this SIM card has been used in different phones before or is currently used in different SIM slots. Some of these phones were used by you, while others were used by someone else earlier. The system also keeps old records, so all of them appear together.'},
    {q: 'Why does my new phone show “Not Registered”?', a: 'It may not have been added to the NEIR database yet. You can submit a Device Registration request with valid documents from NEIR portal. Regulatory authority (BTRC) will review your registration request. You will be notified about your registration status by SMS and you can also check it from the portal.'},
    {q: 'What if IMEI Check shows the wrong model or device details?', a: 'This may indicate a cloned IMEI. Register the device or contact support.'},
    {q: 'My phone has more than one SIM. Which one should I check?', a: 'If your device supports more than one SIM, it will have multiple IMEI numbers. Each SIM slot is assigned a different IMEI. Therefore, to check the IMEI status, you must check each IMEI individually for all SIM slots.'},
  ]},
];
const categories = ['IMEI Check','Registration','Account & Help','About NEIR'];
export const FaqSection: React.FC<{language:Language}> = () => {
  const [selected,setSelected] = useState('IMEI Check');
  const [open,setOpen] = useState<string[]>(['0-0']);
  const toggle = (id:string) => setOpen(v => v.includes(id) ? v.filter(k => k !== id) : [...v,id]);
  return <section id="faq-section" className="bg-[#F2F9F4] rounded-[32px] px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
    <div className="text-center mb-9"><h2 className="text-3xl sm:text-4xl font-bold text-slate-950">FAQ</h2><p className="mt-2 text-lg text-slate-700">Need help?</p></div>
    <div className="max-w-[1250px] mx-auto">
      <div className="flex overflow-x-auto gap-2 mb-6" role="tablist" aria-label="FAQ categories">
        {categories.map(cat => <button key={cat} role="tab" aria-selected={selected === cat} onClick={() => setSelected(cat)} className={selected === cat ? 'flex-1 min-w-max bg-[#00ACC1] text-white rounded-lg px-5 py-3 font-medium text-sm' : 'flex-1 min-w-max bg-white text-slate-600 rounded-lg px-5 py-3 font-medium text-sm hover:bg-cyan-50'}>{cat}</button>)}
      </div>
      {selected !== 'IMEI Check' ? <div className="bg-white rounded-3xl p-8 text-sm text-slate-600">The saved reference captures the IMEI Check category only. Content for “{selected}” is not available in this HTML snapshot and has intentionally not been invented.</div>
      : <div className="space-y-5">{sourceGroups.map((group,g) => <div key={group.title} className="bg-white rounded-3xl p-5 sm:p-7">
          <h3 className="text-lg sm:text-xl font-bold mb-5">{group.title}</h3>
          <div className="divide-y divide-slate-100">{group.items.map((item,i) => {const id=g+'-'+i;const visible=open.includes(id);return <div key={id} className="py-2">
            <button aria-expanded={visible} onClick={() => toggle(id)} className="w-full flex items-center justify-between gap-3 text-left text-sm sm:text-base font-medium py-3 text-slate-800"><span>{item.q}</span>{visible ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>
            {visible && <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line pb-4">{item.a}</p>}
          </div>})}</div>
        </div>)}</div>}
    </div>
  </section>;
};
