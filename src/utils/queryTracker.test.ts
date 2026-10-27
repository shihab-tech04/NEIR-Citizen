/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTicketId, findTicket, INITIAL_SAMPLE_QUERIES } from './queryTracker.ts';

test('generateTicketId generates valid ticket format', () => {
  const id = generateTicketId();
  assert.match(id, /^BTRC-NEIR-2026-\d{4}$/);
});

test('findTicket successfully retrieves existing sample ticket', () => {
  const ticket = findTicket('BTRC-NEIR-2026-1042', '01711223344', INITIAL_SAMPLE_QUERIES);
  assert.ok(ticket);
  assert.equal(ticket?.ticketId, 'BTRC-NEIR-2026-1042');
  assert.equal(ticket?.status, 'in_review');
});

test('findTicket returns undefined for non-existing ticket', () => {
  const ticket = findTicket('BTRC-NEIR-9999-9999', '01900000000', INITIAL_SAMPLE_QUERIES);
  assert.equal(ticket, undefined);
});
