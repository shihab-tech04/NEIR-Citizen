import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import './NeirDocumentDemo.css';

type Sample = {
  category: 'identity' | 'arrival' | 'shipping' | 'invoice' | 'packing' | 'box' | 'travel' | 'gift' | 'tax';
  heading: string;
  reference: string;
  fields: Array<[string, string]>;
  note: string;
  rows?: Array<[string, string, string]>;
};

// These are intentionally fictional, non-functional UI examples. They are not
// reproductions of government/airline/company documents or real submitted data.
const samples: Record<string, Sample> = {
  passportInfo: {
    category: 'identity', heading: 'Example passport information page', reference: 'SAMPLE-PASSPORT',
    fields: [['Full name', 'EXAMPLE PERSON'], ['Passport no.', 'SAMPLE-XXXX'],
      ['Nationality', 'SAMPLE COUNTRY'], ['Date of birth', 'DD MMM YYYY'],
      ['Expiry', 'DD MMM YYYY']], note: 'The upload should clearly show the passport holder’s identity information.',
  },
  donorPassport: {
    category: 'identity', heading: 'Example donor passport information page', reference: 'DONOR-SAMPLE',
    fields: [['Full name', 'EXAMPLE DONOR'], ['Passport no.', 'SAMPLE-XXXX'],
      ['Nationality', 'SAMPLE COUNTRY'], ['Date of birth', 'DD MMM YYYY'],
      ['Expiry', 'DD MMM YYYY']], note: 'Use the passport information page belonging to the person who gave the gift.',
  },
  arrivalSeal: {
    category: 'arrival', heading: 'Example passport arrival stamp page', reference: 'ARRIVAL-SAMPLE',
    fields: [['Traveler', 'EXAMPLE PERSON'], ['Arrival date', 'DD MMM YYYY'],
      ['Page', 'Passport page with an entry stamp']], note: 'Show the passport page where the arrival-date stamp is visible.',
  },
  donorArrivalSeal: {
    category: 'arrival', heading: 'Example donor arrival stamp page', reference: 'DONOR-ARRIVAL',
    fields: [['Traveler', 'EXAMPLE DONOR'], ['Arrival date', 'DD MMM YYYY'],
      ['Page', 'Passport page with an entry stamp']], note: 'Use the donor’s passport page showing the arrival date.',
  },
  imeiBox: {
    category: 'box', heading: 'Example device packaging label', reference: 'BOX-LABEL-SAMPLE',
    fields: [['Product', 'EXAMPLE HANDSET'], ['IMEI', '000000000000000'],
      ['Model', 'MODEL-SAMPLE'], ['Serial', 'SAMPLE-ONLY']],
    note: 'The IMEI on the box must be legible and match the device being registered.',
  },
  travelDocument: {
    category: 'travel', heading: 'Example boarding pass', reference: 'TRAVEL-SAMPLE',
    fields: [['Passenger', 'EXAMPLE PERSON'], ['Flight', 'SAMPLE-001'],
      ['Travel date', 'DD MMM YYYY'], ['Route', 'CITY A — CITY B']],
    note: 'An optional ticket or boarding pass may support the date of travel.',
  },
  giftDeed: {
    category: 'gift', heading: 'Example gift declaration', reference: 'GIFT-SAMPLE',
    fields: [['Donor', 'EXAMPLE DONOR'], ['Recipient', 'EXAMPLE RECIPIENT'],
      ['Device', 'EXAMPLE HANDSET'], ['IMEI', '000000000000000'],
      ['Date', 'DD MMM YYYY']], note: 'A gift declaration should identify the donor, recipient and handset.',
  },
  courierBill: {
    category: 'shipping', heading: 'Example courier receipt', reference: 'COURIER-SAMPLE',
    fields: [['Tracking reference', 'SAMPLE-000001'], ['Sender', 'EXAMPLE SENDER'],
      ['Recipient', 'EXAMPLE RECIPIENT'], ['Item', 'Mobile handset'],
      ['Dispatch date', 'DD MMM YYYY']], note: 'The receipt should show shipment details and its reference number.',
  },
  packingList: {
    category: 'packing', heading: 'Example packing list', reference: 'PACKING-SAMPLE',
    fields: [['Sender', 'EXAMPLE SENDER'], ['Recipient', 'EXAMPLE RECIPIENT'],
      ['Shipment ref.', 'SAMPLE-000001']],
    rows: [['1', 'Example mobile handset', '1 unit'], ['2', 'Example packaging', '1 item']],
    note: 'Use the itemized list describing what was inside the parcel.',
  },
  commercialInvoice: {
    category: 'invoice', heading: 'Example commercial invoice', reference: 'INVOICE-SAMPLE',
    fields: [['Seller', 'EXAMPLE SELLER'], ['Buyer', 'EXAMPLE BUYER'],
      ['Invoice no.', 'SAMPLE-INV-001'], ['Date', 'DD MMM YYYY']],
    rows: [['1', 'Example mobile handset', 'SAMPLE VALUE']],
    note: 'The invoice should identify the seller and the handset supplied.',
  },
  applicantTax: {
    category: 'tax', heading: 'Example customs payment record', reference: 'PAYMENT-SAMPLE',
    fields: [['Applicant', 'EXAMPLE APPLICANT'], ['Payment ref.', 'SAMPLE-REF-001'],
      ['Document date', 'DD MMM YYYY'], ['Purpose', 'Handset-related customs / tax payment']],
    note: 'Use the applicant’s payment evidence identified by the registration document checklist.',
  },
};

export const NeirDocumentDemo: React.FC<{ documentId: string; documentName: string }> = ({ documentId, documentName }) => {
  const sample = samples[documentId];
  if (!sample) return <p>There is no illustrative example for this attachment.</p>;
  const isPassport = sample.category === 'identity';
  const hasStamp = sample.category === 'arrival';

  return (
    <div className="neir-demo-document-area">
      <p className="neir-demo-explanation">Illustrative sample only. This is not an official document, a valid template, or an acceptable upload.</p>
      <article className={'neir-demo-paper neir-demo-paper--' + sample.category} aria-label={'Demo copy of ' + documentName}>
        <div className="neir-demo-watermark" aria-hidden="true">DEMO ONLY</div>
        <header className="neir-demo-paper-header">
          <div className="neir-demo-paper-icon"><FileText size={22} strokeWidth={1.6} aria-hidden="true" /></div>
          <div>
            <strong>{sample.heading}</strong>
            <span>FICTITIOUS EXAMPLE · {sample.reference}</span>
          </div>
        </header>
        {isPassport && <div className="neir-demo-passport-portrait" aria-label="Blank sample photograph area">
          <span aria-hidden="true">PHOTO</span>
          <small>Not a real identity</small>
        </div>}
        {hasStamp && <div className="neir-demo-stamp" aria-label="Illustrative arrival stamp marked sample">
          <span>ILLUSTRATIVE</span><strong>ARRIVAL</strong><span>DD MMM YYYY</span><small>NOT AN OFFICIAL STAMP</small>
        </div>}
        {sample.category === 'box' && <div className="neir-demo-barcode" aria-hidden="true" />}
        <dl className="neir-demo-paper-fields">
          {sample.fields.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
        </dl>
        {sample.rows && <div className="neir-demo-paper-table-scroll"><table className="neir-demo-paper-table">
          <thead><tr><th>No.</th><th>Item description</th><th>Example detail</th></tr></thead>
          <tbody>{sample.rows.map(([number, item, detail]) => <tr key={number}><td>{number}</td><td>{item}</td><td>{detail}</td></tr>)}</tbody>
        </table></div>}
        {sample.category === 'gift' && <div className="neir-demo-signatures"><span>Donor signature: __________</span><span>Recipient signature: __________</span></div>}
        <footer className="neir-demo-paper-footer"><ShieldAlert size={16} aria-hidden="true" /> SAMPLE ONLY · NOT VALID FOR IDENTIFICATION OR SUBMISSION</footer>
      </article>
      <p className="neir-demo-upload-tip"><strong>What to upload:</strong> {sample.note}</p>
    </div>
  );
};
