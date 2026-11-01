import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const read = path => readFileSync(resolve(process.cwd(), path), 'utf8');
const requireText = (file, phrases) => {
  const content = read(file);
  for (const phrase of phrases) assert(content.includes(phrase), file + ' must contain: ' + phrase);
  return content;
};
const components = readdirSync(resolve(process.cwd(), 'src/components')).filter(path => path.endsWith('.tsx'));
const cssFiles = readdirSync(resolve(process.cwd(), 'src/components')).filter(path => path.endsWith('.css'));
const sourceInventory = { components: components.length, nativeButtons: 0, nativeInputs: 0, nativeTables: 0 };
for (const filename of components) {
  const source = read('src/components/' + filename);
  sourceInventory.nativeButtons += (source.match(/<button\b/g) || []).length;
  sourceInventory.nativeInputs += (source.match(/<input\b/g) || []).length;
  sourceInventory.nativeTables += (source.match(/<table\b/g) || []).length;
}
const tokens = requireText('src/ui/neir-ui.css', [
  '--neir-ui-primary:', '--neir-ui-focus:', '--neir-ui-control-height:',
  '--neir-ui-button-height:', '--neir-ui-dialog-radius:', '.neir-ui-table',
  '.neir-ui-button--primary', '.neir-ui-button--danger',
  '.neir-ui-control[aria-invalid=true]', '@media(max-width:700px)',
  '@media(prefers-reduced-motion:reduce)',
]);
assert(!tokens.includes('linear-gradient('), 'UI library must not introduce gradients');
const library = requireText('src/ui/NeirUI.tsx', [
  'export const UiButton', 'export const UiInput', 'export const UiSelect',
  'export const UiTextarea', 'export function UiField',
  'export const UiStatusBadge', 'export function UiDataTable', 'export const UiDialog',
  'useId()', "event.key === 'Enter'", "event.key === ' '",
]);
requireText('src/ui/index.ts', ['UiButton', 'UiInput', 'UiDialog', 'UiDataTable', 'UiStatusBadge']);
requireText('src/main.tsx', ["import './ui/neir-ui.css';"]);
const app = read('src/App.tsx');
assert(!app.includes('LoginModal') && !app.includes('registrationLoginSuccessOpen') &&
  !app.includes('isLoginOpen'), 'Citizen entry must have no account/login gates');
requireText('src/components/HomeHero.tsx', ['<UiInput', '<UiButton']);

const contact = requireText('src/components/ContactUsView.tsx', ['<UiInput', '<UiSelect', '<UiTextarea', '<UiButton', 'neir-ui-choice-tab']);
assert(!contact.includes('border-[8px]'), 'Contact tabs must not have oversized independent selection borders');
const profile = requireText('src/components/CitizenImeiListView.tsx', [
  '<UiInput', '<UiDataTable', '<UiStatusBadge', '<UiDialog', 'onRowClick={setApplicationDetail}',
]);
assert(!profile.includes('<table className="neir-special-table">'), 'Active application table must use UiDataTable');
const wizard = requireText('src/components/ProfileSpecialRegistrationModal.tsx', [
  '<UiInput', '<UiButton', 'const showDetails = canContinue',
  'Download sample', 'Select how you purchased or received the device',
]);
assert(!wizard.includes('setStage('), 'Special Registration must not regain a Continue dependency');
requireText('src/components/NeirModalFrame.tsx', ['aria-modal="true"', "event.key === 'Escape'", 'previousFocus?.focus()']);
assert(sourceInventory.nativeTables >= 2, 'Historical printable sample tables must remain');
console.log('PASS: NEIR unified UI tokens, canonical primitives, active adoption, focus and responsive gates');
console.log(JSON.stringify({ ...sourceInventory, styleFiles: cssFiles.length + 1, sharedControls: library.match(/export (?:const|function) Ui/g)?.length || 0 }, null, 2));
