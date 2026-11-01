import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Eye, FileText, Gift, Package, Paperclip, Plane, Upload, X } from 'lucide-react';
import './ProfileSpecialRegistrationModal.css';

type Reason = '' | 'foreign-tour' | 'gift' | 'airmail';
type DocumentDefinition = { id: string; label: string; required: boolean; purpose: string };

// Document names are based on the earlier 11-page Special Registration reference.
// These remain prototype UI requirements, not a certified BTRC checklist.
const documentSets: Record<Exclude<Reason, ''>, DocumentDefinition[]> = {
  'foreign-tour': [
    { id: 'passportInfo', label: 'Passport Info Page', required: true, purpose: 'Upload the passport identity page showing the applicant’s name, photograph and passport number.' },
    { id: 'arrivalSeal', label: 'Passport Arrival Date Seal', required: true, purpose: 'Upload the passport page showing the arrival-date stamp for this trip.' },
    { id: 'imeiBox', label: 'Device Box IMEI Number', required: true, purpose: 'Upload a clear image of the IMEI printed on the handset box or packaging.' },
    { id: 'travelDocument', label: 'Ticket / Boarding Pass / Travel Document', required: false, purpose: 'Optional travel evidence showing the journey associated with the device.' },
  ],
  gift: [
    { id: 'donorPassport', label: 'Passport Info Page (Donor)', required: true, purpose: 'Upload the passport identity page of the person who gave you the handset.' },
    { id: 'donorArrivalSeal', label: 'Passport Arrival Date Seal (Donor)', required: true, purpose: 'Upload the donor’s passport page showing the arrival-date stamp.' },
    { id: 'imeiBox', label: 'Device Box IMEI Number', required: true, purpose: 'Upload a clear image of the handset packaging with the IMEI visible.' },
    { id: 'giftDeed', label: 'Gift Deed (Donor)', required: true, purpose: 'Upload the gift declaration identifying the donor, recipient and handset.' },
  ],
  airmail: [
    { id: 'courierBill', label: 'Courier Bill', required: true, purpose: 'Upload the shipment or courier receipt showing the sender, recipient and shipment reference.' },
    { id: 'packingList', label: 'Packing List', required: true, purpose: 'Upload the itemized packing list describing the handset included in the parcel.' },
    { id: 'commercialInvoice', label: 'Commercial Invoice', required: true, purpose: 'Upload the invoice identifying the sender or seller and the device supplied.' },
    { id: 'applicantTax', label: 'Applicant Tax Document', required: true, purpose: 'Upload the applicant’s customs or tax-payment document referenced by the registration checklist.' },
  ],
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

  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [helpDoc, setHelpDoc] = useState<string | null>(null);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
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
  const showReason = true;
  const showDetails = validImei && !!reason;
  const reasonDocs: DocumentDefinition[] = reason ? documentSets[reason] : [];
  const validDocs = reasonDocs.every(doc => !fileErrors[doc.id] && (!doc.required || !!files[doc.id]));
  const enabled = showDetails && !!arrival && arrival <= localDate() &&
    (reason !== 'foreign-tour' || !!passport.trim()) && validDocs;

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
    setReason(value); setArrival(''); setPassport('');
    setFiles({}); setFileErrors({}); setDocumentsExpanded(true);
    setFeedback(''); setSubmitted(false); setHelpDoc(null);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!enabled || submitted) return;
    const message = 'Prototype only — registration has not been submitted to NEIR.';
    setFeedback(message); setSubmitted(true); onComplete?.(message);
  };
  // Document checklist uses the existing NEIR design tokens, with the row
  // hierarchy and separate file-picker action from the supplied UX reference.
  const uploadField = (doc: DocumentDefinition) => <div key={doc.id} className="neir-v7-upload-group">
    <div className="neir-v7-upload-line">
      <Paperclip className="neir-v7-document-icon" size={18} aria-hidden="true" />
      <div className="neir-v7-upload-text">
        <div className="neir-v7-upload-title">{doc.label} {doc.required
          ? <b className="neir-v7-required" aria-hidden="true">*</b>
          : <span className="neir-v7-optional">(optional)</span>}</div>
        <p className="neir-v7-upload-desc">{doc.purpose} Maximum allowed size: 1 MB (JPG, PNG, PDF).</p>
        {files[doc.id] && <p className="neir-v7-upload-selected">
          <FileText size={15} aria-hidden="true" />
          <span>Attached: {files[doc.id].name}</span>
          <button type="button" aria-label={'Remove ' + doc.label} onClick={() => setFile(doc.id)}>Remove</button>
        </p>}
      </div>
      <div className="neir-v7-upload-actions">
        <button type="button" className="neir-v7-help-trigger"
          aria-label={'View guidance for ' + doc.label}
          aria-controls={'neir-v7-guide-' + doc.id}
          aria-expanded={helpDoc === doc.id}
          onClick={() => setHelpDoc(current => current === doc.id ? null : doc.id)}>
          <Eye size={16} aria-hidden="true" /> <span>View guidance</span>
        </button>
        <input type="file" className="neir-v7-file-input"
          id={'neir-v7-file-' + doc.id} aria-label={'Upload ' + doc.label}
          accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
          onChange={event => {
            const selected = event.target.files?.[0];
            setFile(doc.id, selected);
            if (selected && (selected.size > maxFileSize || !allowedTypes.includes(selected.type))) event.target.value = '';
          }} />
        <label className="neir-v7-upload-pick" htmlFor={'neir-v7-file-' + doc.id}>
          <Upload size={16} aria-hidden="true" />
          <span>{files[doc.id] ? 'Replace file' : 'Choose file'}</span>
        </label>
      </div>
    </div>
    {helpDoc === doc.id && <div id={'neir-v7-guide-' + doc.id} className="neir-v7-upload-guidance" role="note">
      <strong>{doc.label}</strong>: {doc.purpose}
      <span> This is upload guidance, not an official sample document.</span>
    </div>}
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
              <h3 className="neir-v7-section-heading" id="neir-v7-verification-heading">Arrival information</h3>
              <div className="neir-v7-grid">
                <label className={'neir-v7-field' + (reason !== 'foreign-tour' ? ' neir-v7-span' : '')} htmlFor="neir-v7-arrival">
                  <span>Select arrival date <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-arrival" type="date" max={localDate()} value={arrival}
                    onChange={event => { setArrival(event.target.value); setSubmitted(false); }}
                    required aria-invalid={!!arrival && arrival > localDate()} />
                  {arrival && arrival > localDate() && <small className="neir-v7-error" role="alert">Future dates are not allowed.</small>}
                </label>
                {reason === 'foreign-tour' && <label className="neir-v7-field" htmlFor="neir-v7-passport">
                  <span>Passport number <b aria-hidden="true">*</b></span>
                  <input id="neir-v7-passport" value={passport}
                    onChange={event => { setPassport(event.target.value); setSubmitted(false); }}
                    placeholder="Enter passport number" required />
                </label>}
              </div>
            </section>
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section neir-v7-doc-panel" aria-labelledby="neir-v7-docs-heading">
              <button type="button" className="neir-v7-doc-panel-header"
                aria-expanded={documentsExpanded} aria-controls="neir-v7-document-list"
                onClick={() => setDocumentsExpanded(expanded => !expanded)}>
                <span id="neir-v7-docs-heading">Upload Documents</span>
                <ChevronDown size={19} className={documentsExpanded ? 'is-open' : ''} aria-hidden="true" />
              </button>
              {documentsExpanded && <div id="neir-v7-document-list" className="neir-v7-document-grid">
                {reasonDocs.map(uploadField)}
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