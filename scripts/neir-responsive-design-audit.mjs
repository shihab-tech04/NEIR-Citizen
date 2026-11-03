import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
const browser=await chromium.launch({headless:true});
const breakpoints=[320,360,390,768,1024,1440,1918];
try {
  for(const width of breakpoints) {
    const page=await browser.newPage({viewport:{width,height:860},isMobile:width<=390});
    await page.goto(base+'/',{waitUntil:'networkidle'});
    const home=await page.evaluate(()=>{
      const heading=document.querySelector('h1');
      return {
        overflow:document.documentElement.scrollWidth-window.innerWidth,
        bodyFont:getComputedStyle(document.body).fontFamily,
        headingVisible:Boolean(heading&&heading.getBoundingClientRect().width>0),
      };
    });
    assert(home.headingVisible,'Homepage heading missing at '+width);
    assert(home.overflow<=4,'Home horizontal overflow at '+width+': '+home.overflow);
    assert(home.bodyFont.toLowerCase().includes('poppins'),'Poppins missing at '+width);

    await page.goto(base+'/user-guides',{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'User Guide of NEIR'}).waitFor();
    const guides=await page.evaluate(()=>{
      const tiles=[...document.querySelectorAll('.neir-source-guide-tile[aria-pressed]')];
      return {
        count:tiles.length,
        selected:tiles.filter(e=>e.getAttribute('aria-pressed')==='true').length,
        maxBorder:Math.max(...tiles.map(e=>parseFloat(getComputedStyle(e).borderTopWidth)||0)),
        overflow:document.documentElement.scrollWidth-window.innerWidth,
      };
    });
    assert.equal(guides.count,2,'Guide choice count at '+width);
    assert.equal(guides.selected,1,'Guide selected state at '+width);
    assert(guides.maxBorder<=2,'Thick custom selection border returned at '+width);
    assert(guides.overflow<=4,'Guide overflow at '+width);
    await page.getByRole('button',{name:'Password Reset'}).click();
    await page.getByRole('tab',{name:'Mobile'}).click();
    const guideSelected=await page.getByRole('tab',{name:'Mobile'}).getAttribute('aria-selected');
    assert.equal(guideSelected,'true','Guide tab cannot switch at '+width);

    await page.goto(base+'/contact-us',{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:"We're here to help!"}).waitFor();
    const form=await page.evaluate(()=>({
      fields:document.querySelectorAll('.neir-ui-control').length,
      overflow:document.documentElement.scrollWidth-window.innerWidth,
    }));
    assert(form.fields>=4,'Shared form controls missing at '+width);
    assert(form.overflow<=4,'Contact form overflow at '+width);

    await page.goto(base+'/',{waitUntil:'networkidle'});
    const application=page.locator('.neir-special-registration-section button').first();
    await application.click();
    const dialog=page.getByRole('dialog',{name:'About Special Registration'});
    await dialog.waitFor({state:'visible'});
    const rect=await dialog.boundingBox();
    assert(rect&&rect.width<=width+2,'Guest dialog overflows at '+width);
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    const modalCloseRestores=await page.evaluate(()=>document.body.style.overflow!=='hidden');
    assert(modalCloseRestores,'Dialog did not restore body scroll at '+width);

    if(width===390||width===1440) {
      const language=width===390
        ? page.locator('.neir-source-mobile-language select')
        : page.locator('.neir-language-select select');
      await language.selectOption('bn');
      assert.equal(await language.inputValue(),'bn','EN/BN selection lost at '+width);
    }
    console.log('PASS responsive source/guide/forms/modal/EN-BN at '+width+'px');
    await page.close();
  }
} finally {await browser.close();}
