import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('acceptance-shots',{recursive:true});
const browser=await chromium.launch({headless:true});
const base=process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
try{
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    await page.goto(base+'/',{waitUntil:'networkidle'});
    await page.locator('.neir-special-registration-section button').first().click();
    await page.getByRole('dialog',{name:'About Special Registration'})
      .getByRole('button',{name:'Proceed to login'}).click();
    await page.getByRole('dialog',{name:'Login',exact:true})
      .getByRole('button',{name:'Sign Up'}).click();
    const dialog=page.getByRole('dialog',{name:'User Registration'});
    await dialog.waitFor({state:'visible'});
    const metrics=await dialog.evaluate(el=>{
      const form=el.querySelector('.neir-reg-form');
      const footer=el.querySelector('.neir-reg-footer');
      const login=footer?.querySelector('.neir-reg-existing');
      const action=footer?.querySelector('.neir-reg-submit');
      const li=el.querySelector('.neir-reg-explanation > ul li');
      const first=login?.getBoundingClientRect();
      const second=action?.getBoundingClientRect();
      const doc=document.documentElement;
      return {
        sameFooter:!!(footer&&login&&action),
        formGap:form?getComputedStyle(form).rowGap:null,
        marker:li?getComputedStyle(li).listStyleType:null,
        display:li?getComputedStyle(li).display:null,
        footerY:first&&second?Math.abs(first.top+first.height/2-second.top-second.height/2):999,
        overflow:doc.scrollWidth-window.innerWidth,
      };
    });
    assert(metrics.sameFooter,'Login and primary action must be inside the same footer at '+width);
    assert(metrics.formGap==='0px','No inherited 12px gap between form sections at '+width);
    assert(metrics.marker==='disc'&&metrics.display==='list-item',
      'Figma instruction bullet markers missing at '+width);
    assert(metrics.overflow<=3,'Modal overflow at '+width);
    if(width>767)assert(metrics.footerY<6,
      'Desktop footer login/action must be vertically aligned');
    await dialog.screenshot({path:`acceptance-shots/neir-register-footer-${width}.png`,animations:'disabled'});
    await dialog.locator('#reg-mobile').fill('01711223344');
    await dialog.locator('#reg-document').fill('1234');
    await dialog.getByRole('button',{name:'Request for OTP'}).click();
    await dialog.locator('#reg-otp').waitFor({state:'visible'});
    assert.equal(await dialog.locator('.neir-reg-demo-warning').count(),0,
      'OTP screen must not show the removed warning banner at '+width+'px');
    assert(await dialog.locator('.neir-reg-demo-code strong').isVisible(),
      'OTP test flow still exposes the currently generated local test code');
    await dialog.screenshot({path:`acceptance-shots/neir-otp-footer-${width}.png`,animations:'disabled'});
    assert(await dialog.locator('.neir-reg-footer .neir-reg-existing button').isVisible(),
      'Login recovery must remain visible at OTP step');
    await page.close();
    console.log('PASS: registration and OTP footer, bullets and compact layout at '+width+'px');
  }
}finally{await browser.close();}
