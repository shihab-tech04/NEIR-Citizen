import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(file,'utf8');
const profile = read('src/components/CitizenImeiListView.tsx');
const style = read('src/components/CitizenImeiListView.css');
const wizard = read('src/components/ProfileSpecialRegistrationModal.tsx');
const wizardStyle = read('src/components/ProfileSpecialRegistrationModal.css');
const edge = read('supabase/functions/neir-prototype-special/index.ts');
assert(profile.includes("searchedImei !== null && <div className=\"neir-profile-search-outcome\""),
  'Search results must not render before the user submits an IMEI');
assert(!profile.includes('Your device information will appear here'),
  'Old always-visible empty state must stay removed');
assert(!profile.includes('stolenTarget') && !profile.includes('Mark as Stolen'),
  'Remove obsolete stolen flow completely without replacing device status');
assert(profile.includes("onClick={() => startProfileRegistration('')}"),
  'Profile must offer the existing Special Registration wizard, respecting the 20-slot limit');
assert(profile.includes("disabled={reachedLimit}"),'Quota-aware profile action remains guarded');
assert((profile.match(/neir-profile-detail-grid/g)||[]).length === 2,
  'IMEI and Special Registration dialogs must use the same details layout');
assert(style.includes('.neir-profile-search-input input.neir-ui-control:focus-visible'),
  'Inner IMEI input must not draw a second focus border');
assert(wizardStyle.includes('.neir-v7-reason-card.is-selected') &&
       wizardStyle.includes('box-shadow:none'),
  'Selected acquisition reason must use one selection border');
const sets = wizard.split('const documentSets:')[1].split('const maxFileSize')[0];
const section = (start,end) => sets.split(start)[1].split(end)[0];
const tour = section("'foreign-tour': [",'  gift: [');
const gift = section('  gift: [','  airmail: [');
const airmail = section('  airmail: [','];');
const ids = text => [...text.matchAll(/id: '([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(ids(tour),['passportInfo','arrivalSeal'],
  'Foreign Tour must request only passport information and arrival-seal documents');
assert.deepEqual(ids(gift),['donorPassport','donorArrivalSeal'],
  'Gift must request only donor passport information and arrival-seal documents');
assert.deepEqual(ids(airmail),['courierBill','packingList','commercialInvoice'],
  'Air Mail document checklist is approved and must not change');
assert(edge.includes("['donorPassport','donorArrivalSeal'].some(type=>!selected.includes(type))"),
  'Edge function must accept the two-document Gift submission');
assert(edge.includes("['passportInfo','arrivalSeal'].some(type=>!selected.includes(type))"),
  'Edge function must accept the two-document Foreign Tour submission');
assert(edge.includes("gift:['donorPassport','donorArrivalSeal','imeiBox','giftDeed']"),
  'Do not invalidate historic submissions with four legacy Gift document types');
console.log('PASS: NEIR Citizen profile UI, dialogs, borders and acquisition-specific document rules');
