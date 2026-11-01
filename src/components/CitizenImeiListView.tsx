import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Info, MoreVertical, Search, X } from 'lucide-react';
import type { Language, UserSession } from '../types.ts';

type DeviceStatus = 'Registered' | 'Applied for registration' | 'Registration Pending' | 'Restricted (demo)';
type Device = { imei: string; status: DeviceStatus };
type WizardStep = 1 | 2 | 3 | 4;
type FormState = {
  imei: string; device: string; brand: string; model: string; serial: string;
  bmet: 'No' | 'Yes'; bmetNumber: string; reason: string; arrival: string;
  passport: string; purchase: string; tax: string; eligibility: 'local' | 'foreign' | ''; verificationMethod: string; remarks: string;
};
const blankForm: FormState = { imei: '', device: 'Handset', brand: '', model: '', serial: '', bmet: 'No', bmetNumber: '', reason: '', arrival: '', passport: '', purchase: '', tax: '', eligibility: '', verificationMethod: 'Passport', remarks: '' };
const demoNumbers = [
  '99000100000001','99000100000002','99000100000003','99000100000004','99000100000005',
  '99000100000006','99000100000007','99000100000008','99000100000009','99000100000010',
  '99000100000011','99000100000012','99000100000013','99000100000014','99000100000015',
  '99000100000016','99000100000017','99000100000018','99000100000019',
];
const demoDevices: Device[] = demoNumbers.map((imei, i) => ({
  imei, status: i === 1 ? 'Applied for registration' : i === 3 ? 'Registration Pending' : 'Registered',
}));
const requirements = [
  { key: 'passportInfo', label: 'Passport info page', required: true },
  { key: 'arrivalSeal', label: 'Passport arrival date seal', required: true },
  { key: 'deviceBox', label: 'Device box IMEI no', required: true },
  { key: 'travelDoc', label: 'Travel document', required: false },
] as const;
type UploadKey = typeof requirements[number]['key'];
type Uploaded = Partial<Record<UploadKey, File>>;
const statusStyle: Record<DeviceStatus, string> = {
  Registered: 'bg-emerald-50 text-emerald-800',
  'Applied for registration': 'bg-sky-50 text-sky-800',
  'Registration Pending': 'bg-amber-50 text-amber-800',
  'Restricted (demo)': 'bg-red-50 text-red-800',
};

type Props = { language: Language; session: UserSession; registrationOnly?: boolean; registrationTrigger?: number | null; onRegistrationHandled?: () => void; onRegistrationComplete?: (message: string) => void };
export const CitizenImeiListView: React.FC<Props> = ({ language, session, registrationOnly = false, registrationTrigger = null, onRegistrationHandled, onRegistrationComplete }) => {
  const [tab, setTab] = useState<'registered' | 'restricted'>('registered');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [devices, setDevices] = useState<Device[]>(demoDevices);
  const [actionRow, setActionRow] = useState<string | null>(null);
  const [detail, setDetail] = useState<Device | null>(null);
  const [wizard, setWizard] = useState(false);
  const [registrationIntro, setRegistrationIntro] = useState(true);
  const [extraImeis, setExtraImeis] = useState<string[]>([]);
  const observedRegistrationTrigger = useRef<number | null>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<FormState>(blankForm);
  const [uploads, setUploads] = useState<Uploaded>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [stolenTarget, setStolenTarget] = useState<Device | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(session.name);

  const isBn = language === 'bn';
  const pageSize = 10;
  const filtered = useMemo(() => devices.filter(d => d.imei.includes(search.replace(/\D/g, '')) && (tab === 'registered' ? d.status !== 'Restricted (demo)' : d.status === 'Restricted (demo)')), [devices, search, tab]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const update = (name: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const startRegistration = (imei = '') => {
    setForm({ ...blankForm, imei });
    setExtraImeis([]); setUploads({}); setStep(1); setRegistrationIntro(true); setErrors({}); setResult(''); setActionRow(null); setWizard(true);
  };
  // A one-shot request also works when a citizen signs in before the homepage wizard mounts.
  useEffect(() => {
    if (registrationTrigger === null) {
      observedRegistrationTrigger.current = null;
      return;
    }
    if (registrationOnly && registrationTrigger !== observedRegistrationTrigger.current) {
      observedRegistrationTrigger.current = registrationTrigger;
      startRegistration();
      onRegistrationHandled?.();
    }
  }, [registrationOnly, registrationTrigger]);

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!/^\d{14,15}$/.test(form.imei)) e.imei = 'Enter a valid 14 or 15 digit IMEI.';
      if (!form.device) e.device = 'Select device.';
      if (!form.model.trim()) e.model = 'Device model number is required.';
      if (extraImeis.some(value => !/^\d{14,15}$/.test(value))) e.extraImeis = 'Each additional IMEI must contain 14 or 15 digits.';
    }
    if (step === 2) {
      if (!form.reason.trim()) e.reason = 'Application reason is required.';
      if (!form.arrival) e.arrival = 'Select arrival date.';
      if (form.verificationMethod === 'Passport' && !form.passport.trim()) e.passport = 'Passport number is required.';
      if (!form.purchase.trim()) e.purchase = 'Please specify how you purchased the device.';
    }
    if (step === 3) for (const field of requirements) if (field.required && !uploads[field.key]) e[field.key] = 'This attachment is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep(prev => Math.min(4, prev + 1) as WizardStep);
  };
  const fileChange = (key: UploadKey, file?: File) => {
    if (!file) { setUploads(prev => ({ ...prev, [key]: undefined })); return; }
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (file.size > 1024 * 1024 || !allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, [key]: 'Max 1MB. Allowed formats: PNG, JPG, PDF.' }));
      return;
    }
    setUploads(prev => ({ ...prev, [key]: file }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };
  const submit = () => {
    const e: Record<string, string> = {};
    for (const field of requirements) if (field.required && !uploads[field.key]) e[field.key] = 'This attachment is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setWizard(false);
    const message = 'Demo complete: Special Registration form validated locally. No documents were uploaded and no registration was submitted to BTRC.';
    setResult(message);
    onRegistrationComplete?.(message);
  };
  useEffect(() => {
    if (!wizard && !detail && !stolenTarget && !profileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setWizard(false); setDetail(null); setStolenTarget(null); setProfileOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wizard, detail, stolenTarget, profileOpen]);
  const modal = 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-3 sm:p-6';
  const fieldClass = 'neir-special-reg-field';
  const inputField = (label: string, name: keyof FormState, placeholder = '', numeric = false) => (
    <label className="text-sm font-medium text-slate-800 block" key={name}>
      {label}
      <input className={fieldClass} value={form[name]} placeholder={placeholder}
        onChange={e => update(name, numeric ? e.target.value.replace(/\D/g, '').slice(0, 15) : e.target.value)} />
      {errors[name] && <span role="alert" className="block text-xs text-red-700 mt-1">{errors[name]}</span>}
    </label>
  );
  return (
    <>
    {!registrationOnly && <section className="w-full space-y-5" aria-label="Citizen IMEI list">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold" aria-hidden="true">N</div>
          <div><h1 className="text-lg font-semibold text-slate-900">{profileName}</h1><p className="text-xs text-slate-500">Citizen profile · Demonstration data</p></div>
        </div>
        <button className="border border-cyan-600 rounded-lg px-4 py-2 text-sm text-cyan-800 hover:bg-cyan-50" onClick={() => setProfileOpen(true)}>Edit Profile Informations</button>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        <button className={tab === 'registered' ? 'border-b-2 border-cyan-700 px-4 py-3 text-cyan-800 font-semibold' : 'px-4 py-3 text-slate-600'} onClick={() => {setTab('registered');setPage(1);}}>Registered IMEIs</button>
        <button className={tab === 'restricted' ? 'border-b-2 border-cyan-700 px-4 py-3 text-cyan-800 font-semibold' : 'px-4 py-3 text-slate-600'} onClick={() => {setTab('restricted');setPage(1);}}>Restricted IMEIs</button>
      </div>
      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm space-y-5">
        <p className="bg-sky-50 border-l-4 border-cyan-600 text-slate-800 rounded px-4 py-3 text-sm leading-6">
          <strong>Notice:</strong> This list shows all mobile phones registered with your NID or Smart NID. It may also include phones used by your family or friends registered under the same NID or Smart NID.
          <span className="block mt-1">Please note that each phone has two IMEI numbers, so multiple IMEIs may appear against your NID or Smart NID.</span>
        </p>
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div><h2 className="text-xl font-semibold text-slate-900">{tab === 'registered' ? 'Registered IMEIs (' + devices.filter(d => d.status !== 'Restricted (demo)').length + ')' : 'Restricted IMEIs (' + devices.filter(d => d.status === 'Restricted (demo)').length + ')'}</h2><p className="text-xs text-slate-500">First 14 digits of your IMEI number</p></div>
          <label className="relative block"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" /><span className="sr-only">Search IMEI</span><input className="rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm" placeholder="Search IMEI" inputMode="numeric" value={search} onChange={e => { setSearch(e.target.value.replace(/\D/g, '')); setPage(1); }} /></label>
        </div>
        <p className="text-xs text-amber-800">Prototype: the IMEI numbers on this screen are synthetic demonstration data, not actual NEIR registration records.</p>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-sm min-w-[570px]">
          <thead className="bg-slate-50 text-slate-700"><tr><th scope="col" className="text-left px-3 py-3">Sl No.</th><th scope="col" className="text-left px-3 py-3">IMEI Number</th><th scope="col" className="text-left px-3 py-3">Device Status</th><th scope="col" className="text-left px-3 py-3">Actions</th></tr></thead>
          <tbody>{visible.map((d, idx) => <tr key={d.imei} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-3 py-3">{(page - 1) * pageSize + idx + 1}</td><td className="px-3 py-3 font-medium tabular-nums">{d.imei}</td>
            <td className="px-3 py-3"><span className={'rounded px-2 py-1 text-xs font-medium ' + statusStyle[d.status]}>{d.status}</span></td>
            <td className="px-3 py-3"><div className="flex items-center gap-3 relative">
              <button className="text-cyan-700 hover:underline" onClick={() => setDetail(d)}>Details</button>
              <button aria-label={'Actions for IMEI ' + d.imei} aria-expanded={actionRow === d.imei} onClick={() => setActionRow(actionRow === d.imei ? null : d.imei)} className="flex items-center gap-1 border rounded px-2 py-1">Actions <ChevronDown size={14} /></button>
              {actionRow === d.imei && <div className="absolute right-0 top-full z-10 bg-white border rounded-lg shadow-lg p-1 min-w-[170px]">
                <button className="block w-full text-left px-3 py-2 hover:bg-slate-100" onClick={() => startRegistration(d.imei)}>Special Registration</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-slate-100" onClick={() => { setStolenTarget(d);setActionRow(null); }}>Mark as Stolen</button>
              </div>}
            </div></td>
          </tr>)}</tbody>
        </table></div>
        {visible.length === 0 && <p className="text-center text-slate-500 py-8">{tab === 'restricted' ? 'No restricted IMEIs in the synthetic demonstration data; the original restricted-list content was not provided.' : 'No matching IMEI found.'}</p>}
        <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-slate-600">
          <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-2"><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border rounded px-2 py-1 disabled:opacity-40"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'rounded bg-cyan-700 text-white px-3 py-1.5' : 'rounded border px-3 py-1.5'}>{i + 1}</button>)}<button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)} className="border rounded px-2 py-1 disabled:opacity-40"><ChevronRight size={17} /></button></div>
        </div>
        {result && <div role="status" className="text-sm bg-sky-50 text-sky-950 p-3 rounded-lg">{result}</div>}
      </div>
    </section>}

      {detail && <div className={modal} onMouseDown={e => {if (e.target === e.currentTarget) setDetail(null);}}><div role="dialog" aria-modal="true" aria-label="IMEI details" className="bg-white max-w-lg w-full rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between"><h2 className="text-lg font-semibold">IMEI Details</h2><button aria-label="Close details" onClick={() => setDetail(null)}><X /></button></div>
        <p className="text-sm"><strong>IMEI Number:</strong> {detail.imei}</p><p className="text-sm"><strong>Device Status:</strong> {detail.status}</p>
        <p className="text-xs text-slate-500">Sample data only. No government record has been retrieved.</p>
        <button className="bg-cyan-700 rounded-lg text-white px-4 py-2" onClick={() => { setDetail(null); startRegistration(detail.imei); }}>Special Registration</button>
      </div></div>}
      {stolenTarget && <div className={modal}><div role="alertdialog" aria-modal="true" aria-label="Mark IMEI as stolen" className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="font-semibold text-lg">Mark as Stolen</h2><p className="text-sm">This demonstration changes only the local sample status for IMEI {stolenTarget.imei}. It does not report a device to BTRC.</p>
        <div className="flex justify-end gap-2"><button className="border rounded px-4 py-2" onClick={() => setStolenTarget(null)}>Cancel</button><button className="bg-red-700 text-white rounded px-4 py-2" onClick={() => { setDevices(prev => prev.map(d => d.imei === stolenTarget.imei ? { ...d, status: 'Restricted (demo)' } : d)); setStolenTarget(null); }}>Confirm demo action</button></div>
      </div></div>}
      {profileOpen && <div className={modal}><div role="dialog" aria-modal="true" aria-label="Edit profile information" className="bg-white max-w-md w-full rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between"><h2 className="font-semibold text-lg">Edit Profile Informations</h2><button aria-label="Close profile" onClick={() => setProfileOpen(false)}><X /></button></div>
        <label className="block text-sm">Full Name<input className={fieldClass} value={profileName} onChange={e => setProfileName(e.target.value)} /></label>
        <p className="text-xs text-slate-500">Demo-only profile label. No identity data is updated on a server.</p>
        <button className="bg-cyan-700 text-white rounded px-4 py-2" onClick={() => setProfileOpen(false)}>Save demo changes</button>
      </div></div>}

      {wizard && <div className={modal} onMouseDown={e => { if(e.target === e.currentTarget) setWizard(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="special-registration-title" className="neir-special-reg-dialog">
          <header className="neir-special-reg-header">
            <h2 id="special-registration-title">Special Registration</h2>
            <button type="button" className="neir-special-reg-close" aria-label="Close special registration" onClick={() => setWizard(false)}><X size={24} aria-hidden="true" /></button>
          </header>
          {!registrationIntro && <div className="neir-special-reg-steps" aria-label="Registration progress">
            {(['Device information','Verifications','Attachments & Finalize'] as const).map((label,i) =>
              <div key={label} className={`neir-special-reg-step ${step === i+1 ? 'is-active' : ''} ${step > i+1 ? 'is-complete' : ''}`} aria-current={step === i+1 ? 'step' : undefined}>
                <div className="neir-special-reg-step-copy"><p>Step {i+1}</p><h3>{label}</h3></div>
                <ChevronRight size={20} aria-hidden="true" />
              </div>)}
          </div>}
          <div className="neir-special-reg-body" key={registrationIntro ? 'eligibility' : step}>
            {registrationIntro && <div className="neir-special-reg-intro">
              <div className="neir-special-reg-grid">
                {inputField('IMEI Number','imei','Enter IMEI number',true)}
                <label>Select Device
                  <select className={fieldClass} value={form.device} onChange={e=>update('device',e.target.value)}>
                    <option value="Handset">Mobile Device</option>
                  </select>
                </label>
              </div>
              <div className="neir-special-reg-choice-block">
                <p>Select eligibility</p>
                <div className="neir-special-reg-options" role="group" aria-label="Select eligibility">
                  {([{key:'local',label:'Local SIM Holder'},{key:'foreign',label:'Foreigner SIM holder'}] as const).map(option=>
                    <button type="button" key={option.key} className={`neir-special-reg-option ${form.eligibility===option.key?'selected':''}`}
                      aria-pressed={form.eligibility===option.key} onClick={()=>update('eligibility',option.key)}>
                      <span>{option.label}</span><span aria-hidden="true" className="neir-special-reg-option-circle">{form.eligibility===option.key?'✓':''}</span>
                    </button>)}
                </div>
                {errors.eligibility && <p className="neir-special-reg-error" role="alert">{errors.eligibility}</p>}
              </div>
            </div>}
            {!registrationIntro && step===1 && <div className="neir-special-reg-device">
              <label>IMEI Number<input className={fieldClass+' neir-special-reg-readonly'} value={form.imei} readOnly aria-readonly="true" /></label>
              <div className="neir-special-reg-span">
                {extraImeis.map((value,index)=><label className="block text-sm" key={index}>IMEI Number {index+2}
                  <div className="flex gap-2 items-center"><input className={fieldClass} inputMode="numeric" value={value} placeholder="Enter IMEI number"
                    onChange={e=>setExtraImeis(prev=>prev.map((v,i)=>i===index?e.target.value.replace(/\D/g,'').slice(0,15):v))}/>
                    <button type="button" aria-label={`Remove IMEI ${index+2}`} onClick={()=>setExtraImeis(prev=>prev.filter((_,i)=>i!==index))}><X size={18}/></button></div>
                </label>)}
                {errors.extraImeis&&<p className="neir-special-reg-error" role="alert">{errors.extraImeis}</p>}
                <button type="button" className="neir-special-reg-text-action" onClick={()=>setExtraImeis(prev=>[...prev,''])}>+ Add another IMEI number</button>
              </div>
              <div className="neir-special-reg-grid">
                {inputField('Device model number','model','Input model Number')}
                <label>Select Device<select className={fieldClass} value={form.device} onChange={e=>update('device',e.target.value)}><option value="Handset">Mobile Device</option></select></label>
              </div>
            </div>}
            {!registrationIntro && step===2 && <div className="neir-special-reg-grid">
              <label className="neir-special-reg-span">Application Reason
                <select className={fieldClass} value={form.reason} onChange={e=>update('reason',e.target.value)}>
                  <option value="">Select Application Reason</option>
                  <option value="Purchased device during his foreign tour">Purchased handset during his foreign tour</option>
                  <option value="Gift Deed from his relative/ Friends">Gift Deed from his relative/ Friends</option>
                  <option value="Bought/Brought from Air Mail">Bought/Brought from Air Mail</option>
                </select>{errors.reason&&<p className="neir-special-reg-error" role="alert">{errors.reason}</p>}
              </label>
              <label className="neir-special-reg-span neir-special-reg-date">Select Arrival Date<input type="date" className={fieldClass} value={form.arrival} onChange={e=>update('arrival',e.target.value)} />{errors.arrival&&<p className="neir-special-reg-error" role="alert">{errors.arrival}</p>}</label>
              <label>Select Verification’s method
                <select className={fieldClass} value={form.verificationMethod} onChange={e=>update('verificationMethod',e.target.value)}><option value="Passport">Passport</option></select>
              </label>
              {form.verificationMethod==='Passport'&&inputField('Passport Number','passport','Type Passport number')}
              <label>How you purchased the device?
                <select className={fieldClass} value={form.purchase} onChange={e=>update('purchase',e.target.value)}>
                  <option value="">Select purchase method</option><option value="With tax">With tax</option><option value="Without tax">Without tax</option>
                </select>{errors.purchase&&<p className="neir-special-reg-error" role="alert">{errors.purchase}</p>}
              </label>
              {form.purchase==='With tax'&&inputField('Tax Amount','tax','With tax Amount')}
            </div>}
            {!registrationIntro && step===3 && <div className="neir-special-reg-attachments">
              <h3>Add Required Documents</h3>
              {requirements.map(r=><label key={r.key} className="neir-special-reg-upload">
                <span>+ {r.key==='passportInfo'?'Passport Info Page':r.key==='arrivalSeal'?'Passport Arrival date seal page':r.key==='deviceBox'?'Handset Box exposing the IMEI number part':'Ticket / Boarding pass / any relevant document (optional)'} {r.required?'*':''}</span>
                <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>fileChange(r.key,e.target.files?.[0])} />
                {uploads[r.key]&&<small>{uploads[r.key]?.name}</small>}
                {errors[r.key]&&<small className="neir-special-reg-error" role="alert">{errors[r.key]}</small>}
              </label>)}
              <p className="neir-special-reg-hint">Any file should not exceed 1MB. Allowed formats: PNG, JPG, PDF.</p>
              <label>Remarks<textarea className={fieldClass} value={form.remarks} placeholder="Type your Remarks" onChange={e=>update('remarks',e.target.value)} rows={3}/></label>
            </div>}
            {!registrationIntro && step===4 && <div className="neir-special-reg-review">
              <h3>Review Special Registration</h3>
              <div><h4>Device Information</h4><p>IMEI Number 1: {form.imei}</p>{extraImeis.map((imei,i)=><p key={i}>IMEI Number {i+2}: {imei}</p>) }<p>Device model number: {form.model}</p><p>Device Type: Mobile Device</p><p>Eligibility: {form.eligibility==='local'?'Local SIM Holder':'Foreigner SIM holder'}</p></div>
              <div><h4>Verification Information</h4><p>Application Reason: {form.reason}</p><p>Arrival Date: {form.arrival}</p><p>Verification method: {form.verificationMethod}</p><p>Passport Number: {form.passport}</p><p>Purchased Method: {form.purchase}</p>{form.tax&&<p>Tax Amount: {form.tax}</p>}</div>
              <div><h4>Attached documents</h4>{requirements.filter(r=>uploads[r.key]).map(r=><p key={r.key}>{r.label}: {uploads[r.key]?.name}</p>)}</div>
              {form.remarks&&<div><h4>Remarks</h4><p>{form.remarks}</p></div>}
            </div>}
          </div>
          <footer className={`neir-special-reg-footer ${registrationIntro?'is-intro':''}`}>
            {!registrationIntro && step>1 && <button type="button" className="neir-special-reg-previous" onClick={()=>{setStep((step-1) as WizardStep);setErrors({});}}>Previous</button>}
            <button type="button" className="neir-special-reg-cancel" onClick={()=>setWizard(false)}>Cancel</button>
            {registrationIntro
              ? <button type="button" className="neir-special-reg-next" onClick={()=>{
                  const e:Record<string,string>={};
                  if(!/^\d{14,15}$/.test(form.imei))e.imei='Enter a valid 14 or 15 digit IMEI.';
                  if(!form.eligibility)e.eligibility='Select eligibility.';
                  setErrors(e);if(!Object.keys(e).length){setRegistrationIntro(false);setStep(1);}
                }}>Add New Device by Special Registration</button>
              : step<4
                ? <button type="button" className="neir-special-reg-next" onClick={next}>Next Step</button>
                : <button type="button" className="neir-special-reg-next" onClick={submit}>Submit</button>}
          </footer>
        </div>
      </div>}
    </>
  );
};
