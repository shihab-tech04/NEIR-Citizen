import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const root='http://127.0.0.1:4567/';
const browser=await chromium.launch({headless:true});
const source=readFileSync('src/components/HomeHero.tsx','utf8');
const start=source.indexOf('  const [imei,setImei]');
const end=source.indexOf('      <div className="neir-source-hero-media">');
assert(start>=0 && end>start,'IMEI checker section must remain present');
let hash=2166136261;
for(const ch of source.slice(start,end)) hash=Math.imul(hash ^ ch.charCodeAt(0),16777619)>>>0;
assert.equal(hash.toString(16),'ac03b7be','Locked IMEI checker field/validation/UI must be byte-identical to baseline');

const parseRgb=s=>{
  const v=s.match(/[\d.]+/g)?.map(Number)||[];
  assert(v.length>=3,'Expected CSS RGB color: '+s);
  return v;
};
const blend=(fg,bg)=>fg[3]===undefined||fg[3]===1?fg.slice(0,3):
  fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
const luminance=rgb=>{
  const c=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
};
const contrast=(a,b)=>{
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};

try{
  for(const width of [320,360,390,768,1024,1440,1918]){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.goto(root,{waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    const initial=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      title:document.title,
      meta:document.querySelector('meta[name="description"]')?.getAttribute('content'),
    }));
    assert(initial.overflow<=4,'Header overflow at '+width);
    assert(!/prototype/i.test(initial.title+' '+initial.meta),'Outdated prototype metadata remains');
    if(width<=1000){
      const menu=page.getByRole('button',{name:'Navigation menu'});
      await menu.waitFor({state:'visible'});
      const bounds=await menu.boundingBox();
      assert(bounds && bounds.width>=44 && bounds.height>=44,
        'Mobile navigation touch target under 44x44 at '+width);
      if(width<=767){
        const login=page.locator('.neir-source-mobile-login');
        const size=await login.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
        assert(size>=14,'Mobile Login text below 14px at '+width);
      }
      await menu.click();
      const nav=page.getByRole('navigation',{name:'Mobile navigation'});
      await nav.waitFor({state:'visible'});
      const register=nav.getByRole('button',{name:'Create Account',exact:true});
      await register.waitFor({state:'visible'});
      await register.click();
      const dialog=page.getByRole('dialog',{name:'User Registration'});
      await dialog.waitFor({state:'visible'});
      assert.equal(await menu.getAttribute('aria-expanded'),'false','Menu should close after Register');
      await dialog.getByRole('button',{name:'Close'}).click();
      await page.locator('.neir-mobile-toggle').click();
      await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'User Guides'}).click();
      await page.getByRole('heading',{name:'User Guide of NEIR'}).waitFor();
      await page.goto(root,{waitUntil:'networkidle'});
    }else{
      await page.getByRole('button',{name:'Create Account',exact:true}).click();
      await page.getByRole('dialog',{name:'User Registration'}).waitFor({state:'visible'});
      await page.getByRole('dialog',{name:'User Registration'}).getByRole('button',{name:'Close'}).click();
      const nav=await page.locator('.neir-nav-btn:visible').evaluateAll(els=>
        els.map(e=>({
          text:e.textContent?.trim(),
          fg:getComputedStyle(e).color,
          bg:getComputedStyle(e).backgroundColor,
          header:getComputedStyle(document.querySelector('.neir-original-header')).backgroundColor,
        }))
      );
      for(const item of nav){
        const fg=parseRgb(item.fg),bg=blend(parseRgb(item.bg),parseRgb(item.header));
        const ratio=contrast(fg,bg);
        assert(ratio>=4.5,'Navigation contrast '+ratio.toFixed(2)+' for '+item.text+' at '+width);
      }
    }
    const language=width<=767?'.neir-source-mobile-language select':
      width<=1000?'.neir-mobile-language select':'.neir-language-select select';
    if(width>767&&width<=1000)await page.locator('.neir-mobile-toggle').click();
    await page.locator(language).selectOption('bn');
    assert.equal(await page.locator('html').getAttribute('lang'),'bn','Bengali document language missing');
    await page.getByRole('heading',{name:'ন্যাশনাল ইকুইপমেন্ট আইডেন্টিটি রেজিস্টার (NEIR)'}).waitFor();
    await page.locator(language).selectOption('en');
    assert.equal(await page.locator('html').getAttribute('lang'),'en','English document language not restored');
    await page.close();
    console.log('PASS: header/auth navigation, contrast, locale, no overflow at '+width+'px');
  }
  for(const preference of ['reduce','no-preference']){
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:preference});
    await page.goto(root,{waitUntil:'networkidle'});
    const hero=page.locator('.neir-source-hero-media img');
    await hero.evaluate(el=>el.decode());
    const resolved=await hero.evaluate(el=>({src:el.currentSrc,valid:el.naturalWidth>0}));
    assert(resolved.valid,'Hero illustration failed to load for '+preference);
    assert(resolved.src.endsWith(preference==='reduce'?'step-1.svg':'neir-herobanner.gif'),
      'Reduced-motion resource selection failed: '+resolved.src);
    await page.close();
    console.log('PASS: original hero animation preserved / static alternative selected for '+preference);
  }
}finally{await browser.close();}
console.log('PASS: IMEI checker byte-locked; non-IMEI header and reduced-motion fixes verified.');
