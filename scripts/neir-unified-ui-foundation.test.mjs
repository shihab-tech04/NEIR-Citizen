import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = path => readFileSync(path, 'utf8');

const hook = src('src/ui/useNeirDialogFocus.ts');
for (const required of ["event.key === 'Escape'", "event.key !== 'Tab'",
  "previouslyFocused?.focus()", "document.body.style.overflow = 'hidden'",
  "onEscape", "getClientRects"]) assert(hook.includes(required),'Canonical modal behavior missing: '+required);

for (const path of ['src/components/NeirModalFrame.tsx','src/components/LoginModal.tsx',
  'src/components/ProfileSpecialRegistrationModal.tsx']) {
  const file=src(path);
  assert(file.includes('useNeirDialogFocus'),'Active modal bypasses canonical hook: '+path);
  assert(!file.includes("document.addEventListener('keydown'"),
    'Duplicate modal focus trap in '+path);
}
const ui = src('src/ui/NeirUI.tsx');
const css = src('src/ui/neir-ui.css');
const header = src('src/components/Header.tsx');
const login = src('src/components/LoginModal.tsx');
const wizard = src('src/components/ProfileSpecialRegistrationModal.tsx');
const profile = src('src/components/CitizenImeiListView.tsx');
const guide = src('src/components/UserGuidesView.tsx');
const faq = src('src/components/FaqSection.tsx');

assert(ui.includes("export type UiButtonVariant = 'primary' | 'link'"),
  'Primary and Link are the only action variants');
assert(ui.includes("variant = 'link'"), 'Safe default action type is Link');
for (const obsolete of ['--secondary','--quiet','--danger'])
  assert(!css.includes('.neir-ui-button'+obsolete),
    'Obsolete visual button variant remains: '+obsolete);
for (const current of ['.neir-ui-button--primary:hover:not(:disabled)',
  '.neir-ui-button--link:hover:not(:disabled)'])
  assert(css.includes(current),'Missing approved interactive state: '+current);
assert(!profile.includes('variant="secondary"') && !wizard.includes('variant="quiet"'),
  'Active workflows must not use former variants');

assert((header.match(/<UiSelect /g)||[]).length===3,
  'Desktop, mobile-top, and expanded mobile language dropdowns share one input');
assert(!header.includes('<select '),'Header uses native dropdown instead of shared UiSelect');
assert((login.match(/<UiInput /g)||[]).length===8 &&
  (login.match(/<UiButton /g)||[]).length===3,
  'Login, sign-up and forgot forms use shared controls');
assert((css.match(/--neir-type-(caption|body|subtitle|heading):/g)||[]).length>=4,
  'Responsive typography tokens must be declared once');
for (const key of ['--neir-ui-success-bg','--neir-ui-warning-bg',
  '--neir-ui-error-bg','--neir-ui-info-bg'])
  assert(css.includes(key),'Missing semantic status token: '+key);
assert(guide.includes('neir-ui-choice-tab') && !guide.includes('border-[8px]'),
  'User Guide selection borders use shared selectable-card pattern');
assert(faq.includes('className="neir-faq-tab"') &&
  css.includes('.neir-faq-tab[aria-selected="true"]'),
  'FAQ tab active state uses a single semantic palette');
assert(css.includes('max-width:700px') && css.includes('max-width:420px'),
  'Small-screen responsive type and control adaptations exist');
console.log('PASS: active modal foundation, two action variants, shared forms/dropdowns,');
console.log('      responsive typography, status palette, guide and FAQ controls.');
