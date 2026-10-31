import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const BASE=process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
mkdirSync('acceptance-shots',{recursive:true});
const browser=await chromium.launch({headless:true});
const record=[];
const check=async (name,fn)=>{
  try{await fn();record.push({name,status:'PASS'});console.log('PASS',name)}
  catch(err){record.push({name,status:'FAIL',error:String(err)});console.error('FAIL',name,err);throw err}
};
async function snap(page,name){await page.screenshot({path:'acceptance-shots/'+name+'.png',fullPage:true,animations:'disabled'})}
async function expectVisible(locator,what){try{await locator.waitFor({state:'visible',timeout:6000})}catch(e){throw new Error(what+' should be visible: '+String(e))}}
async function noOverflow(page,width){
  const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
  assert(m.scroll<=width+3,JSON.stringify(m));
}
let desktop=await browser.newPage({viewport:{width:1918,height:924}});
try{
  await check('Home source structure and imagery',async()=>{
    await desktop.goto(BASE,{waitUntil:'networkidle'});
    await expectVisible(desktop.getByRole('heading',{name:'National Equipment Identity Register (NEIR)'}),'homepage heading');
    assert.equal(await desktop.locator('.neir-source-step-card').count(),6);
    const failed=await desktop.locator('.neir-logo-wrap img, .neir-source-hero-media img, .neir-source-step-card img').evaluateAll(images=>images.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src));
    assert.deepEqual(failed,[]);
    await snap(desktop,'01-home-desktop');
  });
  await check('Source FAQ category layouts and recovered About NEIR answers',async()=>{
    const tabs=desktop.getByRole('tab');
    await tabs.filter({hasText:'Registration'}).click();
    await expectVisible(desktop.getByRole('heading',{name:'Understanding Special Registration'}),'registration FAQ group');
    await desktop.getByRole('button',{name:'What is special registration?'}).click();
    await expectVisible(desktop.getByText('This applies to devices that do not fall under the standard registration process',{exact:false}),'source Registration answer');
    await snap(desktop,'01b-faq-registration');
    await tabs.filter({hasText:'Account & Help'}).click();
    await expectVisible(desktop.getByRole('heading',{name:'OTP & Login Issues'}),'account FAQ group');
    await desktop.getByRole('button',{name:'How do I create a NEIR account?'}).click();
    await expectVisible(desktop.getByText('To create a NEIR account:',{exact:false}),'source Account answer');
    await snap(desktop,'01c-faq-account-help');
    await tabs.filter({hasText:'About NEIR'}).click();
    await expectVisible(desktop.getByRole('heading',{name:'Privacy & Security'}),'About NEIR groups');
    await desktop.getByRole('button',{name:'What is NEIR?'}).click();
    await expectVisible(desktop.getByText('NEIR (National Equipment Identity Register) is a centralized system managed by BTRC',{exact:false}),'source-backed About answer');
    await snap(desktop,'01d-faq-about-neir');
    await tabs.filter({hasText:'IMEI Check'}).click();
  });
  await check('User Guides registration, reset, images and platform states',async()=>{
    await desktop.locator('.neir-main-navigation button').nth(1).click();
    assert.equal(new URL(desktop.url()).pathname,'/user-guides');
    await expectVisible(desktop.getByRole('heading',{name:'User Guide of NEIR'}),'guide heading');
    assert.equal(await desktop.locator('article').count(),4);
    await snap(desktop,'02-guides-registration');
    await desktop.getByRole('button',{name:'Password Reset',exact:true}).click();
    assert.equal(await desktop.locator('article').count(),5);
    await desktop.locator('img[src$="pwd-guide-web-full-process.png"]').evaluate(e=>e.decode());
    await snap(desktop,'03-guides-password-reset');
    await desktop.getByRole('tab',{name:'Mobile'}).click();
    assert.equal(await desktop.locator('article').count(),5);
    await desktop.getByRole('button',{name:'Account Registration',exact:true}).click();
    await desktop.getByRole('tab',{name:'Mobile'}).click();
    assert.equal(await desktop.locator('article').count(),5);
    await desktop.locator('img[src$="acc-guide-mobile-full-process.png"]').evaluate(e=>e.decode());
    await snap(desktop,'04-guides-mobile-tab');
    await desktop.reload({waitUntil:'networkidle'});
    await expectVisible(desktop.getByRole('heading',{name:'User Guide of NEIR'}),'guide deep link on refresh');
    await desktop.goBack({waitUntil:'networkidle'});
  });
  await check('Contact Us demo submit, retrieve and history navigation',async()=>{
    await desktop.locator('.neir-original-footer button').click();
    assert.equal(new URL(desktop.url()).pathname,'/contact-us');
    await expectVisible(desktop.getByRole('heading',{name:"We're here to help!"}),'contact heading');
    await snap(desktop,'05-contact-submit');
    await desktop.getByPlaceholder('Enter your full name').fill('Demo Citizen');
    await desktop.getByPlaceholder('Mobile Number (01XXXXXXXXX)').fill('01712345678');
    await desktop.getByPlaceholder('Enter your email').fill('demo@example.invalid');
    await desktop.getByRole('combobox',{name:'Choose Purpose Type'}).selectOption('Demo inquiry');
    await desktop.getByPlaceholder('Tell us more about the issue you are facing').fill('Mock query for presentation');
    await desktop.getByRole('button',{name:'Submit',exact:true}).click();
    await expectVisible(desktop.getByRole('status').filter({hasText:'Demo query created'}),'demo status');
    await desktop.getByRole('button',{name:/Check Query Status/,exact:true}).first().click();
    await desktop.locator('form').getByRole('button',{name:'Check Query Status',exact:true}).click();
    await expectVisible(desktop.getByRole('status').filter({hasText:'Demo query found:'}),'demo ticket lookup');
    await snap(desktop,'06-contact-query-status');
  });
  await check('Login modal enforces two Supabase-backed demo accounts',async()=>{
    await desktop.locator('.neir-main-navigation button').first().click();
    await desktop.locator('.neir-auth-login').click();
    const dialog=desktop.getByRole('dialog',{name:'Login'});
    await expectVisible(dialog,'login modal');
    await snap(desktop,'07-login');
    await dialog.getByRole('button',{name:/^login$/i}).click();
    await expectVisible(dialog.getByText('Mobile number is required'),'empty mobile validation');
    await expectVisible(dialog.getByText('Password is required'),'empty password validation');
    await dialog.locator('#login-mobile').fill('01712345678');
    await dialog.locator('#login-password').fill('123456');
    await dialog.getByRole('button',{name:/^login$/i}).click();
    await expectVisible(dialog.getByRole('alert').filter({hasText:'Incorrect mobile number or password.'}),'unknown mobile rejection');
    assert.equal(new URL(desktop.url()).pathname,'/');
    await dialog.locator('#login-mobile').fill('01613961501');
    await dialog.locator('#login-password').fill('wrong-password');
    await dialog.getByRole('button',{name:/^login$/i}).click();
    await expectVisible(dialog.getByRole('alert').filter({hasText:'Incorrect mobile number or password.'}),'wrong password rejection');
    await dialog.locator('#login-password').fill('123456');
    await dialog.getByRole('button',{name:/^login$/i}).click();
    await expectVisible(desktop.getByRole('heading',{name:'Registered IMEIs (19)'}),'mock IMEI list');
    assert.equal(new URL(desktop.url()).pathname,'/dashboard');
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await expectVisible(desktop.locator('.neir-profile-name').filter({hasText:'Test Citizen 1'}),'first test identity');
    await desktop.getByRole('button',{name:'Logout'}).click();
    await desktop.locator('.neir-auth-login').click();
    const secondDialog=desktop.getByRole('dialog',{name:'Login'});
    await secondDialog.locator('#login-mobile').fill('01673961501');
    await secondDialog.locator('#login-password').fill('123456');
    await secondDialog.getByRole('button',{name:/^login$/i}).click();
    await desktop.waitForURL('**/dashboard',{timeout:12000});
    assert.equal(new URL(desktop.url()).pathname,'/dashboard');
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await expectVisible(desktop.locator('.neir-profile-name').filter({hasText:'Test Citizen 2'}),'second test identity');
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await snap(desktop,'08-dashboard');
  });
  await check('Dashboard pagination, search, details, restricted tab',async()=>{
    await desktop.getByRole('button',{name:'Next page'}).click();
    await expectVisible(desktop.getByText('99000100000019'),'last page data');
    await desktop.getByRole('button',{name:'Previous page'}).click();
    await desktop.getByPlaceholder('Search IMEI').fill('99000100000001');
    assert.equal(await desktop.locator('table tbody tr').count(),1);
    await desktop.getByRole('button',{name:'Details'}).click();
    await expectVisible(desktop.getByRole('dialog',{name:'IMEI details'}),'detail dialog');
    await snap(desktop,'09-imei-detail');
    await desktop.getByRole('button',{name:'Close details'}).click();
    await desktop.getByPlaceholder('Search IMEI').fill('');
    await desktop.getByRole('button',{name:/Actions for IMEI/}).first().click();
    await desktop.getByRole('button',{name:'Mark as Stolen'}).click();
    await expectVisible(desktop.getByRole('alertdialog',{name:'Mark IMEI as stolen'}),'stolen demo confirmation');
    await desktop.getByRole('button',{name:'Confirm demo action'}).click();
    await desktop.getByRole('button',{name:'Restricted IMEIs'}).click();
    await expectVisible(desktop.getByRole('heading',{name:'Restricted IMEIs (1)'}),'restricted demo tab');
    await snap(desktop,'10-restricted-demo');
    await desktop.getByRole('button',{name:'Registered IMEIs'}).click();
  });
  await check('Signed-in homepage Special Registration guidance reuses the citizen wizard',async()=>{
    await desktop.locator('.neir-main-navigation button').first().click();
    assert.equal(new URL(desktop.url()).pathname,'/');
    const guide=desktop.locator('.neir-special-registration-section');
    await expectVisible(guide,'Special Registration section between hero and 3 Steps');
    const positions=await desktop.evaluate(()=>({
      guide:document.querySelector('.neir-special-registration-section')?.getBoundingClientRect().top,
      hero:document.querySelector('.neir-source-hero')?.getBoundingClientRect().top,
      steps:document.querySelector('.neir-source-steps-wrap')?.getBoundingClientRect().top
    }));
    assert(positions.hero < positions.guide && positions.guide < positions.steps,'guide must be between hero and steps');
    await snap(desktop,'10b-signed-in-registration-guide');
    await guide.getByRole('button',{name:'Apply for Special Registration'}).click();
    const wizard=desktop.getByRole('dialog',{name:'Special Registration'});
    await expectVisible(wizard,'same Special Registration wizard');
    assert.equal(await wizard.getByPlaceholder('IMEI Number').inputValue(),'','home entry must start with blank IMEI');
    await wizard.getByRole('button',{name:'Next'}).click();
    await expectVisible(wizard.getByRole('alert').filter({hasText:'Enter the first 14 digits'}),'home entry validates IMEI');
    await wizard.getByRole('button',{name:'Close special registration'}).click();
    await guide.getByRole('button',{name:'Apply for Special Registration'}).click();
    await expectVisible(wizard,'wizard can reopen after closing');
    await wizard.getByRole('button',{name:'Close special registration'}).click();
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await desktop.getByRole('button',{name:'My Profile'}).click();
    await desktop.waitForURL('**/dashboard');
    await desktop.locator('.neir-main-navigation button').first().click();
    assert.equal(await desktop.getByRole('dialog',{name:'Special Registration'}).count(),0,'returning home should not reopen a stale registration');
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await desktop.getByRole('button',{name:'My Profile'}).click();
    await desktop.waitForURL('**/dashboard');
  });
  await check('Special Registration mock wizard, validation, files and completion',async()=>{
    await desktop.getByRole('button',{name:/Actions for IMEI/}).first().click();
    await desktop.getByRole('button',{name:'Special Registration'}).click();
    const dlg=desktop.getByRole('dialog',{name:'Special Registration'});
    await expectVisible(dlg,'Special Registration');
    await snap(desktop,'11-registration-step1');
    await dlg.getByRole('button',{name:'Next'}).click();
    await expectVisible(dlg.getByRole('alert').filter({hasText:'Device brand name is required.'}),'step1 required validation');
    await dlg.getByPlaceholder('Input device brand name').fill('Demo Brand');
    await dlg.getByPlaceholder('Input device model number').fill('Demo Model');
    await dlg.getByPlaceholder('Input device serial number').fill('ABC-123');
    await dlg.getByRole('button',{name:'Next'}).click();
    await expectVisible(dlg.getByRole('combobox',{name:'Application Reason'}),'step2 reason');
    await snap(desktop,'12-registration-step2');
    await dlg.getByRole('combobox',{name:'Application Reason'}).selectOption({index:1});
    await dlg.locator('input[type=date]').fill('2026-10-20');
    await dlg.getByPlaceholder('Passport number').fill('DEMO-PASSPORT');
    await dlg.getByRole('combobox',{name:'How you purchased the device?'}).selectOption({index:1});
    await dlg.getByRole('button',{name:'Next'}).click();
    await expectVisible(dlg.getByText('Passport info page',{exact:false}),'step3 attachments');
    await snap(desktop,'13-registration-step3');
    await dlg.getByRole('button',{name:'Submit (demo only)'}).click();
    assert((await dlg.getByRole('alert').count())>=3,'required attachment errors');
    const oversized={name:'oversized.png',mimeType:'image/png',buffer:Buffer.alloc(1048577)};
    await dlg.locator('input[type=file]').first().setInputFiles(oversized);
    await expectVisible(dlg.getByRole('alert').filter({hasText:'Max 1MB'}),'size limit');
    const file={name:'mock.png',mimeType:'image/png',buffer:Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082','hex')};
    for(let i=0;i<3;i++) await dlg.locator('input[type=file]').nth(i).setInputFiles(file);
    await dlg.getByRole('button',{name:'Submit (demo only)'}).click();
    await expectVisible(desktop.getByRole('status').filter({hasText:'Demo complete: Special Registration'}),'local completion');
    await snap(desktop,'14-registration-done');
  });
  await check('Profile editing, logout and mock registration screens',async()=>{
    await desktop.getByRole('button',{name:'Edit Profile Informations'}).click();
    await expectVisible(desktop.getByRole('dialog',{name:'Edit profile information'}),'profile mock');
    await desktop.getByRole('dialog',{name:'Edit profile information'}).locator('input').fill('Updated Demo Citizen');
    await desktop.getByRole('button',{name:'Save demo changes'}).click();
    await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
    await desktop.getByRole('button',{name:'Logout'}).click();
    await desktop.locator('.neir-auth-register').click();
    await expectVisible(desktop.getByRole('dialog',{name:'Register'}),'registration mock');
    await snap(desktop,'15-register-step1');
    await desktop.getByRole('button',{name:'Close'}).click();
  });
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  await check('Mobile homepage source geometry and no horizontal overflow',async()=>{
    await mobile.goto(BASE,{waitUntil:'networkidle'});
    await noOverflow(mobile,390);
    await expectVisible(mobile.locator('.neir-source-mobile-login'),'source mobile login');
    assert.equal(await mobile.locator('.neir-source-step-card').count(),6);
    await snap(mobile,'16-mobile-home');
  });
  await check('Mobile login, language switch and modal constraints',async()=>{
    await mobile.locator('.neir-source-mobile-language select').selectOption('bn');
    await expectVisible(mobile.locator('.neir-source-hero-copy h1'),'Bengali hero');
    await mobile.locator('.neir-source-mobile-login').click();
    const dialog=mobile.getByRole('dialog',{name:'Login'});
    await expectVisible(dialog,'mobile login');
    const box=await dialog.boundingBox();
    assert(box && box.width<=390 && box.height<=844,'modal must fit viewport');
    await snap(mobile,'17-mobile-login');
    await mobile.getByRole('button',{name:'Close'}).click();
    await noOverflow(mobile,390);
  });
  await check('Mobile authenticated homepage guide opens responsive wizard',async()=>{
    await mobile.locator('.neir-source-mobile-login').click();
    const login=mobile.getByRole('dialog',{name:'Login'});
    await login.locator('#login-mobile').fill('01613961501');
    await login.locator('#login-password').fill('123456');
    await login.getByRole('button',{name:/^login$/i}).click();
    await mobile.waitForURL('**/dashboard');
    await mobile.getByRole('button',{name:'NEIR Citizen home'}).click();
    await mobile.waitForURL('**/');
    const guide=mobile.locator('.neir-special-registration-section');
    await expectVisible(guide,'mobile signed-in guide');
    await noOverflow(mobile,390);
    await snap(mobile,'18-mobile-signed-in-registration-guide');
    await expectVisible(guide.getByRole('heading',{name:'বিশেষ নিবন্ধন কী?'}),'Bengali Special Registration heading');
    await guide.getByRole('button',{name:'বিশেষ নিবন্ধনের আবেদন করুন'}).click();
    const dialog=mobile.getByRole('dialog',{name:'Special Registration'});
    await expectVisible(dialog,'mobile modal from homepage');
    const size=await dialog.boundingBox();
    assert(size && size.width<=390 && size.height<=844,'registration dialog fits mobile viewport');
    await dialog.getByRole('button',{name:'Close special registration'}).click();
    await noOverflow(mobile,390);
  });
  await mobile.close();
} finally{
  writeFileSync('acceptance-shots/results.json',JSON.stringify({commit:process.env.GITHUB_SHA||'local',tests:record},null,2));
  await browser.close();
}
