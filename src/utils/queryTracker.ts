/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QueryTicket {
  ticketId: string;
  citizenName: string;
  mobile: string;
  email: string;
  category: string;
  categoryBangla: string;
  imei?: string;
  brand?: string;
  model?: string;
  subject: string;
  details: string;
  createdAt: string;
  status: 'received' | 'in_review' | 'technical_verification' | 'resolved';
  statusBangla: string;
  officialNoteBangla: string;
  officialNoteEnglish: string;
  timeline: {
    stage: string;
    timestamp: string;
    details: string;
  }[];
}

export const INITIAL_SAMPLE_QUERIES: QueryTicket[] = [
  {
    ticketId: 'BTRC-NEIR-2026-1042',
    citizenName: 'Rafiqul Islam (রফিকুল ইসলাম)',
    mobile: '01711223344',
    email: 'rafiqul.islam@example.com',
    category: 'Handset Registration Issue',
    categoryBangla: 'বিদেশ থেকে আনীত হ্যান্ডসেট নিবন্ধন সংক্রান্ত',
    imei: '359203112345678',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    subject: 'Request to approve customs receipt for personal phone',
    details: 'I brought this iPhone 15 Pro from Dubai through Hazrat Shahjalal International Airport and submitted luggage tax receipt. Awaiting approval.',
    createdAt: '24 October 2026, 11:30 AM',
    status: 'in_review',
    statusBangla: 'পর্যালোচনাধীন (In Review)',
    officialNoteBangla: 'আপনার দাখিলকৃত পাসপোর্ট ও কাস্টমস ডিক্লারেশন স্লিপ পর্যালোচনা করা হচ্ছে। আগামী ২ কার্যদিবসের মধ্যে অনুমোদন সম্পন্ন হবে।',
    officialNoteEnglish: 'Your submitted passport & customs declaration slip are being audited. Approval expected within 2 business days.',
    timeline: [
      {
        stage: 'Query Received',
        timestamp: '24 Oct 2026, 11:30 AM',
        details: 'Citizen submitted inquiry along with supporting luggage declaration token.',
      },
      {
        stage: 'Assigned to Verification Officer',
        timestamp: '25 Oct 2026, 09:15 AM',
        details: 'Assigned to BTRC Spectrum & NEIR Operations Desk (Officer: Engr. M. Ahmed).',
      },
      {
        stage: 'Under Document Verification',
        timestamp: '26 Oct 2026, 02:40 PM',
        details: 'Customs port entry verified with HSIA Passenger Customs database.',
      },
    ],
  },
  {
    ticketId: 'BTRC-NEIR-2026-2891',
    citizenName: 'Nusrat Jahan (নুসরাত জাহান)',
    mobile: '01819876543',
    email: 'nusrat.jahan@example.com',
    category: 'IMEI Verification Dispute',
    categoryBangla: 'আইএমইআই যাচাইয়ে তথ্য গরমিল',
    imei: '864982049876543',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    subject: 'IMEI shows unregistered after official retail purchase',
    details: 'I purchased the smartphone with official warranty and invoice from Jamuna Future Park outlet. Portal showed pending approval.',
    createdAt: '20 October 2026, 04:15 PM',
    status: 'resolved',
    statusBangla: 'নিষ্পত্তিকৃত (Resolved)',
    officialNoteBangla: 'আমদানিকারক কর্তৃক ডাটাবেজে আইএমইআই হালনাগাদ করা হয়েছে। আপনার হ্যান্ডসেটটি এখন আনুষ্ঠানিকভাবে বৈধ ও সক্রিয়।',
    officialNoteEnglish: 'Importer batch update reconciled in NEIR registry. Handset status is now verified and active.',
    timeline: [
      {
        stage: 'Query Submitted',
        timestamp: '20 Oct 2026, 04:15 PM',
        details: 'Query lodged with invoice copy attachment.',
      },
      {
        stage: 'Vendor Reconciliation',
        timestamp: '21 Oct 2026, 11:00 AM',
        details: 'BTRC contacted authorized distributor DBL Telecom for batch IMEI synchronization.',
      },
      {
        stage: 'Resolved',
        timestamp: '22 Oct 2026, 03:00 PM',
        details: 'IMEI 864982049876543 successfully whitelisted in national EIR nodes.',
      },
    ],
  },
];

export function generateTicketId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BTRC-NEIR-2026-${randomNum}`;
}

export function findTicket(
  ticketId: string,
  mobile: string,
  ticketList: QueryTicket[]
): QueryTicket | undefined {
  const cleanId = ticketId.trim().toUpperCase();
  const cleanMobile = mobile.trim().replace(/[-\s]/g, '');

  return ticketList.find(
    (q) =>
      q.ticketId.toUpperCase() === cleanId &&
      (cleanMobile === '' || q.mobile.replace(/[-\s]/g, '').includes(cleanMobile) || cleanMobile.includes(q.mobile.replace(/[-\s]/g, '')))
  );
}
