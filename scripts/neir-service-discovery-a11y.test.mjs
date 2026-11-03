import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base=process.env.NEIR_BASE_URL||'http://127.0.0.1:4567';
const app=readFileSync('src/App.tsx','utf8');
const hero=readFileSync('src/components/HomeHero.tsx','utf8');
const section=readFileSync('src/components/HomeServiceEntry.tsx','utf8');

assert(app.includes('<HomeServiceEntry') && app.includes('onSpecialRegistration={requestSpecialRegistration}'),
  'New service navigation must reuse the canonical Special Registration journey');
assert(app.includes('href="#neir-main-content"') && app.includes('mainRef.current?.focus'),
  'Skip link and focus-managed SPA routes are both required');
assert(app.includes("prefers-reduced-motion: reduce") && app.includes('scrollToTop()'),
  'Routing must respect reduced-motion preferences');
assert(app.includes('const preferredScrollBehavior =') &&
  (app.match(/scrollIntoView\(\{ behavior: preferredScrollBehavior\(\) \}\)/g)||[]).length===2 &&
  !app.includes("scrollIntoView({ behavior: 'smooth' })"),
  'All service-return shortcuts must respect reduced-motion preferences');
assert(!section.includes('neir-imei-input') && !section.includes('setImei') &&
  !section.includes('neir-source-verify-button'),
  'Service entry may not implement or modify the IMEI checker');
const start=hero.indexOf('  const [imei,setImei]');
const end=hero.indexOf('      <div className="neir-source-hero-media">');
assert(start>=0 && end>start,'IMEI checker source segment missing');
let hash=2166136261;
for(const ch of hero.slice(start,end)) hash=Math.imul(hash ^ ch.charCodeAt(0),16777619)>>>0;
assert.equal(hash.toString(16),'ac03b7be','IMEI checker must remain byte-for-byte unchanged');
mkdirSync('acceptance-shots',{recursive:true});
const browser=await chromium.launch({headless:true});

try{
  for(const width of [320,390,768,1024,1440,1918]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.goto(base+'/',{waitUntil:'networkidle'});
    const service=page.getByRole('region',{name:'What would you like to do?'});
    await service.waitFor({state:'visible'});
    const cards=service.locator('article.neir-service-card');
    assert.equal(await cards.count(),2,'Exactly two distinct service options at '+width);
    const titles=await cards.locator('h3').allTextContents();
    assert.deepEqual(titles,['Create a citizen account','Special Registration for a handset']);
    const geometry=await cards.evaluateAll(els=>els.map(el=>({
      left:el.getBoundingClientRect().left,
      top:el.getBoundingClientRect().top,
      width:el.getBoundingClientRect().width,
    })));
    if(width<=767) assert(geometry[1].top>geometry[0].top+10,'Mobile service cards should stack');
    else assert(Math.abs(geometry[0].top-geometry[1].top)<=2,'Desktop service cards should align');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=4,
      'Home page horizontally overflows at '+width);
    const imei=page.locator('#neir-imei-input');
    assert(await imei.isVisible(),'Original IMEI field must remain unchanged');
    assert.equal(await imei.getAttribute('maxLength'),'14','IMEI contract changed');

    await service.getByRole('button',{name:'Create account'}).click();
    const registration=page.getByRole('dialog',{name:'User Registration'});
    await registration.waitFor({state:'visible'});
    assert(await registration.locator('#reg-mobile').isVisible(),
      'Direct account entry must show the original Figma form');
    await registration.getByRole('button',{name:'Close'}).click();

    await service.getByRole('button',{name:'Apply for Special Registration'}).click();
    const info=page.getByRole('dialog',{name:'About Special Registration'});
    await info.waitFor({state:'visible'});
    assert(await info.getByText('What is Special Registration?').isVisible(),
      'Existing Special Registration intro must not be bypassed');
    await info.getByRole('button',{name:'Close dialog'}).click();

    await service.getByRole('button',{name:'User Guides'}).click();
    await page.getByRole('heading',{name:'User Guide of NEIR'}).waitFor();
    assert.equal(new URL(page.url()).pathname,'/user-guides','Service guides must navigate');
    assert(await page.evaluate(()=>document.activeElement?.id==='neir-main-content'),
      'Route change must move focus to main content');
    if(width<=1000){
      await page.getByRole('button',{name:'Navigation menu'}).click();
      await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Home'}).click();
    }else{
      await page.getByRole('navigation',{name:'NEIR portal navigation'})
        .getByRole('button',{name:'Home'}).click();
    }
    await service.waitFor({state:'visible'});
    await page.screenshot({path:`acceptance-shots/neir-service-choice-${width}.png`,fullPage:width===390,animations:'disabled'});
    if(width===390||width===1440){
      const language=width===390?'.neir-source-mobile-language select':'.neir-language-select select';
      await page.locator(language).selectOption('bn');
      await page.getByRole('heading',{name:'কোন সেবাটি প্রয়োজন?'}).waitFor();
      assert(await page.getByRole('region',{name:'কোন সেবাটি প্রয়োজন?'})
        .getByRole('button',{name:'বিশেষ নিবন্ধনের আবেদন'}).isVisible(),
        'Bengali special-registration entry missing');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=4,
        'Bengali labels cause overflow at '+width);
    }
    await page.close();
    console.log('PASS: two service choices, register, Special Registration, guide focus and no IMEI change at '+width+'px');
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.keyboard.press('Tab');
  const first=await page.evaluate(()=>({
    focused:document.activeElement?.className,
    name:document.activeElement?.textContent?.trim(),
    visible:document.activeElement?.getBoundingClientRect().top,
  }));
  assert(String(first.focused).includes('neir-skip-link'),'First Tab must reach Skip to main content');
  assert(first.visible>=0,'Skip link must be visible when focused');
  await page.keyboard.press('Enter');
  assert(await page.evaluate(()=>document.activeElement?.id==='neir-main-content'),
    'Skip link must focus the main landmark');
  await page.close();
  console.log('PASS: keyboard skip link and main-landmark focus');
}finally{await browser.close();}
