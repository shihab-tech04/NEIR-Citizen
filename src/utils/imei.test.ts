/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidImeiFormat, checkImeiStatus, SAMPLE_HANDSETS } from './imei.ts';

test('isValidImeiFormat accepts exact 15-digit numeric strings', () => {
  assert.equal(isValidImeiFormat('352093081234567'), true);
  assert.equal(isValidImeiFormat('35209308123456'), false); // 14 digits
  assert.equal(isValidImeiFormat('3520930812345678'), false); // 16 digits
  assert.equal(isValidImeiFormat('35209308123456A'), false); // alpha
  assert.equal(isValidImeiFormat('3520-9308-1234567'), true); // handles formatted with dash
});

test('checkImeiStatus returns registered handset record for valid known IMEI', () => {
  const result = checkImeiStatus('352093081234567');
  assert.equal(result.success, true);
  assert.equal(result.data?.brand, 'Samsung');
  assert.equal(result.data?.registrationStatus, 'valid');
});

test('checkImeiStatus handles invalid formatting properly', () => {
  const result = checkImeiStatus('12345');
  assert.equal(result.success, false);
  assert.match(result.message || '', /15/);
});

test('checkImeiStatus flags blacklisted handset correctly', () => {
  const result = checkImeiStatus('869999008888777');
  assert.equal(result.success, true);
  assert.equal(result.data?.registrationStatus, 'blacklisted');
});
