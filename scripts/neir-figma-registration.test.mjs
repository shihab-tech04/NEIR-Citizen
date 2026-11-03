import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get = path => readFileSync(path,'utf8');
const body = get('src/components/CitizenRegistrationForm.tsx');
const css = get('src/components/CitizenRegistrationForm.css');
const login = get('src/components/LoginModal.tsx');
for(const required of [
  'Phone Number & Doc ID', 'OTP Verification', 'Create password',
  'reg-mobile','reg-document','reg-otp','reg-pass','reg-pass-confirm',
  'Request for OTP', 'Verify and Proceed', 'Create account',
  'Re-send OTP','At least one lowercase letter','At least one uppercase letter',
  'At least one number','At least one special character','Minimum 8 characters',
  'getRandomValues','secondsRemaining','onStepChange(2)','onStepChange(3)',
  'Demonstration only: no SMS is sent',
]) assert(body.includes(required),'Missing Figma registration contract: '+required);
assert(body.includes('Array.from({length:6}') && body.includes('one-time-code'),
  'Registration OTP must have six accessible one-time-code boxes');
assert(!body.includes('Full Name') && !body.includes('fullName'),
  'Figma registration must not invent an extra name field');
assert(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)') &&
  css.includes('@media(max-width:767px)'),
  'Desktop registration uses Figma two-column layout and stacks on mobile');
assert(css.includes('width:min(956px,calc(100vw - 32px))'),
  'Registration modal must match 956px Figma frame');
assert(login.includes("modalTitle=view==='login'?'Login':view==='register'?'User Registration'"),
  'Registration keeps Figma title without changing Login/Forgot titles');
assert(login.includes('key={view}') && login.includes('onStepChange={setRegStep}'),
  'Back/Next between steps must not unmount draft inputs');
assert(!body.includes('Prototype only. This does not verify identity or create a persistent citizen account.') &&
  !body.includes('শুধুমাত্র প্রোটোটাইপ। এটি সরকারি পরিচয় যাচাই বা প্রকৃত অ্যাকাউন্ট তৈরি করে না।'),
  'Registration footer must not show unapproved prototype disclaimer');
assert(body.includes('Demonstration only: no SMS is sent and the document is not verified.'),
  'OTP must still accurately disclose the absence of a real verification service');
assert(!login.includes('Maximize2') && !login.includes('Minimize2') &&
  !login.includes('setExpanded') && !login.includes('neir-dialog-maximized') &&
  !login.includes("aria-label={expanded?'Restore dialog':'Maximize'}"),
  'Authentication modal must have no maximize/restore control or expansion behavior');
assert(login.includes('className="neir-modal-back"') &&
  login.includes('aria-label="Close"'),
  'Preserve modal Back and Close controls after removing expand');
assert(body.indexOf('<footer className="neir-reg-footer">') < body.indexOf('className="neir-reg-existing"') &&
  body.indexOf('className="neir-reg-existing"') < body.indexOf('className="neir-reg-submit"') &&
  body.indexOf('className="neir-reg-submit"') < body.indexOf('</footer>'),
  'Login and action button must share the same registration footer');
assert(css.includes('.neir-original-dialog--registration .neir-reg-form') &&
  css.includes('justify-content:space-between'),
  'Registration footer uses compact, consistent layout without inherited form gaps');
assert(css.includes('list-style:disc outside'),
  'Figma registration instruction bullets must not be suppressed by global reset');
console.log('PASS: Figma registration footer alignment, bullet markers, compact spacing and functional controls.');
