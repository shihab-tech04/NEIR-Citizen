import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('supabase/functions/neir-prototype-special/index.ts', 'utf8');
// Extract the validation regex actually used by the deployed Deno handler, rather than
// testing a separate implementation that could pass while the endpoint stays broken.
function handlerPattern(field) {
  const line = source.split('\n').find(value => value.includes(`.test(${field})`));
  assert(line, `Missing ${field} validator`);
  const start = line.indexOf('/^');
  const end = line.indexOf('$/', start);
  assert(start >= 0 && end > start, `Unexpected ${field} validation expression`);
  return new RegExp(line.slice(start + 1, end + 1));
}
const mobile = handlerPattern('mobile');
const arrival = handlerPattern('arrivalDate');
assert(mobile.test('01711223344'), 'Valid 11-digit Bangladesh mobile must reach document validation');
assert(mobile.test('01987654321'), 'Another valid Bangladesh mobile must reach document validation');
assert(!mobile.test('0171122334'), 'Mobile must contain exactly 11 digits');
assert(!mobile.test('0171122334a'), 'Mobile must be numeric');
assert(arrival.test('2026-10-09'), 'Valid ISO arrival date must reach document validation');
assert(!arrival.test('20261009'), 'Arrival date must retain YYYY-MM-DD separators');
console.log('PASS: real Special Registration handler accepts valid mobile and arrival date syntax');
