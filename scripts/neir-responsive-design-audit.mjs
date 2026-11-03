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
    assert(await dialog.evaluate(el=>el.classList.contains('neir-modal-surface')),
      'Guest dialog must use the shared modal surface at '+width);
    const closeRect=await dialog.getByRole('button',{name:'Close dialog'}).boundingBox();
    assert(closeRect&&closeRect.width>=44&&closeRect.height>=44,
      'Modal close target must be at least 44px at '+width);
    const overlay=await dialog.evaluate(el=>getComputedStyle(el.parentElement).backgroundColor);
    assert(overlay.startsWith('rgba('),'Shared modal backdrop missing at '+width);
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
      const faq=page.locator('#faq-section');
      await faq.getByText('সাধারণ জিজ্ঞাসা').waitFor();
      await faq.getByRole('tab',{name:'নিবন্ধন'}).click();
      await faq.getByRole('button',{name:'বিশেষ নিবন্ধন কী?'}).click();
      await faq.getByText('সাধারণ নিবন্ধন প্রক্রিয়ার বাইরে', {exact:false}).waitFor();
      if(width===390) {
        await page.locator('.neir-mobile-toggle').click();
        await page.locator('.neir-mobile-menu-item').nth(1).click();
      } else {
        await page.locator('.neir-main-navigation button').nth(1).click();
      }
      await page.getByRole('heading',{name:'NEIR ব্যবহার নির্দেশিকা'}).waitFor();
      await page.getByRole('button',{name:'পাসওয়ার্ড পুনর্নির্ধারণ'}).click();
      await page.locator('.neir-original-footer button').first().click();
      await page.getByRole('heading',{name:'আমরা আপনাকে সহায়তা করতে এখানে আছি!'}).waitFor();
      await page.getByRole('button',{name:'জমা দিন'}).click();
      assert(await page.getByRole('alert').filter({hasText:'সব আবশ্যিক ঘর'}).isVisible(),
        'Localized form validation missing at '+width);
      const bnLayout=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert(bnLayout<=4,'Bengali text expansion overflow at '+width);
    }
    console.log('PASS responsive source/guide/forms/modal/EN-BN at '+width+'px');
    await page.close();
  }
} finally {await browser.close();}
