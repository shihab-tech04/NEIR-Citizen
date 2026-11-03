import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=path=>readFileSync(path,'utf8');
const app=load('src/App.tsx');
const ui=load('src/ui/NeirUI.tsx');
const css=load('src/ui/neir-ui.css');
const index=load('src/index.css');
const shell=load('src/components/NeirModalFrame.tsx');
const login=load('src/components/LoginModal.tsx');
const wizard=load('src/components/ProfileSpecialRegistrationModal.tsx');
const profile=load('src/components/CitizenImeiListView.tsx');
const guide=load('src/components/UserGuidesView.tsx');
const contact=load('src/components/ContactUsView.tsx');
const header=load('src/components/Header.tsx');
const home=load('src/components/HomeHero.tsx');
const faq=load('src/components/FaqSection.tsx');
const translation=load('src/components/faqTranslations.bn.ts');

for(const path of ['src/components/NeirModalFrame.tsx',
  'src/components/LoginModal.tsx','src/components/ProfileSpecialRegistrationModal.tsx']){
  assert(load(path).includes('neir-modal-surface'),
    'Active dialog must use canonical visual shell: '+path);
}
assert(shell.includes('neir-modal-backdrop')&&login.includes('neir-modal-backdrop')&&
  wizard.includes('neir-modal-backdrop'),'All active dialog backdrops must share one class');
assert(css.includes('.neir-modal-surface :is(.neir-shared-close')&&
  css.includes('width:44px;height:44px'),'Dialog close targets must be at least 44px');
assert(!index.includes('.neir-shared-dialog{\\n  box-sizing:border-box;width:min(600px,100%)'),
  'Legacy CSS must not repeat the canonical shared dialog shell');
assert(ui.includes("export type UiButtonVariant = 'primary' | 'link'"),
  'Only Primary and Link action variants are supported');
assert(css.includes('.neir-ui-button--primary:hover:not(:disabled)')&&
  css.includes('.neir-ui-button--link:hover:not(:disabled)'),
  'Primary and Link require correct hover states');
assert(css.includes('.neir-ui-button--compact{min-height:44px'),
  'Compact action targets must stay accessible');
assert(css.includes('.neir-ui-choice-tab[aria-pressed=true]')&&
  css.includes('box-shadow:none'),
  'Selected cards must not stack inset borders');

function luminance(hex){
  const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const linear=channels.map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*linear[0]+0.7152*linear[1]+0.0722*linear[2];
}
const contrast=(a,b)=>{
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
};
assert(contrast('#00838f','#ffffff')>=4.5,'Primary white text must meet WCAG AA normal contrast');
assert(contrast('#006e7a','#ffffff')>=4.5,'Primary hover white text must meet contrast');
assert(css.includes('--neir-ui-action-bg:var(--neir-primary-900,#00838f)'),
  'Approved dark teal must be the common action background');
assert(css.includes('.neir-faq-tab[aria-selected="true"]')&&
  css.includes('background:var(--neir-ui-action-bg)'),
  'Selected categories use contrast-safe semantic action surface');

for(const label of ['searchLabel?: string','countLabel?:','sortLabel?:','mobileAriaLabel?:']){
  assert(ui.includes(label),'Shared table localization missing '+label);
}
for(const label of ['applicationStatusLabel','applicationReasonLabel','countLabel={count =>',
  'mobileAriaLabel={isBn']){
  assert(profile.includes(label),'Mobile/desktop history translation missing '+label);
}
for(const [source,tag] of [[guide,'bnRegistration'],[guide,'bnPasswordReset'],
  [contact,'সব আবশ্যিক ঘর'],[header,'আমার প্রোফাইল'],[home,'IMEI নম্বরের প্রথম ১৪টি সংখ্যা']]){
  assert(source.includes(tag),'Bengali UI parity missing '+tag);
}
const localeJson=translation.match(/faqTranslationsBn:[^=]+?= ([\\s\\S]*?);\\nexport const faqTitlesBn:/);
assert(localeJson,'Bengali FAQ dictionary must be exported as a stable object');
const translated=JSON.parse(localeJson[1]);
const englishQuestions=[
  ...[...faq.matchAll(/\\bq:\\s*'([^']+)'/g)].map(m=>m[1]),
  ...[...faq.matchAll(/"q":\\s*"([^"]+)"/g)].map(m=>m[1]),
];
assert.equal(new Set(englishQuestions).size,28,'FAQ source question inventory changed; re-audit translations');
assert.deepEqual(englishQuestions.filter(q=>!translated[q]),[],
  'Every existing FAQ must retain EN and a complete BN question/answer pair');
assert(faq.includes('faqTranslationsBn[item.q]') && faq.includes('faqTitlesBn[source]'),
  'FAQ language selection must apply to questions, answers and category labels');
for(const excluded of ['CitizenDashboardModal','FigmaSpecialRegistrationModal','ImeiChecker']){
  assert(!app.includes(excluded),'Orphan legacy component entered active route: '+excluded);
}
assert(app.includes('ProposedDesignView'),
  'Preserve separate, existing proposed-design reference route');
for(const name of ['dashboard','guides','contact','faq','proposed','home']){
  assert(app.includes(name+':'), 'Previously solved route missing: '+name);
}
console.log('PASS: canonical modal shells, two action styles, accessible teal contrast,');
console.log('      localized active table and EN/BN journeys, preserved routes and legacy isolation.');
