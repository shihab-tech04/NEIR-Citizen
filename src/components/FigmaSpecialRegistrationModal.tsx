import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, ChevronsRight,
  CircleHelp, FileText, Info, Plus, Smartphone, Upload, X,
} from 'lucide-react';
import './FigmaSpecialRegistrationModal.css';

type Stage = 0 | 1 | 2 | 3 | 4;
type Eligibility = 'local' | 'foreigner' | '';
type Reason = 'tour' | 'gift' | 'airmail' | '';
type DocumentRequirement = { key: string; label: string; required: boolean };

const reasonNames: Record<Exclude<Reason, ''>, string> = {
  tour: 'Purchased handset during his foreign tour',
  gift: 'Gift Deed from his relative/ Friends',
  airmail: 'Bought/Brought from Air Mail',
};
const documentsFor = (reason: Reason): DocumentRequirement[] => {
  if (reason === 'airmail') return [
    { key: 'airway', label: 'Airway bill / courier bill', required: true },
    { key: 'packing', label: 'Packing List', required: true },
    { key: 'invoice', label: 'Commercial Invoice', required: true },
    { key: 'taxdoc', label: 'Tax document of the applicant / receiver', required: false },
  ];
  if (reason === 'gift') return [
    { key: 'passportInfo', label: 'Passport Info Page of the donor', required: true },
    { key: 'arrivalSeal', label: 'Passport Arrival date seal page of the donor', required: true },
    { key: 'deviceBox', label: 'Handset Box exposing the IMEI number part', required: true },
    { key: 'giftDeed', label: 'Gift Deed from donor', required: false },
  ];
  return [
    { key: 'passportInfo', label: 'Passport info page', required: true },
    { key: 'arrivalSeal', label: 'Passport arrival date seal', required: true },
    { key: 'deviceBox', label: 'Device box showing IMEI number', required: true },
    { key: 'travelDoc', label: 'Travel document', required: false },
  ];
};
const numberValid = (value: string) => /^\d{14,15}$/.test(value);
const modalMessage = 'Special Registration form validated locally. No documents were uploaded and no application was submitted to BTRC.';

type Props = {
  initialImei?: string;
  onClose: () => void;
  onComplete: (message: string) => void;
};

export const FigmaSpecialRegistrationModal: React.FC<Props> = ({
  initialImei = '', onClose, onComplete,
}) => {
  const [stage, setStage] = useState<Stage>(0);
  const [imei, setImei] = useState(initialImei);
  const [extraImei, setExtraImei] = useState('');
  const [extraImeiOpen, setExtraImeiOpen] = useState(false);
  const [device, setDevice] = useState('Mobile Device');
  const [model, setModel] = useState('');
  const [eligibility, setEligibility] = useState<Eligibility>('');
  const [reason, setReason] = useState<Reason>('');
  const [receivedDate, setReceivedDate] = useState('');
  const [verification, setVerification] = useState('Passport');
  const [verificationNumber, setVerificationNumber] = useState('');
  const [uploads, setUploads] = useState<Record<string, File>>({});
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const docs = documentsFor(reason);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, []);

  const change = (name: string, setter: (value: string) => void, value: string) => {
    setter(value);
    if (errors[name]) setErrors(previous => ({ ...previous, [name]: '' }));
  };
  const fileChange = (name: string, file?: File) => {
    if (!file) {
      setUploads(previous => { const copy = { ...previous }; delete copy[name]; return copy; });
      return;
    }
    if (file.size > 1024 * 1024 || !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      setErrors(previous => ({ ...previous, [name]: 'Use a PNG, JPG or PDF file, no larger than 1 MB.' }));
      return;
    }
    setUploads(previous => ({ ...previous, [name]: file }));
    setErrors(previous => ({ ...previous, [name]: '' }));
  };
  const next = () => {
    const issues: Record<string, string> = {};
    if (stage === 0) {
      if (!numberValid(imei)) issues.imei = 'Enter a 14- or 15-digit IMEI number.';
      if (!device) issues.device = 'Select a device.';
      if (!eligibility) issues.eligibility = 'Select your SIM-holder eligibility.';
    }
    if (stage === 1) {
      if (!model.trim()) issues.model = 'Enter the device model number.';
      if (extraImeiOpen && extraImei && !numberValid(extraImei)) issues.extraImei = 'Enter a 14- or 15-digit second IMEI.';
      if (extraImei && extraImei === imei) issues.extraImei = 'The second IMEI must be different.';
    }
    if (stage === 2) {
      if (!reason) issues.reason = 'Choose an application reason.';
      if (!receivedDate) issues.receivedDate = 'Select the relevant date.';
      if (!verification) issues.verification = 'Choose a verification method.';
      if (!verificationNumber.trim()) issues.verificationNumber = 'Enter your verification document number.';
    }
    if (stage === 3) {
      for (const item of docs) if (item.required && !uploads[item.key]) issues[item.key] = 'This document is required.';
    }
    setErrors(issues);
    if (Object.keys(issues).length) return;
    if (stage === 4) onComplete(modalMessage);
    else setStage((stage + 1) as Stage);
  };
  const back = () => { setErrors({}); setStage(previous => Math.max(0, previous - 1) as Stage); };

  const field = (label: string, id: string, value: string, setter: (value: string) => void, placeholder: string, options?: { inputMode?: 'numeric'; type?: string; readOnly?: boolean }) => (
    <label className="neir-sr-field" htmlFor={'neir-sr-' + id}>
      <span className="neir-sr-label">{label}</span>
      <span className={'neir-sr-control' + (options?.readOnly ? ' neir-sr-control-readonly' : '')}>
        <input id={'neir-sr-' + id} value={value} placeholder={placeholder}
          type={options?.type || 'text'} readOnly={options?.readOnly} inputMode={options?.inputMode}
          onChange={event => change(id, setter, options?.inputMode === 'numeric' ? event.target.value.replace(/\D/g, '').slice(0, 15) : event.target.value)}
          aria-invalid={!!errors[id]} aria-describedby={errors[id] ? 'neir-sr-error-' + id : undefined} />
        {options?.type === 'date' && <CalendarDays size={18} aria-hidden="true" />}
      </span>
      {errors[id] && <span id={'neir-sr-error-' + id} className="neir-sr-error" role="alert">{errors[id]}</span>}
    </label>
  );

  const selectField = (label: string, id: string, value: string, onChange: (value: string) => void, choices: { value: string; label: string }[]) => (
    <label className="neir-sr-field" htmlFor={'neir-sr-' + id}>
      <span className="neir-sr-label">{label}</span>
      <span className="neir-sr-control neir-sr-select">
        <select id={'neir-sr-' + id} value={value} onChange={event => change(id, onChange, event.target.value)}
          aria-invalid={!!errors[id]} aria-describedby={errors[id] ? 'neir-sr-error-' + id : undefined}>
          {choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
        <ChevronDown size={18} aria-hidden="true" />
      </span>
      {errors[id] && <span className="neir-sr-error" id={'neir-sr-error-' + id} role="alert">{errors[id]}</span>}
    </label>
  );

  return (
    <div className="neir-sr-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="neir-sr-dialog" role="dialog" aria-modal="true" aria-labelledby="neir-sr-title" ref={dialogRef}>
        <header className="neir-sr-header">
          <h2 id="neir-sr-title">Special Registration</h2>
          <button type="button" className="neir-sr-close" onClick={onClose} ref={closeButtonRef} aria-label="Close special registration"><X size={29} strokeWidth={1.7} /></button>
        </header>

        {stage > 0 && <nav className="neir-sr-stepper" aria-label="Registration progress">
          {(['Device information', 'Verifications', 'Attachments & Finalize'] as const).map((title, index) => {
            const indexStage = index + 1;
            const current = Math.min(stage, 3) === indexStage;
            const completed = stage > indexStage;
            return <React.Fragment key={title}>
              {index > 0 && <ChevronsRight className={'neir-sr-chevron' + (stage >= index ? ' neir-sr-chevron-active' : '')} size={26} aria-hidden="true" />}
              <div className={'neir-sr-step' + (current ? ' neir-sr-step-active' : '')} aria-current={current ? 'step' : undefined}>
                <span className="neir-sr-step-meta">Step {indexStage}</span>
                <span className="neir-sr-step-title">{title}</span>
                {(current || completed) && <span className="neir-sr-step-check"><Check size={12} strokeWidth={3} /></span>}
              </div>
            </React.Fragment>;
          })}
        </nav>}

        <div className="neir-sr-content">
          {stage === 0 && <>
            <div className="neir-sr-grid">
              {field('IMEI Number', 'imei', imei, setImei, 'IMEI Number', { inputMode: 'numeric' })}
              {selectField('Select Device', 'device', device, setDevice, [
                { value: 'Mobile Device', label: 'Mobile Device' },
                { value: 'Smart Phone', label: 'Smart Phone' },
                { value: 'Feature Phone', label: 'Feature Phone' },
              ])}
            </div>
            <fieldset className="neir-sr-eligibility">
              <legend className="neir-sr-label">Select eligibility</legend>
              <div className="neir-sr-grid">
                {([['local', 'Local SIM Holder'], ['foreigner', 'Foreigner SIM holder']] as const).map(([value, label]) =>
                  <button key={value} className={'neir-sr-eligibility-card' + (eligibility === value ? ' neir-sr-eligibility-selected' : '')}
                    type="button" onClick={() => { setEligibility(value); setErrors(previous => ({ ...previous, eligibility: '' })); }} aria-pressed={eligibility === value}>
                    {label}
                    {eligibility === value && <span className="neir-sr-selected-check"><Check size={14} strokeWidth={3} /></span>}
                  </button>)}
              </div>
              {errors.eligibility && <span className="neir-sr-error" role="alert">{errors.eligibility}</span>}
            </fieldset>
          </>}

          {stage === 1 && <>
            {field('IMEI Number', 'readImei', imei, setImei, '', { readOnly: true })}
            {extraImeiOpen && <div className="neir-sr-extra-imei">
              {field('Additional IMEI number', 'extraImei', extraImei, setExtraImei, 'Enter second IMEI', { inputMode: 'numeric' })}
              <button type="button" onClick={() => { setExtraImeiOpen(false); setExtraImei(''); }} className="neir-sr-icon-btn" aria-label="Remove additional IMEI"><X size={19} /></button>
            </div>}
            {!extraImeiOpen && <button type="button" className="neir-sr-add-imei" onClick={() => setExtraImeiOpen(true)}>
              <span className="neir-sr-add-icon"><Plus size={15} strokeWidth={3} /></span>Add another IMEI number <CircleHelp size={16} color="#9ca3af" aria-label="Use this for a device with a second IMEI." />
            </button>}
            <div className="neir-sr-grid">
              {field('Device Model Number', 'model', model, setModel, 'Input model Number')}
              {selectField('Select Device', 'device', device, setDevice, [
                { value: 'Mobile Device', label: 'Mobile Device' },
                { value: 'Smart Phone', label: 'Smart Phone' },
                { value: 'Feature Phone', label: 'Feature Phone' },
              ])}
            </div>
          </>}

          {stage === 2 && <>
            {selectField('Application Reason', 'reason', reason, value => { setReason(value as Reason); setUploads({}); }, [
              { value: '', label: 'Select Application Reason' },
              ...Object.entries(reasonNames).map(([value, label]) => ({ value, label })),
            ])}
            {reason && <>
              <div className="neir-sr-section-separator" />
              {field(reason === 'gift' ? 'Select Device Received’s Date' : 'Select Arrival Date', 'receivedDate', receivedDate, setReceivedDate, '', { type: 'date' })}
              <div className="neir-sr-grid">
                {selectField('Select Verification’s Method', 'verification', verification, setVerification, [
                  { value: 'Passport', label: 'Passport' },
                  { value: 'Smart NID', label: 'Smart NID' },
                  { value: 'NID', label: 'NID' },
                ])}
                {field(verification + ' Number', 'verificationNumber', verificationNumber, setVerificationNumber, 'Type ' + verification + ' number')}
              </div>
            </>}
          </>}

          {stage === 3 && <>
            <div className="neir-sr-doc-heading">Add Required Documents</div>
            <div className="neir-sr-upload-list">
              {docs.map(doc => <div className="neir-sr-upload-row" key={doc.key}>
                <label className="neir-sr-upload-label">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="neir-sr-file-input" onChange={event => fileChange(doc.key, event.target.files?.[0])} />
                  {uploads[doc.key] ? <><FileText size={19} />{uploads[doc.key].name}</> : <><Plus size={17} />{doc.label} {doc.required && <strong>*</strong>}</>}
                </label>
                <span className="neir-sr-upload-hint" title="Accepted: JPG, PNG, PDF; maximum 1 MB"><Info size={18} /></span>
                {errors[doc.key] && <span className="neir-sr-error" role="alert">{errors[doc.key]}</span>}
              </div>)}
            </div>
            <label className="neir-sr-field neir-sr-remarks">
              <span className="neir-sr-label">Remarks</span>
              <textarea placeholder="Type your Remarks" value={remarks} onChange={event => setRemarks(event.target.value)} />
            </label>
          </>}

          {stage === 4 && <div className="neir-sr-review">
            <div className="neir-sr-review-panel">
              <div className="neir-sr-review-heading">Device Status <span>Not verified</span></div>
              <p className="neir-sr-review-note"><Info size={20} /> This prototype cannot retrieve BTRC status or tax-free registration eligibility.</p>
            </div>
            <div className="neir-sr-review-grid">
              <div className="neir-sr-review-panel">
                <h3>Device Information</h3>
                <dl><dt>IMEI Number 1</dt><dd>{imei}</dd>
                  {extraImei && <><dt>IMEI Number 2</dt><dd>{extraImei}</dd></>}
                  <dt>Device model number</dt><dd>{model}</dd>
                  <dt>Device Type</dt><dd>{device}</dd><dt>SIM holder</dt><dd>{eligibility === 'local' ? 'Local SIM Holder' : 'Foreigner SIM holder'}</dd></dl>
              </div>
              <div className="neir-sr-review-panel">
                <h3>Verification Information</h3>
                <dl><dt>Application Reason</dt><dd>{reason ? reasonNames[reason] : ''}</dd>
                  <dt>Date</dt><dd>{receivedDate}</dd><dt>Verification Method</dt><dd>{verification}</dd>
                  <dt>Document Number</dt><dd>{verificationNumber}</dd></dl>
              </div>
            </div>
            <div className="neir-sr-review-panel">
              <h3>Attached documents</h3>
              {docs.filter(doc => uploads[doc.key]).map(doc => <p className="neir-sr-attachment" key={doc.key}><FileText size={17} />{doc.label}: {uploads[doc.key].name}</p>)}
              {remarks && <p className="neir-sr-review-remarks"><strong>Remarks:</strong> {remarks}</p>}
            </div>
            <p className="neir-sr-submission-note">Submission is local validation only. No registration is submitted to BTRC.</p>
          </div>}
        </div>
        <footer className="neir-sr-footer">
          {stage === 0 ? <>
            <button type="button" className="neir-sr-text-action" onClick={onClose}>Cancel</button>
            <button type="button" className="neir-sr-outline neir-sr-wide" onClick={next}>Add New Device by Special Registration</button>
          </> : <>
            {stage > 1 ? <button type="button" className="neir-sr-outline neir-sr-previous" onClick={back}><ArrowLeft size={19} />Previous</button> : <span className="neir-sr-footer-spacer" />}
            <button type="button" className="neir-sr-text-action" onClick={onClose}>Cancel</button>
            <button type="button" className="neir-sr-outline neir-sr-next" onClick={next}>{stage === 4 ? 'Submit' : 'Next Step'}<ArrowRight size={19} /></button>
          </>}
        </footer>
      </div>
    </div>
  );
};
