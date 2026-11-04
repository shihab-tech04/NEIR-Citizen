import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base=process.env.NEIR_BASE_URL||'http://127.0.0.1:4567';
const app=readFileSync('src/App.tsx','utf8');
const hero=readFileSync('src/components/HomeHero.tsx','utf8');
const section=readFileSync('src/components/HomeServiceEntry.tsx','utf8');
const guide=readFileSync('src/components/ThreeStepGuide.tsx','utf8');
const faq=readFileSync('src/components/FaqSection.tsx','utf8');
const serviceStyle=readFileSync('src/components/HomeServiceEntry.css','utf8');
assert(!guide.includes('3 Steps &amp;') && guide.includes('stepsBn') && guide.includes('neir-guide/step-') && !guide.includes('style={{backgroundColor'),
  'Both three-step guides need meaningful headings, bilingual instructions and CSS backgrounds');
assert(!serviceStyle.includes('margin:-28px') && !serviceStyle.includes('margin:-18px'),
  'Service card must not overlap the approved hero');
assert(faq.includes('onCategoryKeyDown') && faq.includes('role="tabpanel"') &&
  faq.includes("source === 'Registration'"),
  'FAQ must have accessible keyboard tabs and distinct Special Registration wording');

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
// Validate the editable SVG assets rather than accepting rasterized look-alikes.
for(let i=1;i<=6;i++){
  const svg=readFileSync(`public/neir-guide/step-${i}.svg`,'utf8');
  const original=readFileSync(`public/neir-source/images/step-${i}.svg`,'utf8');
  const svgViewBox=svg.match(/viewBox="([^"]+)"/)?.[1];
  const originalViewBox=original.match(/viewBox="([^"]+)"/)?.[1];
  const originalPaths=original.match(/<path\\b[^>]*\\/>/g)||[];
  const preserved=originalPaths.filter(element=>svg.includes(element));
  assert(svg.includes('<svg') && svg.includes('<title') && svg.includes('<desc') &&
    svg.includes('#00838F') && svgViewBox===originalViewBox &&
    originalPaths.length>=8 && preserved.length/originalPaths.length>=0.60,
    'Guide illustration '+i+' must retain original phone/hand paths and teal vector composition');
  assert(!/IMEI Verified|\+1\(600\)|<image\b|<foreignObject\b/i.test(svg),
    'Guide illustration '+i+' contains misleading legacy text or embedded raster assets');
  if(i===3)assert(svg.includes('IMEI RESULT') && svg.includes('Check SMS reply'),
    'IMEI result illustration must not guarantee verification');
  if(i===5)assert(svg.includes('LAST 4 DIGITS') && svg.includes('SUBMIT'),
    'Original NID phone must display a readable four-digit prompt');
  if(i===6)assert(svg.includes('01XX XXX XXXX') && svg.includes('SAMPLE'),
    'Original NID SMS bubble must contain safe masked Bangladesh-format numbers');
  for(const tag of svg.match(/<text\b[^>]*>/g) || []){
    for(const attr of ['font-family','font-weight']){
      assert((tag.match(new RegExp(attr+'=', 'g')) || []).length<=1,
        'Duplicate '+attr+' attribute in guide SVG '+i);
    }
  }
}
assert(guide.includes('dial *16161#') && guide.includes('dial *16001#') &&
  guide.includes('Dial *#06#') && guide.includes('16002'),
  'Guides must distinguish SMS handset legality, registration status and NID lookup');
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
    assert(await page.getByRole('heading',{name:'Check Phone Registration Status by IMEI'}).isVisible(),
      'SMS registration guide needs a meaningful heading at '+width);
    assert(await page.getByRole('heading',{name:'Check Mobile Numbers Registered Under Your NID'}).isVisible(),
      'NID guide needs a meaningful heading at '+width);
    const guideHeadings=await page.locator('.neir-source-guide-heading').evaluateAll(headings=>
      headings.map(el=>{
        const label=el.querySelector('p');
        const title=el.querySelector('h2');
        const a=getComputedStyle(label),b=getComputedStyle(title);
        const labelBox=label.getBoundingClientRect(),titleBox=title.getBoundingClientRect();
        return {
          labelSize:parseFloat(a.fontSize),titleSize:parseFloat(b.fontSize),
          labelColor:a.color,titleColor:b.color,
          labelWeight:Number(a.fontWeight),titleWeight:Number(b.fontWeight),
          labelFamily:a.fontFamily,titleFamily:b.fontFamily,
          labelsStacked:labelBox.bottom<=titleBox.top+1,
        };
      })
    );
    assert.equal(guideHeadings.length,2,'Both homepage guide headings required');
    for(const [index,heading] of guideHeadings.entries()){
      assert(heading.titleSize-heading.labelSize>=3.5 && heading.titleSize-heading.labelSize<=4.5,
        'Guide '+index+' needs a consistent 4px primary-title hierarchy at '+width+'px');
      assert.equal(heading.labelColor,heading.titleColor,
        'Guide '+index+' uses competing text colors at '+width+'px');
      assert(heading.titleWeight===600 && heading.labelWeight===400,
        'Guide '+index+' needs primary title 600 and supporting line 400 at '+width+'px');
      assert(heading.labelFamily.includes('Poppins') && heading.titleFamily.includes('Poppins'),
        'Guide '+index+' must retain Poppins at '+width+'px');
      assert(heading.labelsStacked,'Guide '+index+' heading lines overlap at '+width+'px');
    }
    const faqMetrics=await page.locator('#faq-section .neir-faq-intro').evaluate(el=>{
      const title=el.querySelector('h2'),subtitle=el.querySelector('p'),tabs=document.querySelector('#faq-section .neir-faq-tabs');
      const a=getComputedStyle(title),b=getComputedStyle(subtitle);
      return {
        titleSize:parseFloat(a.fontSize),subtitleSize:parseFloat(b.fontSize),
        titleWeight:Number(a.fontWeight),subtitleWeight:Number(b.fontWeight),
        titleColor:a.color,subtitleColor:b.color,
        titleFamily:a.fontFamily,subtitleFamily:b.fontFamily,
        subtitleStartsBelowTitle:subtitle.getBoundingClientRect().top>=title.getBoundingClientRect().bottom-1,
        tabsStartAfterSubtitle:tabs.getBoundingClientRect().top>=subtitle.getBoundingClientRect().bottom,
        headingToTabs:tabs.getBoundingClientRect().top-subtitle.getBoundingClientRect().bottom,
      };
    });
    assert(faqMetrics.titleSize-faqMetrics.subtitleSize>=3.5 &&
      faqMetrics.titleSize-faqMetrics.subtitleSize<=4.5,
      'FAQ must match the 4px type hierarchy at '+width+'px');
    assert(faqMetrics.titleWeight===600 && faqMetrics.subtitleWeight===400 &&
      faqMetrics.titleColor===faqMetrics.subtitleColor &&
      faqMetrics.titleColor===guideHeadings[0].titleColor,
      'FAQ needs the same dark ink and title/subtitle weights as guides at '+width+'px');
    assert(faqMetrics.titleFamily.includes('Poppins') && faqMetrics.subtitleFamily.includes('Poppins'),
      'FAQ must keep Poppins at '+width+'px');
    assert(faqMetrics.subtitleStartsBelowTitle && faqMetrics.tabsStartAfterSubtitle &&
      faqMetrics.headingToTabs<=44,
      'FAQ title/subtitle/tabs spacing or alignment regressed at '+width+'px');
    // One content grid across the guide and FAQ, independent of viewport.
    const alignment=await page.evaluate(()=>{
      const guide=document.querySelector('.neir-source-guide-heading');
      const card=document.querySelector('.neir-source-step-card');
      const faq=document.querySelector('#faq-section');
      const intro=faq.querySelector('.neir-faq-intro');
      const tabs=faq.querySelector('.neir-faq-tabs');
      const faqCard=faq.querySelector('.neir-faq-group');
      const rect=el=>el.getBoundingClientRect();
      return {
        lefts:[rect(guide).left,rect(card).left,rect(intro).left,
          rect(tabs).left,rect(faqCard).left],
        faqTopInset:rect(intro).top-rect(faq).top,
        guideCardGap:rect(card).top-rect(guide).bottom,
        guideWidth:rect(document.querySelector('.neir-source-guide-section')).width,
        faqWidth:rect(faq).width,
        viewport:document.documentElement.clientWidth,
      };
    });
    assert(alignment.lefts.every(x=>Math.abs(x-alignment.lefts[0])<=2),
      'Guide / FAQ headings, tabs and cards need a shared left edge at '+width+'px: '+JSON.stringify(alignment));
    assert(alignment.faqTopInset>=20 && alignment.faqTopInset<=36,
      'FAQ top padding should remain compact at '+width+'px');
    assert(alignment.guideCardGap>=22 && alignment.guideCardGap<=26,
      'Guide heading-to-cards gap should remain 24px at '+width+'px');
    assert(alignment.guideWidth<=alignment.viewport+2 && alignment.faqWidth<=alignment.viewport+2,
      'Guide and FAQ sections must not horizontally overflow at '+width+'px');
    const cardsCopy=await page.locator('.neir-source-step-card').evaluateAll(cards=>
      cards.map(el=>({
        title:el.querySelector('h3')?.textContent?.trim(),
        body:el.querySelector('.neir-source-step-content p')?.textContent?.trim(),
        art:el.querySelector('img')?.getAttribute('src'),
        alt:el.querySelector('img')?.alt,
      }))
    );
    assert.equal(cardsCopy.length,6,'Both guides require exactly six illustrated steps');
    assert(cardsCopy.every((x,index)=>x.title.startsWith('Step '+(index%3+1)+': ') &&
      x.art.endsWith('neir-guide/step-'+(index+1)+'.svg') && x.alt.length>=25),
      'Steps must provide action headings and meaningful editable SVG illustrations at '+width);
    if(width===390||width===1440){
      const art=page.locator('.neir-source-step-card img');
      for(const img of await art.all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>await el.decode());
        assert(await img.evaluate(el=>el.naturalWidth>0 && el.naturalHeight>0),
          'SVG illustration failed to decode at '+width);
      }
    }
    const faqTab=page.getByRole('tablist',{name:'FAQ categories'});
    assert(await faqTab.getByRole('tab',{name:'Special Registration'}).isVisible(),
      'Special Registration FAQ tab must be unambiguous');
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
      assert(await page.getByRole('heading',{name:'IMEI দিয়ে ফোনের নিবন্ধন অবস্থা জানুন'}).isVisible(),
        'IMEI SMS guide must be localized');
      assert(await page.getByRole('heading',{name:'আপনার NID-এ নিবন্ধিত মোবাইল নম্বর জানুন'}).isVisible(),
        'NID guide must be localized');
      assert(await page.getByRole('heading',{name:/ধাপ ১: IMEI নম্বর দেখুন/}).isVisible(),
        'Bengali action heading and illustration instructions must be localized');
      assert(await page.getByRole('tab',{name:'বিশেষ নিবন্ধন'}).isVisible(),
        'Special Registration FAQ must be localized');
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
  const faqPage=await browser.newPage({viewport:{width:1440,height:900}});
  await faqPage.goto(base+'/',{waitUntil:'networkidle'});
  const faqTabs=faqPage.getByRole('tablist',{name:'FAQ categories'});
  await faqTabs.getByRole('tab',{name:'IMEI Check'}).focus();
  await faqPage.keyboard.press('ArrowRight');
  assert.equal(await faqTabs.getByRole('tab',{name:'Special Registration'}).getAttribute('aria-selected'),'true',
    'ArrowRight must select the next FAQ tab');
  assert(await faqPage.getByRole('tabpanel').getByRole('heading',{name:'Understanding Special Registration'}).isVisible(),
    'Active FAQ tab must expose the corresponding panel');
  await faqPage.keyboard.press('End');
  assert.equal(await faqTabs.getByRole('tab',{name:'About NEIR'}).getAttribute('aria-selected'),'true',
    'End must select the last FAQ tab');
  await faqPage.keyboard.press('Home');
  assert.equal(await faqTabs.getByRole('tab',{name:'IMEI Check'}).getAttribute('aria-selected'),'true',
    'Home must select the first FAQ tab');
  await faqPage.close();
  console.log('PASS: FAQ keyboard tabs, active panel and localization');
}finally{await browser.close();}
