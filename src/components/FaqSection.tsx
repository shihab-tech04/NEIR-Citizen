import React, { useState } from 'react';
import type { Language } from '../types.ts';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Group = { title: string; items: { q: string; a: string }[] };
const sourceGroups: Group[] = [
  {title: 'IMEI Basics', items: [
    {q: 'What is an IMEI number?', a: 'IMEI (International Mobile Equipment Identity) is a unique 15-digit number assigned to every mobile device.'},
    {q: 'How can I find my IMEI?', a: 'Dial *#06#\nCheck the device box\nCheck the invoice\nLook in device settings (About Phone → Status → IMEI)'}
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
const recoveredGroups: Record<string, Group[]> = {
  "Registration": [
    {
      "title": "Understanding Special Registration",
      "items": [
        {
          "q": "What is special registration?",
          "a": "This applies to devices that do not fall under the standard registration process, such as:\n* Personal imports\n* Devices purchased while traveling abroad\n* Devices belonging to foreign visitors."
        },
        {
          "q": "I am a foreign visitor. Do I need to register my phone?",
          "a": "Yes, if you intend to use it beyond 30 days with a local SIM."
        }
      ]
    },
    {
      "title": "Usage Duration",
      "items": [
        {
          "q": "How long can I use my phone without special registration?",
          "a": "You can use your phone on mobile networks without special registration for up to 90 days. To continue using the device beyond this period, you must complete the special registration process within these 90 days. Otherwise, your device will be blocked, and you will need to contact the regulatory authority (BTRC) to unblock it."
        },
        {
          "q": "How long does Special Registration take?",
          "a": "This is a manual verification process managed by the regulatory authority (BTRC). You can expect the results within 3–5 working days."
        }
      ]
    },
    {
      "title": "Requirements and Rules",
      "items": [
        {
          "q": "What documents are required?",
          "a": "Documents such as:\n* Passport\n* Visa\n* Entry stamp\n* Foreign purchase invoice\n* Other supporting IDs.\nThe exact list of documents can vary depending on the reason for the application."
        },
        {
          "q": "Can Special Registration be rejected?",
          "a": "Yes, for incorrect documents or travel information and incomplete applications."
        }
      ]
    }
  ],
  "Account & Help": [
    {
      "title": "Account Creation & Access",
      "items": [
        {
          "q": "How do I create a NEIR account?",
          "a": "To create a NEIR account:\nClick “Register” on the login screen.\nEnter your mobile number and the last 4 digits of your Document ID (NID/Smart NID/Birth Certificate/Driving License/Passport).\nClick “Request OTP” and enter the received OTP.\nSet and confirm your new password.\nClick “Create Account” to finish.\n\nYour account will be created instantly after successful verification."
        },
        {
          "q": "I forgot my password. What should I do?",
          "a": "Click Forgot Password on the login page\nEnter your registered mobile number or username\nVerify your identity using OTP\nSet a new password\nLog in using your new credentials"
        },
        {
          "q": "Why is my account locked?",
          "a": "Your account may be temporarily locked due to multiple unsuccessful login attempts. Please wait for the lock period to end or reset your password to regain access."
        }
      ]
    },
    {
      "title": "OTP & Login Issues",
      "items": [
        {
          "q": "How do I login?",
          "a": "Click “Login” on the home screen.\nEnter your mobile number linked to your Document ID (NID/Smart NID/Passport).\nEnter your password.\nClick “Login” to access your account."
        },
        {
          "q": "What if my OTP is not verified during registration?",
          "a": "If the OTP verification fails or expires:\nReturn to the Login screen.\nSelect “Forgot Password”.\nEnter your registered mobile number and request a new OTP.\nVerify the OTP and set a new password."
        },
        {
          "q": "What if I don’t receive my OTP?",
          "a": "Check that you have network signal, wait a few moments, and try resending the OTP. Also ensure that SMS messages are not blocked on your device."
        }
      ]
    },
    {
      "title": "Documents & Verification",
      "items": [
        {
          "q": "Which documents are relevant for verification or claims?",
          "a": "The type of documents you need depends on the type of application you are submitting:\n\nReporting a Lost or Stolen Device, You typically need:\n* GD copy / Police report\n* Proof of purchase (invoice, receipt, or bank statement)\n* Photo of the device or device box (showing IMEI if possible).\n\nFor Special Registration, You generally need:\n* Passport Information\n* Passport Arrival detail seal page\n* Photo of the device or device box (showing IMEI if possible)\n* Ticket/Boarding pass/ any relevant document"
        },
        {
          "q": "What if my document is blurry?",
          "a": "The system may reject blurry or unreadable documents. Please ensure you upload a clear and legible version to avoid delays."
        }
      ]
    }
  ],
  "About NEIR": [
    {
      "title": "About NEIR",
      "items": [
        {
          "q": "What is NEIR?",
          "a": "NEIR (National Equipment Identity Register) is a centralized system managed by BTRC to verify mobile device IMEI numbers and prevent illegal, cloned, or stolen phones from operating in Bangladesh."
        },
        {
          "q": "Why is NEIR important?",
          "a": "It protects citizens from fraud, enables law enforcement to track stolen devices, and helps ensure that only legally imported and verified devices operate on Bangladeshi networks."
        }
      ]
    },
    {
      "title": "Users & Access",
      "items": [
        {
          "q": "Who should use the NEIR Citizen Portal?",
          "a": "Any individual who wants to check, register, or report a mobile device, including citizens, students, workers, travelers, and foreign visitors."
        }
      ]
    },
    {
      "title": "Device Coverage & Control",
      "items": [
        {
          "q": "Does NEIR block illegal or stolen devices?",
          "a": "Yes. Devices found to be illegal, cloned, or reported as stolen may be blocked from connecting to any mobile network in Bangladesh."
        },
        {
          "q": "What devices does NEIR cover?",
          "a": "All mobile devices with IMEI numbers: Smartphones, Feature phones, Tablets with cellular connectivity, Other IMEI-enabled devices"
        }
      ]
    },
    {
      "title": "Privacy & Security",
      "items": [
        {
          "q": "Is my personal information safe?",
          "a": "Yes, NEIR follows national data protection guidelines. Only authorized personnel can access submitted information."
        }
      ]
    }
  ]
};
const categories = ['IMEI Check','Registration','Account & Help','About NEIR'];
export const FaqSection: React.FC<{language:Language}> = () => {
  const [selected,setSelected] = useState('IMEI Check');
  const [open,setOpen] = useState<string[]>([]);
  const activeGroups = selected === 'IMEI Check' ? sourceGroups : recoveredGroups[selected] ?? [];
  const toggle = (id:string) => setOpen(v => v.includes(id) ? v.filter(k => k !== id) : [...v,id]);
  return <section id="faq-section" className="neir-faq-source bg-[#F2F9F4] rounded-[32px] px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
    <div className="neir-faq-intro text-center mb-9"><h2 className="text-3xl sm:text-4xl font-bold text-slate-950">FAQ</h2><p className="mt-2 text-lg text-slate-700">Need help?</p></div>
    <div className="neir-faq-content max-w-[1250px] mx-auto">
      <div className="neir-faq-tabs flex overflow-x-auto gap-2 mb-6" role="tablist" aria-label="FAQ categories">
        {categories.map(cat => <button key={cat} role="tab" aria-selected={selected === cat} onClick={() => {setSelected(cat);setOpen([]);}} className={selected === cat ? 'neir-faq-tab flex-1 min-w-max bg-[#00ACC1] text-white rounded-lg px-5 py-3 font-medium text-sm' : 'neir-faq-tab flex-1 min-w-max bg-white text-slate-600 rounded-lg px-5 py-3 font-medium text-sm hover:bg-cyan-50'}>{cat}</button>)}
      </div>
      <div className="space-y-5">{activeGroups.map((group,g) => <div key={group.title} className="neir-faq-group bg-white rounded-3xl p-5 sm:p-7">
          <h3 className="neir-faq-group-title text-lg sm:text-xl font-bold mb-5">{group.title}</h3>
          <div className="flex flex-col gap-2">{group.items.map((item,i) => {const id=g+'-'+i;const visible=open.includes(id);return <div key={id} className="neir-faq-item border border-[#E3DBD8] rounded-2xl px-4">
            <button aria-expanded={visible} onClick={() => toggle(id)} className="neir-faq-question w-full flex items-center justify-between gap-3 text-left text-sm sm:text-base font-medium py-3 text-slate-800"><span>{item.q}</span>{visible ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>
            {visible && <p className="neir-faq-answer text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line pb-4">{item.a}</p>}
          </div>})}</div>
        </div>)}</div>
    </div>
  </section>;
};
