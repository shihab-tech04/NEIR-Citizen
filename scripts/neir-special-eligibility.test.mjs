import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(file, 'utf8');
const profile = read('src/components/CitizenImeiListView.tsx');
const api = read('src/utils/neirSpecialRegistrationApi.ts');
const edge = read('supabase/functions/neir-prototype-special/index.ts');
const migration = read('supabase/migrations/20261123180300_neir_special_eligible_imei_reference.sql');
const modal = read('src/components/ProfileSpecialRegistrationModal.tsx');

// No new modal/page: the approved result and wizard own the entire journey.
assert(profile.includes('neir-profile-device-result') && profile.includes('neir-profile-status-description'));
assert(profile.includes('onClick={() => startProfileRegistration(matchedDevice.imei)}'));
assert(profile.includes('<ProfileSpecialRegistrationModal initialImei={wizard.imei}'));
assert(modal.includes('const [imei, setImei] = useState(initialImei)'));
assert(modal.includes('id="neir-v7-imei"'));

// The exact requested English copy is localised and uses the existing status styling.
assert(profile.includes("'Eligible for Special Registration'"));
assert(profile.includes('This device is eligible for Special Registration. Apply to proceed with verification.'));
assert(profile.includes('বিশেষ নিবন্ধনের জন্য যোগ্য'));
assert(profile.includes("status === 'Greylisted' || status === 'Registration Pending' || status === 'Eligible for Special Registration'"));

// Prior statuses and 14-digit reference searches must remain independent of SQL-only fixtures.
for (const status of ['Registered', 'Greylisted', 'Registration Pending', 'Blacklisted', 'Whitelisted', 'Unregistered']) {
  assert(profile.includes(status), status + ' existing status removed');
}
assert(profile.includes("if (clean.length !== 15 || referenceDevices.some(device => device.imei === clean) || SAMPLE_HANDSETS[clean]) return;"));
assert(profile.includes("if (ticket !== eligibilityRequest.current) return;"));
assert(profile.includes("!eligibilityLoading && !eligibilityError"));
assert(profile.includes('setEligibilityDevice(null)'));

// The new lookup is server-side, validated, and backed by a protected SQL table.
assert(api.includes("neirSpecialRequest<{ eligible: boolean }>('lookup_imei_eligibility', { imei })"));
assert(edge.includes("if(action==='lookup_imei_eligibility')"));
assert(edge.includes("neir_special_eligible_imeis?select=imei&imei=eq."));
assert(edge.includes("return json({eligible:rows.length===1},200,origin)"));
assert(migration.includes('ENABLE ROW LEVEL SECURITY'));
assert(migration.includes('REVOKE ALL ON TABLE public.neir_special_eligible_imeis FROM PUBLIC, anon, authenticated'));
assert(migration.includes('GRANT SELECT ON TABLE public.neir_special_eligible_imeis TO service_role'));
const fixtures = [...migration.matchAll(/'([0-9]{15})', true/g)].map(match => match[1]);
assert.equal(fixtures.length, 3);
assert.equal(new Set(fixtures).size, fixtures.length);
const luhn = imei => {
  let sum = 0;
  for (let i = 0; i < imei.length; i++) {
    let digit = Number(imei[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return sum % 10 === 0;
};
assert(fixtures.every(luhn), 'Synthetic IMEIs must have valid check digits');
// Read-only integration verification against the deployed prototype Edge Function.
const endpoint = 'https://wjsdylxbvdnraztktbtg.supabase.co/functions/v1/neir-prototype-special';
const lookup = async (imei) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://shihab-tech04.github.io' },
    body: JSON.stringify({ action: 'lookup_imei_eligibility', imei }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  return { response, data };
};
for (const imei of fixtures) {
  const { response, data } = await lookup(imei);
  assert.equal(response.status, 200, 'Synthetic eligible IMEI lookup must succeed');
  assert.equal(data.eligible, true, 'Supabase must match the synthetic eligible IMEI ' + imei);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://shihab-tech04.github.io', 'Live Pages CORS must be allowed');
}
for (const imei of ['990001234567923', '352093081234567', '869999008888777']) {
  const { response, data } = await lookup(imei);
  assert.equal(response.status, 200, 'Known and unknown noneligible IMEIs must not generate an API error');
  assert.equal(data.eligible, false, 'Noneligible IMEI must never be promoted to eligible: ' + imei);
}
const invalid = await lookup('123');
assert.equal(invalid.response.status, 400, 'Invalid IMEI must be rejected by the server');
console.log('PASS: live Supabase eligibility, noneligible statuses, invalid IMEI, CORS, and existing modal contract');

