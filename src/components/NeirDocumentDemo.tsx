import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import './NeirDocumentDemo.css';

type Sample = {
  category: 'identity' | 'arrival' | 'shipping' | 'invoice' | 'packing' | 'box' | 'travel' | 'gift';
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

};


/** Downloadable, print-ready, fictional HTML reference. Never submit as identity evidence. */
export function downloadNeirDocumentSample(documentId: string): void {
  const sample = samples[documentId];
  if (!sample) return;
  const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
  const fields = sample.fields.map(([label, value]) =>
    '<div class="field"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>').join('');
  const rows = sample.rows?.map(([number, item, detail]) =>
    '<tr><td>' + escapeHtml(number) + '</td><td>' + escapeHtml(item) + '</td><td>' + escapeHtml(detail) + '</td></tr>').join('') || '';
  const table = rows ? '<table><thead><tr><th>No.</th><th>Item description</th><th>Example detail</th></tr></thead><tbody>' + rows + '</tbody></table>' : '';
  const html = [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>', escapeHtml(sample.heading), ' — sample only</title>',
    '<style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;padding:0 24px;color:#263b49}',
    'h1{font-size:24px} .notice{font-weight:bold;color:#a83232;border:2px solid #a83232;padding:14px;margin:20px 0;text-align:center}',
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{padding:14px;border:1px solid #dce5ec;border-radius:8px}',
    '.field span{display:block;font-size:12px;color:#667788;margin-bottom:6px}.field strong{overflow-wrap:anywhere}',
    'table{width:100%;border-collapse:collapse;margin:24px 0}td,th{border:1px solid #dce5ec;text-align:left;padding:10px}',
    '.foot{margin-top:28px;line-height:1.6}@media print{body{margin:0;max-width:none}}</style></head><body>',
    '<div class="notice">SAMPLE ONLY — NOT VALID FOR IDENTIFICATION OR SUBMISSION</div>',
    '<h1>', escapeHtml(sample.heading), '</h1><p>Fictitious example · ', escapeHtml(sample.reference), '</p>',
    '<div class="grid">', fields, '</div>', table,
    '<p class="foot"><strong>What to upload:</strong> ', escapeHtml(sample.note), '</p>',
    '<div class="notice">ILLUSTRATIVE SAMPLE — NOT AN OFFICIAL DOCUMENT</div></body></html>'
  ].join('');
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'neir-sample-' + documentId.replace(/([A-Z])/g, '-$1').toLowerCase() + '.html';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const NeirDocumentDemo: React.FC<{ documentId: string; documentName: string }> = ({ documentId, documentName }) => {
  const sample = samples[documentId];
  if (!sample) return <p>There is no illustrative example for this attachment.</p>;
  const isPassport = sample.category === 'identity';
  const hasStamp = sample.category === 'arrival';

  return (
    <div className="neir-demo-document-area">
      <p className="neir-demo-explanation">Document format example.</p>
      <article className={'neir-demo-paper neir-demo-paper--' + sample.category} aria-label={'Example of ' + documentName}>
        <div className="neir-demo-watermark" aria-hidden="true">SAMPLE</div>
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
        <footer className="neir-demo-paper-footer"><ShieldAlert size={16} aria-hidden="true" /> SAMPLE DOCUMENT</footer>
      </article>
      <p className="neir-demo-upload-tip"><strong>What to upload:</strong> {sample.note}</p>
    </div>
  );
};
