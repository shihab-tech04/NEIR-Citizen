/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HandsetRecord {
  imei: string;
  brand: string;
  model: string;
  tac: string;
  equipmentType: 'Smartphone' | 'Feature Phone' | 'Tablet / Cellular';
  registrationStatus: 'valid' | 'grey_market' | 'unregistered' | 'blacklisted';
  statusBangla: string;
  statusEnglish: string;
  detailsBangla: string;
  detailsEnglish: string;
  registeredDate?: string;
  importerOrManufacturer?: string;
}

export const SAMPLE_HANDSETS: Record<string, HandsetRecord> = {
  '352093081234567': {
    imei: '352093081234567',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra 5G',
    tac: '35209308',
    equipmentType: 'Smartphone',
    registrationStatus: 'valid',
    statusBangla: 'হ্যান্ডসেটের আইএমইআই বৈধ এবং বিটিআরসি ডাটাবেজে অন্তর্ভুক্ত রয়েছে।',
    statusEnglish: 'Handset IMEI is valid and registered in BTRC NEIR database.',
    detailsBangla: 'হ্যান্ডসেটটি বৈধভাবে আমদানিকৃত এবং স্থানীয় নেটওয়ার্কে ব্যবহারের জন্য সম্পূর্ণ অনুমোদিত।',
    detailsEnglish: 'The handset is legitimately imported and fully authorized for use on national cellular networks.',
    registeredDate: '12 January 2024',
    importerOrManufacturer: 'Fair Electronics Ltd. (Official Samsung Distributor)',
  },
  '864982049876543': {
    imei: '864982049876543',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro+',
    tac: '86498204',
    equipmentType: 'Smartphone',
    registrationStatus: 'valid',
    statusBangla: 'হ্যান্ডসেটের আইএমইআই বৈধ এবং বিটিআরসি ডাটাবেজে অন্তর্ভুক্ত রয়েছে।',
    statusEnglish: 'Handset IMEI is valid and registered in BTRC NEIR database.',
    detailsBangla: 'হ্যান্ডসেটটি স্থানীয়ভাবে উৎপাদিত / সংযোজিত এবং বিটিআরসি কর্তৃক অনুমোদিত।',
    detailsEnglish: 'Locally assembled / manufactured under BTRC telecom equipment standards.',
    registeredDate: '05 March 2024',
    importerOrManufacturer: 'DBL Telecom Ltd. (Xiaomi Bangladesh)',
  },
  '359203112345678': {
    imei: '359203112345678',
    brand: 'Apple',
    model: 'iPhone 15 Pro 256GB',
    tac: '35920311',
    equipmentType: 'Smartphone',
    registrationStatus: 'grey_market',
    statusBangla: 'হ্যান্ডসেটটি বিটিআরসি সিস্টেমে সাময়িক সক্রিয় অবস্থায় রয়েছে, তবে আনুষ্ঠানিক শুল্কায়িত নিবন্ধন সম্পন্ন হয়নি।',
    statusEnglish: 'Handset is provisionally active on network, but formal customs registration is pending.',
    detailsBangla: 'ব্যক্তিগতভাবে বিদেশ হতে আনীত হলে পাসপোর্ট ও শুল্ক স্লিপ দিয়ে সিটিজেন পোর্টালে নিবন্ধন সম্পন্ন করুন।',
    detailsEnglish: 'If brought from abroad for personal use, register via Citizen Portal with passport & customs receipt.',
    registeredDate: '20 November 2023',
    importerOrManufacturer: 'Personal Import / Unregistered Channel',
  },
  '861111002223334': {
    imei: '861111002223334',
    brand: 'Walton',
    model: 'Primo RM4',
    tac: '86111100',
    equipmentType: 'Smartphone',
    registrationStatus: 'valid',
    statusBangla: 'হ্যান্ডসেটের আইএমইআই বৈধ এবং বিটিআরসি ডাটাবেজে অন্তর্ভুক্ত রয়েছে।',
    statusEnglish: 'Handset IMEI is valid and registered in BTRC NEIR database.',
    detailsBangla: 'বাংলাদেশেই উৎপাদিত বিশ্বমানের স্মার্টফোন। বিটিআরসি অনুমোদিত।',
    detailsEnglish: 'Manufactured locally in Bangladesh with BTRC certification.',
    registeredDate: '18 July 2023',
    importerOrManufacturer: 'Walton Digi-Tech Industries Ltd.',
  },
  '351234567890123': {
    imei: '351234567890123',
    brand: 'Unknown / Generic',
    model: 'Cloned Device',
    tac: '35123456',
    equipmentType: 'Feature Phone',
    registrationStatus: 'unregistered',
    statusBangla: 'হ্যান্ডসেটের আইএমইআই বিটিআরসি ডাটাবেজে পাওয়া যায়নি (অননুমোদিত হ্যান্ডসেট)।',
    statusEnglish: 'Handset IMEI was not found in the BTRC NEIR database (Unauthorized handset).',
    detailsBangla: 'হ্যান্ডসেটটি অবৈধভাবে আমদানিকৃত বা ক্লোন করা হতে পারে। অনুগ্রহ করে বিক্রেতার সাথে যোগাযোগ করুন।',
    detailsEnglish: 'Device may be illegally imported, fake or cloned. Contact seller immediately.',
    registeredDate: 'N/A',
    importerOrManufacturer: 'Unauthorized Source',
  },
  '869999008888777': {
    imei: '869999008888777',
    brand: 'OnePlus',
    model: 'OnePlus 11 5G',
    tac: '86999900',
    equipmentType: 'Smartphone',
    registrationStatus: 'blacklisted',
    statusBangla: 'সতর্কতা: হ্যান্ডসেটটি চুরি হওয়া বা হারানো হিসাবে বিটিআরসি ব্লকলিস্টে তালিকাভুক্ত রয়েছে!',
    statusEnglish: 'Alert: Handset is flagged as Stolen / Lost and is blacklisted on national telecom networks!',
    detailsBangla: 'আইনশৃঙ্খলা রক্ষাকারী বাহিনীর অনুরোধে এই হ্যান্ডসেটটির সংযোগ বিচ্ছিন্ন করা হয়েছে। নিকটস্থ থানায় বা বিটিআরসিতে যোগাযোগ করুন।',
    detailsEnglish: 'Device blocked pursuant to law enforcement report. Contact nearest police station or BTRC.',
    registeredDate: 'Blocked on 14 February 2024',
    importerOrManufacturer: 'Reported Stolen by Law Enforcement',
  },
};

/**
 * Validates whether string is exactly 15 digits.
 */
export function isValidImeiFormat(imei: string): boolean {
  const cleaned = imei.trim().replace(/[-\s]/g, '');
  return /^\d{15}$/.test(cleaned);
}

/**
 * Checks IMEI status in NEIR prototype database
 */
export function checkImeiStatus(imei: string): {
  success: boolean;
  message?: string;
  data?: HandsetRecord;
} {
  const cleaned = imei.trim().replace(/[-\s]/g, '');

  if (!isValidImeiFormat(cleaned)) {
    return {
      success: false,
      message: 'অনুগ্রহ করে সঠিক ১৫ ডিজিটের আইএমইআই (IMEI) নম্বর লিখুন / Please enter a valid 15-digit numeric IMEI.',
    };
  }

  // Check in sample dictionary
  if (SAMPLE_HANDSETS[cleaned]) {
    return {
      success: true,
      data: SAMPLE_HANDSETS[cleaned],
    };
  }

  // Realistic fallback for any other 15-digit IMEI entered by user
  // We determine a deterministic valid/imported status based on TAC
  const tac = cleaned.slice(0, 8);
  const lastDigit = parseInt(cleaned.slice(-1), 10);
  
  if (lastDigit === 9) {
    // Treat as unregistered / not found
    return {
      success: true,
      data: {
        imei: cleaned,
        brand: 'Generic / Unlisted',
        model: 'Cellular Terminal',
        tac,
        equipmentType: 'Smartphone',
        registrationStatus: 'unregistered',
        statusBangla: 'হ্যান্ডসেটের আইএমইআই বিটিআরসি ডাটাবেজে পাওয়া যায়নি।',
        statusEnglish: 'Handset IMEI not found in BTRC NEIR database.',
        detailsBangla: 'হ্যান্ডসেটটি বৈধ চ্যানেলে আমদানিকৃত নয় অথবা শুল্ক তথ্য সংরক্ষিত নেই।',
        detailsEnglish: 'The handset is not recognized as a registered import.',
        registeredDate: 'Not Registered',
        importerOrManufacturer: 'Unverified Entity',
      },
    };
  }

  return {
    success: true,
    data: {
      imei: cleaned,
      brand: 'Smartphone Device',
      model: `Model TAC-${tac.slice(0, 4)}`,
      tac,
      equipmentType: 'Smartphone',
      registrationStatus: 'valid',
      statusBangla: 'হ্যান্ডসেটের আইএমইআই বৈধ এবং বিটিআরসি ডাটাবেজে অন্তর্ভুক্ত রয়েছে।',
      statusEnglish: 'Handset IMEI is valid and registered in BTRC NEIR database.',
      detailsBangla: 'হ্যান্ডসেটটি অনুমোদিত আমদানিকারক কর্তৃক বিটিআরসিতে নথিভুক্ত।',
      detailsEnglish: 'Device officially recorded and authorized for use on national telecom networks.',
      registeredDate: '10 January 2024',
      importerOrManufacturer: 'Authorized Telecom Distributor',
    },
  };
}
