import React, { useEffect, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import './ProfileSpecialRegistrationModal.css';

type Reason = '' | 'foreign-tour' | 'gift' | 'airmail';
type Stage = 1 | 2 | 3;
type DocumentDefinition = { id: string; label: string; required: boolean };

const documentSets: Record<Exclude<Reason, ''>, DocumentDefinition[]> = {
  'foreign-tour': [
    { id: 'passportInfo', label: 'Passport info page', required: true },
    { id: 'arrivalSeal', label: 'Passport arrival date seal', required: true },
    { id: 'imeiBox', label: 'Device box IMEI no', required: true },
  ],
  gift: [
    { id: 'donorPassport', label: 'Passport info page donor', required: true },
    { id: 'donorArrivalSeal', label: 'Passport arrival date seal donor', required: true },
    { id: 'imeiBox', label: 'Device box IMEI no', required: true },
    { id: 'giftDeed', label: 'Gift deed donor', required: true },
  ],
  airmail: [
    { id: 'commercialInvoice', label: 'Commercial invoice', required: true },
    { id: 'applicantTax', label: 'Applicant tax document', required: true },
  ],
};
const maxFileSize = 1024 * 1024;
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const localDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type Props = { initialImei?: string; onClose: () => void; onComplete?: (message: string) => void };
export const ProfileSpecialRegistrationModal: React.FC<Props> = ({ initialImei = '', onClose, onComplete }) => {
  const [stage, setStage] = useState<Stage>(1);
  const [imei, setImei] = useState(initialImei);
  const [bmet, setBmet] = useState<'' | 'yes' | 'no'>('');
  const [bmetNumber, setBmetNumber] = useState('');
  const [reason, setReason] = useState<Reason>('');
  const [arrival, setArrival] = useState('');
  const [passport, setPassport] = useState('');
  const [purchase, setPurchase] = useState<'' | 'with-tax' | 'without-tax'>('');
  const [tax, setTax] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== 'Tab') return;
      const tabbable = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]'
      ) || []).filter(node => node.getClientRects().length > 0 && !node.closest('[hidden]'));
      if (!tabbable.length) return;
      if (event.shiftKey && document.activeElement === tabbable[0]) { event.preventDefault(); tabbable[tabbable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === tabbable[tabbable.length - 1]) { event.preventDefault(); tabbable[0].focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handleKey); returnFocus?.focus(); };
  }, []);

  const docs: DocumentDefinition[] = [
    ...(reason ? documentSets[reason] : []),
    ...(bmet === 'yes' ? [{ id: 'bmetCard', label: 'BMET card document', required: true }] : []),
  ];
  const validStep1 = /^\d+$/.test(imei.trim()) && !!bmet && (bmet !== 'yes' || !!bmetNumber.trim());
  const validTax = purchase === 'without-tax' || (purchase === 'with-tax' && tax.trim() !== '' && Number.isFinite(Number(tax)) && Number(tax) >= 0);
  const validStep2 = validStep1 && !!reason && !!arrival && arrival <= localDate() &&
    (reason !== 'foreign-tour' || !!passport.trim()) && !!purchase && validTax;
  const validStep3 = validStep2 && docs.every(doc => !doc.required || !!files[doc.id]) &&
    !docs.some(doc => fileErrors[doc.id]);
  const enabled = stage === 1 ? validStep1 : stage === 2 ? validStep2 : validStep3;
  const setFile = (id: string, file?: File) => {
    setFeedback(''); setSubmitted(false);
    if (!file) {
      setFiles(previous => { const copy = { ...previous }; delete copy[id]; return copy; });
      setFileErrors(previous => { const copy = { ...previous }; delete copy[id]; return copy; });
      return;
    }
    if (file.size > maxFileSize || !allowedTypes.includes(file.type)) {
      setFiles(previous => { const copy = { ...previous }; delete copy[id]; return copy; });
      setFileErrors(previous => ({ ...previous, [id]: 'File must be PNG, JPG, or PDF and at most 1 MB.' }));
      return;
    }
    setFiles(previous => ({ ...previous, [id]: file }));
    setFileErrors(previous => { const copy = { ...previous }; delete copy[id]; return copy; });
  };
  const next = (event: React.FormEvent) => {
    event.preventDefault();
    if (!enabled) return;
    setFeedback('');
    if (stage < 3) {
      setStage((stage + 1) as Stage);
      // Only modal content scrolls; header and actions remain fixed.
      requestAnimationFrame(() => rootRef.current?.querySelector('.neir-v7-body')?.scrollTo({ top: 0 }));
    } else {
      const message = 'Prototype only — registration has not been submitted to NEIR.';
      setFeedback(message); setSubmitted(true); onComplete?.(message);
    }
  };
  const radio = (name: string, value: string, selected: boolean, onSelect: () => void, label: string) => (
    <label className={'neir-v7-radio-option' + (selected ? ' is-selected' : '')}>
      <input type="radio" name={name} value={value} checked={selected} onChange={onSelect} />
      <span>{label}</span>
    </label>
  );
  return <div className="neir-v7-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) closeRef.current(); }}>
    <section className="neir-v7-dialog" role="dialog" aria-modal="true" aria-labelledby="neir-v7-title" ref={rootRef}>
      <header className="neir-v7-header">
        <h2 id="neir-v7-title">Special Registration</h2>
        <button type="button" className="neir-v7-close" aria-label="Close special registration" onClick={onClose}><X size={23} /></button>
      </header>
      <div className="neir-v7-progress" role="progressbar" aria-label="Registration progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={stage}>
        {[1, 2, 3].map(n => <span key={n} className={n <= stage ? 'is-active' : ''}/>) }
      </div>
      <form noValidate className="neir-v7-form" onSubmit={next}>
        <div className="neir-v7-body">
          <section className="neir-v7-section" aria-labelledby="neir-v7-device-heading">
            <div className="neir-v7-section-header"><span>01</span><h3 id="neir-v7-device-heading">Device Information</h3></div>
            <div className="neir-v7-grid">
              <label className="neir-v7-field neir-v7-span" htmlFor="neir-v7-imei">
                <span>IMEI Number <b aria-hidden="true">*</b></span>
                <input id="neir-v7-imei" ref={firstInputRef} value={imei} onChange={event => { setImei(event.target.value.replace(/\D/g, '')); setSubmitted(false); }}
                  inputMode="numeric" autoComplete="off" placeholder="Enter IMEI number" required aria-invalid={!!imei && !/^\d+$/.test(imei)} />
              </label>
              <fieldset className="neir-v7-field neir-v7-span">
                <legend>Do you have a BMET card? <b aria-hidden="true">*</b></legend>
                <div className="neir-v7-radio-group" aria-label="BMET card availability">
                  {radio('bmet','yes',bmet === 'yes',() => { setBmet('yes'); setSubmitted(false); },'Yes')}
                  {radio('bmet','no',bmet === 'no',() => { setBmet('no'); setBmetNumber(''); setSubmitted(false); },'No')}
                </div>
              </fieldset>
              {bmet === 'yes' && <label className="neir-v7-field neir-v7-span" htmlFor="neir-v7-bmet">
                <span>BMET Card Number <b aria-hidden="true">*</b></span>
                <input id="neir-v7-bmet" value={bmetNumber} onChange={event => { setBmetNumber(event.target.value); setSubmitted(false); }} placeholder="Enter BMET card number" required />
              </label>}
            </div>
          </section>
          {stage >= 2 && <>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section" aria-labelledby="neir-v7-verification-heading">
              <div className="neir-v7-section-header"><span>02</span><h3 id="neir-v7-verification-heading">Verifications</h3></div>
              <label className="neir-v7-field" htmlFor="neir-v7-reason">
                <span>Application Reason <b aria-hidden="true">*</b></span>
                <select id="neir-v7-reason" value={reason} onChange={event => { setReason(event.target.value as Reason); setSubmitted(false); }} required>
                  <option value="">Select application reason</option>
                  <option value="airmail">Bought/Brought from Air Mail</option>
                  <option value="gift">Gift Deed from his relative/ Friends</option>
                  <option value="foreign-tour">Purchased handset during his foreign tour</option>
                </select>
              </label>
              <div className="neir-v7-grid neir-v7-verify-grid">
                <label className={'neir-v7-field' + (reason !== 'foreign-tour' ? ' neir-v7-span' : '')} htmlFor="neir-v7-arrival">
                  <span>Select arrival date <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-arrival" type="date" max={localDate()} value={arrival} onChange={event => { setArrival(event.target.value); setSubmitted(false); }} required aria-invalid={!!arrival && arrival > localDate()} />
                  {arrival && arrival > localDate() && <small className="neir-v7-error" role="alert">Future dates are not allowed.</small>}
                </label>
                {reason === 'foreign-tour' && <label className="neir-v7-field" htmlFor="neir-v7-passport">
                  <span>Passport number <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-passport" value={passport} onChange={event => { setPassport(event.target.value); setSubmitted(false); }} placeholder="Enter passport number" required />
                </label>}
                <fieldset className="neir-v7-field neir-v7-span">
                  <legend>How you purchased the device? <b aria-hidden="true">*</b></legend>
                  <div className="neir-v7-radio-group" aria-label="Purchase tax status">
                    {radio('purchase','with-tax',purchase === 'with-tax',() => { setPurchase('with-tax'); setTax(''); setSubmitted(false); },'With Tax')}
                    {radio('purchase','without-tax',purchase === 'without-tax',() => { setPurchase('without-tax'); setTax(''); setSubmitted(false); },'Without Tax')}
                  </div>
                </fieldset>
                {purchase === 'with-tax' && <label className="neir-v7-field neir-v7-span" htmlFor="neir-v7-tax">
                  <span>Tax amount <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-tax" type="number" min="0" step="any" inputMode="decimal" value={tax} onChange={event => { setTax(event.target.value); setSubmitted(false); }} placeholder="Enter tax amount" required />
                  {tax !== '' && !validTax && <small className="neir-v7-error" role="alert">Enter a valid tax amount.</small>}
                </label>}
              </div>
            </section>
          </>}
          {stage >= 3 && <>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section" aria-labelledby="neir-v7-docs-heading">
              <div className="neir-v7-section-header"><span>03</span><h3 id="neir-v7-docs-heading">Attachments &amp; Finalize</h3></div>
              <p className="neir-v7-doc-intro">Upload the documents required for your application reason.</p>
              <p className="neir-v7-doc-limits">Each file must be 1 MB or smaller. Supported formats: PNG, JPG, PDF.</p>
              <div className="neir-v7-document-grid">
                {docs.map((doc, index) => <div key={doc.id} className={'neir-v7-upload-group' + (docs.length % 2 === 1 && index === docs.length - 1 ? ' neir-v7-span' : '')}>
                  <label className="neir-v7-upload-title" htmlFor={'neir-v7-file-' + doc.id}>{doc.label} {doc.required && <b aria-hidden="true">*</b>}</label>
                  <input type="file" className="neir-v7-file-input" id={'neir-v7-file-' + doc.id} accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    onChange={event => { const selected = event.target.files?.[0]; setFile(doc.id, selected); if(selected && (selected.size > maxFileSize || !allowedTypes.includes(selected.type))) event.target.value=''; }} />
                  {files[doc.id] ? <div className="neir-v7-uploaded"><FileText size={17} aria-hidden="true"/><span>{files[doc.id].name}</span><small>{Math.round(files[doc.id].size / 1024)} KB</small>
                    <button type="button" aria-label={'Remove ' + doc.label} onClick={() => setFile(doc.id)}>×</button></div> :
                    <label className="neir-v7-upload-pick" htmlFor={'neir-v7-file-' + doc.id}><span aria-hidden="true">+</span>{doc.label}</label>}
                  {fileErrors[doc.id] && <p className="neir-v7-error" role="alert">{fileErrors[doc.id]}</p>}
                </div>)}
              </div>
              {submitted && <p className="neir-v7-doc-notice">All required documents are attached. This prototype does not submit information to a server.</p>}
            </section>
          </>}
        </div>
        <footer className="neir-v7-footer">
          <p role="status" aria-live="polite">{feedback}</p>
          <button className="neir-v7-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="neir-v7-next" disabled={!enabled || submitted} type="submit">{stage === 3 ? 'Submit' : 'Next →'}</button>
        </footer>
      </form>
    </section>
  </div>;
};
