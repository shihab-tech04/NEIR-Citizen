import React, { useEffect, useRef, useState } from 'react';
import { Check, Info, FileText, Gift, Package, Plane, X } from 'lucide-react';
import './ProfileSpecialRegistrationModal.css';

type Reason = '' | 'foreign-tour' | 'gift' | 'airmail';
type DocumentDefinition = { id: string; label: string; required: boolean; purpose: string };

// Keep the established reason-specific prototype document rules. Descriptions are UI
// explanations, not claims of an official BTRC document checklist.
// These are prototype upload prompts, not a legal declaration of BTRC requirements.
// Arrival-stamp uploads were removed at the user’s request.
const documentSets: Record<Exclude<Reason, ''>, DocumentDefinition[]> = {
  'foreign-tour': [
    { id: 'passportInfo', label: 'Passport Info Page', required: true, purpose: 'Upload the passport identity page showing the applicant’s name, photograph and passport number. An arrival-date stamp is not required.' },
    { id: 'imeiBox', label: 'Handset Box Showing IMEI', required: true, purpose: 'Upload a clear photo of the original handset packaging or label where the IMEI is visible and matches the IMEI entered in this form.' },
    { id: 'travelDocument', label: 'Ticket / Boarding Pass / Travel Document', required: false, purpose: 'Optional: an airline ticket, boarding pass or similar travel document associated with bringing the handset into the country.' },
  ],
  gift: [
    { id: 'donorPassport', label: 'Passport Info Page', required: true, purpose: 'Upload the identity page of the passport belonging to the person who gave you the handset. An arrival-date seal is not needed.' },
    { id: 'giftDeed', label: 'Gift Deed', required: true, purpose: 'Upload a written gift declaration or deed identifying the donor, recipient and transferred handset.' },
    { id: 'imeiBox', label: 'Handset Box Showing IMEI', required: true, purpose: 'Upload a clear photo of the handset box label displaying the IMEI that matches this device.' },
  ],
  airmail: [
    { id: 'commercialInvoice', label: 'Commercial Invoice', required: true, purpose: 'Upload the invoice or seller document showing the air-mailed handset, sender and item details. Packing lists and courier bills are not requested separately.' },
  ],
};
const airmailTaxDocument: DocumentDefinition = {
  id: 'applicantTax', label: 'Tax Payment Document', required: true,
  purpose: 'Upload a tax or customs payment receipt for the handset only when you select With Tax. No tax-payment document is requested for Without Tax.',
};
const bmetDocument: DocumentDefinition = {
  id: 'bmetCard', label: 'BMET Card', required: true,
  purpose: 'Upload a clear image of your BMET card showing the card number entered above. This is needed only when you select Yes for the BMET card question.',
};
const maxFileSize = 1024 * 1024;
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

type Props = { initialImei?: string; onClose: () => void; onComplete?: (message: string) => void };
export const ProfileSpecialRegistrationModal: React.FC<Props> = ({ initialImei = '', onClose, onComplete }) => {
  const [imei, setImei] = useState(initialImei);
  const [reason, setReason] = useState<Reason>('');
  const [arrival, setArrival] = useState('');
  const [passport, setPassport] = useState('');
  const [purchase, setPurchase] = useState<'' | 'with-tax' | 'without-tax'>('');
  const [tax, setTax] = useState('');
  const [bmet, setBmet] = useState<'' | 'yes' | 'no'>('');
  const [bmetNumber, setBmetNumber] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [helpDoc, setHelpDoc] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const imeiRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const helpRef = useRef(helpDoc);
  helpRef.current = helpDoc;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    imeiRef.current?.focus();
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (helpRef.current) { setHelpDoc(null); event.preventDefault(); return; }
        event.preventDefault(); closeRef.current(); return;
      }
      if (event.key !== 'Tab') return;
      const tabbable = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
      ) || []).filter(node => node.getClientRects().length > 0 && !node.closest('[hidden]'));
      if (!tabbable.length) return;
      if (event.shiftKey && document.activeElement === tabbable[0]) { event.preventDefault(); tabbable[tabbable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === tabbable[tabbable.length - 1]) { event.preventDefault(); tabbable[0].focus(); }
    };
    document.addEventListener('keydown', keyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyDown);
      previousFocus?.focus();
    };
  }, []);

  const validImei = /^\d{14,15}$/.test(imei.trim());
  const showReason = true; // IMEI and acquisition choices share the opening modal view.
  const showDetails = validImei && !!reason;
  const validTax = purchase === 'without-tax' || (
    purchase === 'with-tax' && tax.trim() !== '' && Number.isFinite(Number(tax)) && Number(tax) >= 0
  );
  const validBmet = !!bmet && (bmet === 'no' || (!!bmetNumber.trim() && !!files.bmetCard && !fileErrors.bmetCard));
  const reasonDocs: DocumentDefinition[] = reason ? [
    ...documentSets[reason],
    ...(reason === 'airmail' && purchase === 'with-tax' ? [airmailTaxDocument] : []),
  ] : [];
  const validDocs = reasonDocs.every(doc => !fileErrors[doc.id] && (!doc.required || !!files[doc.id]));
  const enabled = showDetails && !!arrival && arrival <= localDate() &&
    (reason !== 'foreign-tour' || !!passport.trim()) && !!purchase && validTax && validDocs && validBmet;

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
  const chooseReason = (value: Exclude<Reason, ''>) => {
    if (reason === value) return;
    setReason(value); setArrival(''); setPassport(''); setPurchase(''); setTax('');
    setFiles({}); setFileErrors({}); setBmet(''); setBmetNumber('');
    setFeedback(''); setSubmitted(false); setHelpDoc(null);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!enabled || submitted) return;
    const message = 'Prototype only — registration has not been submitted to NEIR.';
    setFeedback(message); setSubmitted(true); onComplete?.(message);
  };
  const radio = (name: string, value: string, selected: boolean, onSelect: () => void, label: string) => (
    <label className={'neir-v7-radio-option' + (selected ? ' is-selected' : '')}>
      <input type="radio" name={name} value={value} checked={selected} onChange={onSelect} />
      <span>{label}</span>
    </label>
  );
  // One compact upload row per document, matching the approved reference UI.
  // The purpose icon stays separate from the file upload action.
  const uploadField = (doc: DocumentDefinition) => <div key={doc.id} className="neir-v7-upload-group">
    <div className="neir-v7-upload-line">
      <input type="file" className="neir-v7-file-input" id={'neir-v7-file-' + doc.id}
        aria-label={'Upload ' + doc.label}
        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
        onChange={event => {
          const selected = event.target.files?.[0];
          setFile(doc.id, selected);
          if (selected && (selected.size > maxFileSize || !allowedTypes.includes(selected.type))) event.target.value = '';
        }} />
      <label className={'neir-v7-upload-pick' + (files[doc.id] ? ' is-uploaded' : '')}
        htmlFor={'neir-v7-file-' + doc.id}>
        {files[doc.id] ? <FileText size={17} aria-hidden="true" /> : <span className="neir-v7-upload-plus" aria-hidden="true">+</span>}
        <span className="neir-v7-upload-title">{doc.label}</span>
        {doc.required ? <b className="neir-v7-required" aria-hidden="true">*</b> : <span className="neir-v7-optional">(optional)</span>}
        {files[doc.id] && <span className="neir-v7-upload-filename">{files[doc.id].name}</span>}
      </label>
      {files[doc.id] && <button type="button" className="neir-v7-upload-remove"
        aria-label={'Remove ' + doc.label} onClick={() => setFile(doc.id)}>×</button>}
      <span className="neir-v7-help-wrap">
        <button type="button" className="neir-v7-help-trigger"
          aria-label={'About ' + doc.label + ' attachment'}
          aria-describedby={'neir-v7-help-' + doc.id} aria-expanded={helpDoc === doc.id}
          onClick={() => setHelpDoc(current => current === doc.id ? null : doc.id)}>
          <Info size={17} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span role="tooltip" id={'neir-v7-help-' + doc.id}
          className={'neir-v7-help-tooltip' + (helpDoc === doc.id ? ' is-open' : '')}>{doc.purpose}</span>
      </span>
    </div>
    {fileErrors[doc.id] && <p className="neir-v7-error" role="alert">{fileErrors[doc.id]}</p>}
  </div>;

  const choices = [
    { value: 'airmail' as const, label: 'Bought/Brought from Air Mail', Icon: Package },
    { value: 'gift' as const, label: 'Gift Deed from his relative/ Friends', Icon: Gift },
    { value: 'foreign-tour' as const, label: 'Purchased handset during his foreign tour', Icon: Plane },
  ];
  return <div className="neir-v7-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) closeRef.current(); }}>
    <section className="neir-v7-dialog" role="dialog" aria-modal="true" aria-labelledby="neir-v7-title" ref={rootRef}>
      <header className="neir-v7-header">
        <h2 id="neir-v7-title">Special Registration</h2>
        <button type="button" className="neir-v7-close" aria-label="Close special registration" onClick={onClose}><X size={24} /></button>
      </header>
      <form noValidate className="neir-v7-form" onSubmit={submit}>
        <div className="neir-v7-body">
          <section className="neir-v7-section neir-v7-imei-section" aria-labelledby="neir-v7-imei-heading">
            <h3 className="neir-v7-section-heading" id="neir-v7-imei-heading">Enter the IMEI number of the device you want to register</h3>
            <label className="neir-v7-field" htmlFor="neir-v7-imei">
              <span>IMEI Number <b aria-hidden="true">*</b></span>
              <input id="neir-v7-imei" ref={imeiRef} value={imei} maxLength={15}
                onChange={event => { setImei(event.target.value.replace(/\D/g, '').slice(0,15)); setSubmitted(false); }}
                inputMode="numeric" autoComplete="off" placeholder="Enter 14 or 15 IMEI digits to continue."
                aria-description="The IMEI number must contain 14 or 15 digits." required aria-invalid={!!imei && !validImei} />
            </label>
          </section>
          {showReason && <>
            <div className="neir-v7-divider" aria-hidden="true" />
            <fieldset className="neir-v7-reason-fieldset">
              <legend>Select how you purchased or received the device <b aria-hidden="true">*</b></legend>
              <div className="neir-v7-reason-list">
                {choices.map(({ value, label, Icon }) => <label key={value}
                  className={'neir-v7-reason-card' + (reason === value ? ' is-selected' : '')}>
                  <input type="radio" name="application-reason" aria-label={label} value={value}
                    checked={reason === value} onChange={() => chooseReason(value)} />
                  <span className="neir-v7-reason-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.8} /></span>
                  <span className="neir-v7-reason-copy"><strong>{label}</strong></span>
                  <span className="neir-v7-choice-circle" aria-hidden="true">{reason === value && <Check size={13} strokeWidth={2.5} />}</span>
                </label>)}
              </div>
            </fieldset>
          </>}
          {showDetails && <>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section" aria-labelledby="neir-v7-verification-heading">
              <h3 className="neir-v7-section-heading" id="neir-v7-verification-heading">Provide the device's arrival date and tax details.</h3>
              <div className="neir-v7-grid">
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
                    {radio('purchase', 'with-tax', purchase === 'with-tax', () => { setPurchase('with-tax'); setTax(''); setSubmitted(false); }, 'With Tax')}
                    {radio('purchase', 'without-tax', purchase === 'without-tax', () => { setPurchase('without-tax'); setTax(''); setFiles(prev => { const next = { ...prev }; delete next.applicantTax; return next; }); setFileErrors(prev => { const next = { ...prev }; delete next.applicantTax; return next; }); setSubmitted(false); }, 'Without Tax')}
                  </div>
                </fieldset>
                {purchase === 'with-tax' && <label className="neir-v7-field neir-v7-span" htmlFor="neir-v7-tax">
                  <span>Tax amount <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-tax" type="number" min="0" step="any" inputMode="decimal" value={tax} onChange={event => { setTax(event.target.value); setSubmitted(false); }} placeholder="Enter tax amount" required />
                  {tax !== '' && !validTax && <small className="neir-v7-error" role="alert">Enter a valid tax amount.</small>}
                </label>}
              </div>
            </section>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section" aria-labelledby="neir-v7-docs-heading">
              <h3 className="neir-v7-section-heading" id="neir-v7-docs-heading">Upload the required documents for verification.</h3>
              <p className="neir-v7-doc-limits">PNG, JPG or PDF · Maximum 1 MB per attachment. Select the info icon for upload guidance.</p>
              <div className="neir-v7-document-grid">{reasonDocs.map(uploadField)}</div>
            </section>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section neir-v7-bmet-section" aria-labelledby="neir-v7-bmet-heading">
              <h3 className="neir-v7-section-heading" id="neir-v7-bmet-heading">BMET card information</h3>
              <fieldset className="neir-v7-field neir-v7-span">
                <legend>Do you have a BMET card? <b aria-hidden="true">*</b></legend>
                <div className="neir-v7-radio-group" aria-label="BMET card availability">
                  {radio('bmet', 'yes', bmet === 'yes', () => { setBmet('yes'); setSubmitted(false); }, 'Yes')}
                  {radio('bmet', 'no', bmet === 'no', () => {
                    setBmet('no'); setBmetNumber('');
                    setFiles(previous => { const copy = { ...previous }; delete copy.bmetCard; return copy; });
                    setFileErrors(previous => { const copy = { ...previous }; delete copy.bmetCard; return copy; });
                    setSubmitted(false);
                  }, 'No')}
                </div>
              </fieldset>
              {bmet === 'yes' && <div className="neir-v7-bmet-conditional">
                <label className="neir-v7-field" htmlFor="neir-v7-bmet">
                  <span>BMET Card Number <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-bmet" value={bmetNumber} onChange={event => { setBmetNumber(event.target.value); setSubmitted(false); }} placeholder="Enter BMET card number" required />
                </label>
                {uploadField(bmetDocument)}
              </div>}
            </section>
          </>}
        </div>
        <footer className="neir-v7-footer">
          <p role="status" aria-live="polite">{feedback}</p>
          <button className="neir-v7-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="neir-v7-next" disabled={!enabled || submitted} type="submit">Submit</button>
        </footer>
      </form>
    </section>
  </div>;
};