import React, { useEffect, useRef, useState } from 'react';
import { useNeirDialogFocus } from '../ui/useNeirDialogFocus.ts';
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Eye, FileText, Gift, Package, Paperclip, Plane, Upload, X } from 'lucide-react';
import './ProfileSpecialRegistrationModal.css';
import { NeirDocumentDemo, downloadNeirDocumentSample } from './NeirDocumentDemo';
import { submitNeirSpecialRegistration } from '../utils/neirSpecialRegistrationApi.ts';
import { UiInput, UiButton } from '../ui/index.ts';

type Reason = '' | 'foreign-tour' | 'gift' | 'airmail';
type DocumentDefinition = { id: string; label: string; required: boolean; purpose: string };

// Acquisition-specific checklist. Gift and foreign-tour now require only the
// corresponding passport information and arrival-seal documents; existing files
// on previously submitted applications are retained in SQL and private storage.
const documentSets: Record<Exclude<Reason, ''>, DocumentDefinition[]> = {
  'foreign-tour': [
    { id: 'passportInfo', label: 'Passport Info Page', required: true, purpose: 'Passport page showing name, photo and number.' },
    { id: 'arrivalSeal', label: 'Passport Arrival Date Seal', required: true, purpose: 'Passport page showing the arrival stamp.' },
  ],
  gift: [
    { id: 'donorPassport', label: 'Passport Info Page (Donor)', required: true, purpose: 'Donor’s passport page with identity details.' },
    { id: 'donorArrivalSeal', label: 'Passport Arrival Date Seal (Donor)', required: true, purpose: 'Donor’s passport page with arrival stamp.' },
  ],
  airmail: [
    { id: 'courierBill', label: 'Courier Bill', required: false, purpose: 'Courier receipt with tracking and recipient details.' },
    { id: 'packingList', label: 'Packing List', required: false, purpose: 'Item list showing the handset in the parcel.' },
    { id: 'commercialInvoice', label: 'Commercial Invoice', required: true, purpose: 'Invoice identifying the seller and handset.' },
  ],
};
const maxFileSize = 1024 * 1024;
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

type Props = { initialImei?: string; citizenMobile: string; onClose: () => void; onBack?: () => void; onComplete?: (message: string) => void };
export const ProfileSpecialRegistrationModal: React.FC<Props> = ({ initialImei = '', citizenMobile, onClose, onBack, onComplete }) => {
  const [imei, setImei] = useState(initialImei);
  const [reason, setReason] = useState<Reason>('');
  const [arrival, setArrival] = useState('');
  const [passport, setPassport] = useState('');

  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [demoDoc, setDemoDoc] = useState<DocumentDefinition | null>(null);
  const [returningFromSample, setReturningFromSample] = useState(false);
  const returnFromSample = () => { setReturningFromSample(true); setDemoDoc(null); };
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLInputElement>(null);
  const arrivalSectionRef = useRef<HTMLElement>(null);
  const imeiRef = useRef<HTMLInputElement>(null);
  const demoDocRef = useRef(demoDoc);
  demoDocRef.current = demoDoc;
  const rootRef = useNeirDialogFocus<HTMLElement>({
    onClose,
    initialFocusSelector:onBack ? '.neir-modal-back' : '#neir-v7-imei',
    onEscape: () => {
      if (demoDocRef.current) {
        setReturningFromSample(true);
        setDemoDoc(null);
        return;
      }
      onClose();
    },
  });
  const demoCloseRef = useRef<HTMLButtonElement>(null);
  const demoReturnFocusRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!demoDoc) return;
    demoCloseRef.current?.focus();
    return () => { demoReturnFocusRef.current?.focus(); };
  }, [demoDoc]);


  useEffect(() => {
    // Selecting a purchase method shows the remaining form fields immediately.
    if (!reason) return;
    const body = bodyRef.current;
    const arrivalSection = arrivalSectionRef.current;
    arrivalRef.current?.focus({ preventScroll: true });
    if (body && arrivalSection) {
      const top = body.scrollTop + arrivalSection.getBoundingClientRect().top - body.getBoundingClientRect().top - 12;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      body.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  }, [reason]);

  const validImei = /^\d{14,15}$/.test(imei.trim());
  const showReason = true;
  const canContinue = validImei && !!reason;
  const showDetails = canContinue;
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
    setFeedback(''); setSubmitted(false); setDemoDoc(null);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!enabled || submitted) return;
    setSubmitting(true);
    setFeedback('');
    try {
      const response = await submitNeirSpecialRegistration({
        imei:imei.trim(),reason,arrivalDate:arrival,mobile:citizenMobile,
        passportNumber:passport.trim(),files
      });
      setSubmitted(true);
      setFeedback('Special Registration submitted for review. Reference: ' + response.record.id);
      onComplete?.('Special Registration submitted. Reference: ' + response.record.id);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };
  // Document checklist uses the existing NEIR design tokens, with the row
  // hierarchy and separate file-picker action from the supplied UX reference.
  const uploadField = (doc: DocumentDefinition) => {
    const file = files[doc.id];
    return <div key={doc.id} className={'neir-v7-upload-group' + (file ? ' is-complete' : '')}>
      <div className="neir-v7-upload-line">
        {file ? <CheckCircle2 className="neir-v7-document-icon neir-v7-document-complete-icon" size={19} aria-label="File attached" /> :
          <Paperclip className="neir-v7-document-icon" size={18} aria-hidden="true" />}
        <div className="neir-v7-upload-text">
          <div className="neir-v7-upload-title">{doc.label}
            {doc.required && <> <b className="neir-v7-required" aria-hidden="true">*</b></>}
          </div>
          <p className="neir-v7-upload-desc">{doc.purpose}</p>
        </div>
        <div className="neir-v7-upload-actions">
          <button type="button" className="neir-v7-help-trigger"
            aria-label={'View sample of ' + doc.label}
            onClick={event => { demoReturnFocusRef.current = event.currentTarget; setReturningFromSample(false); setDemoDoc(doc); }}>
            <Eye size={16} aria-hidden="true" /> <span>View sample</span>
          </button>
          <input type="file" className="neir-v7-file-input"
            id={'neir-v7-file-' + doc.id} aria-label={'Upload ' + doc.label}
            aria-required={doc.required} required={doc.required && !file}
            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
            onChange={event => {
              const selected = event.target.files?.[0];
              if (selected) setFile(doc.id, selected);
              else if (!files[doc.id]) setFile(doc.id); // Clear a rejected picker attempt, but retain an already attached file.
              event.target.value = '';
            }} />
          {!file && <label className="neir-v7-upload-pick" htmlFor={'neir-v7-file-' + doc.id}>
            <Upload size={16} aria-hidden="true" />
            <span>Choose file</span>
          </label>}
        </div>
      </div>
      {file && <div className="neir-v7-uploaded-file" role="group" aria-label={'Attached ' + doc.label}>
        <FileText size={16} aria-hidden="true" />
        <span className="neir-v7-uploaded-file-name" title={file.name}>{file.name}</span>
        <button className="neir-v7-uploaded-remove" type="button"
          aria-label={'Remove ' + doc.label} title="Remove attachment"
          onClick={() => setFile(doc.id)}>
          <X size={17} aria-hidden="true" />
        </button>
      </div>}
      {fileErrors[doc.id] && <p className="neir-v7-error" role="alert">{fileErrors[doc.id]}</p>}
    </div>;
  };

  const choices = [
    { value: 'airmail' as const, label: 'Bought/Brought from Air Mail', Icon: Package },
    { value: 'gift' as const, label: 'Gift Deed from his relative/ Friends', Icon: Gift },
    { value: 'foreign-tour' as const, label: 'Purchased handset during his foreign tour', Icon: Plane },
  ];
  return <div className="neir-v7-backdrop neir-modal-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="neir-v7-dialog neir-modal-surface" role="dialog" aria-modal="true" aria-labelledby="neir-v7-title" ref={rootRef} tabIndex={-1}>
      <header className="neir-v7-header">
        <div className="neir-v7-title-group">
          {(demoDoc || onBack) && <button type="button" className="neir-v7-back neir-modal-back"
            ref={demoDoc ? demoCloseRef : undefined}
            aria-label={demoDoc ? 'Back to registration' : 'Back'}
            onClick={demoDoc ? returnFromSample : onBack}>
            <ArrowLeft size={22} aria-hidden="true" />
          </button>}
          <h2 id="neir-v7-title">{demoDoc ? 'Sample · ' + demoDoc.label : 'Special Registration'}</h2>
        </div>
        <button type="button" className="neir-v7-close" aria-label="Close special registration" onClick={onClose}>
          <X size={24} aria-hidden="true" />
        </button>
      </header>
      <form noValidate className={'neir-v7-form' + (returningFromSample && !demoDoc ? ' neir-v7-form--swap-back' : '')} onSubmit={submit}
        aria-hidden={!!demoDoc} style={demoDoc ? { display: 'none' } : undefined}>
        <div className="neir-v7-body" ref={bodyRef}>
          <div className="neir-v7-stage" key="device">
          <section className="neir-v7-section neir-v7-imei-section" aria-labelledby="neir-v7-imei-heading">
            <h3 className="neir-v7-section-heading" id="neir-v7-imei-heading">Enter the IMEI number of the device you want to register</h3>
            <label className="neir-v7-field" htmlFor="neir-v7-imei">
              <span>IMEI Number <b aria-hidden="true">*</b></span>
              <UiInput id="neir-v7-imei" ref={imeiRef} value={imei} maxLength={15}
                onChange={event => {
                  const nextImei = event.target.value.replace(/\D/g, '').slice(0,15);
                  setImei(nextImei);
                  setSubmitted(false);
                  if (!/^\d{14,15}$/.test(nextImei)) {
                    // A partial IMEI must never retain a previously selected acquisition method.
                    setReason(''); setArrival(''); setPassport('');
                    setFiles({}); setFileErrors({}); setFeedback('');
                  }
                }}
                inputMode="numeric" autoComplete="off" placeholder="Enter 14 or 15 IMEI digits."
                aria-description="The IMEI number must contain 14 or 15 digits." required aria-invalid={!!imei && !validImei} />
            </label>
          </section>
          {showReason && <>
            <div className="neir-v7-divider" aria-hidden="true" />
            <fieldset className="neir-v7-reason-fieldset" disabled={!validImei} aria-disabled={!validImei}>
              <legend>Select how you purchased or received the device <b aria-hidden="true">*</b></legend>
              <div className="neir-v7-reason-list">
                {choices.map(({ value, label, Icon }) => <label key={value}
                  className={'neir-v7-reason-card' + (!validImei ? ' is-disabled' : '') + (reason === value ? ' is-selected' : '')}>
                  <input type="radio" name="application-reason" aria-label={label} value={value}
                    checked={reason === value} disabled={!validImei} onChange={() => { if (validImei) chooseReason(value); }} />
                  <span className="neir-v7-reason-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.8} /></span>
                  <span className="neir-v7-reason-copy"><strong>{label}</strong></span>
                  <span className="neir-v7-choice-circle" aria-hidden="true">{reason === value && <Check size={13} strokeWidth={2.5} />}</span>
                </label>)}
              </div>
            </fieldset>
          </>}
          </div>
          {showDetails && <div className="neir-v7-stage" key="arrival">
            <div className="neir-v7-divider" aria-hidden="true" />
            <section className="neir-v7-section" ref={arrivalSectionRef} aria-labelledby="neir-v7-verification-heading">
              <h3 className="neir-v7-section-heading" id="neir-v7-verification-heading">Arrival information</h3>
              <div className="neir-v7-grid">
                <label className={'neir-v7-field' + (reason !== 'foreign-tour' ? ' neir-v7-span' : '')} htmlFor="neir-v7-arrival">
                  <span>Select arrival date <b aria-hidden="true">*</b></span>
                  <UiInput id="neir-v7-arrival" ref={arrivalRef} type="date" max={localDate()} value={arrival}
                    onChange={event => { setArrival(event.target.value); setSubmitted(false); }}
                    required aria-invalid={!!arrival && arrival > localDate()} />
                  {arrival && arrival > localDate() && <small className="neir-v7-error" role="alert">Future dates are not allowed.</small>}
                </label>
                {reason === 'foreign-tour' && <label className="neir-v7-field" htmlFor="neir-v7-passport">
                  <span>Passport number <b aria-hidden="true">*</b></span>
                  <UiInput id="neir-v7-passport" value={passport}
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
                <p className="neir-v7-doc-panel-hint">JPG, PNG or PDF · Max 1 MB per file.</p>
                {reasonDocs.map(uploadField)}
              </div>}
            </section>
          </div>}
        </div>
        <footer className="neir-v7-footer">
          <p role="status" aria-live="polite">{feedback}</p>
          <UiButton variant="link" className="neir-v7-cancel" onClick={onClose}>Cancel</UiButton>
           <UiButton variant="primary" className="neir-v7-next" disabled={submitting || !enabled || submitted} type="submit" loading={submitting}>{submitting ? 'Submitting…' : submitted ? 'Submitted' : 'Submit'}</UiButton>
        </footer>
      </form>
      {demoDoc && <div className="neir-v7-sample-view neir-modal-animated-content" id="neir-v7-sample-view">
        <div className="neir-v7-demo-content">
          <NeirDocumentDemo documentId={demoDoc.id} documentName={demoDoc.label} />
        </div>
        <footer className="neir-v7-footer neir-v7-sample-footer">
          <UiButton variant="link" className="neir-v7-next" onClick={() => downloadNeirDocumentSample(demoDoc.id)}>
            Download sample
          </UiButton>
        </footer>
      </div>}
    </section>
  </div>;
};