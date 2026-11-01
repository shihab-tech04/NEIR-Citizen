import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const BASE=process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
mkdirSync('acceptance-shots',{recursive:true});
const browser=await chromium.launch({headless:true});
const row={id:'9d45a4ca-11fd-4ff1-9c55-914d9cda1190',imei:'23456789012345',reason:'airmail',
  status:'Pending',arrivalDate:'2026-10-09',appliedAt:'2026-11-01T08:00:00Z',updatedAt:'2026-11-01T08:00:00Z',remarks:''};
const records=[];
const registerApi=async(page)=>{
  await page.route('**/functions/v1/neir-prototype-special', async route=>{
    const request=route.request().postDataJSON();
    let code=200, body={};
    if(request.action==='citizen_list'||request.action==='list')body={items:records};
    else if(request.action==='submit'){
      records.push({...row,imei:request.imei,reason:request.reason,arrivalDate:request.arrivalDate});
      code=201;body={record:{id:row.id,imei:request.imei,status:'Pending'},message:'Special Registration submitted successfully.'};
    } else body={error:'Unexpected Special Registration operation'};
    await route.fulfill({status:code,contentType:'application/json',body:JSON.stringify(body)});
  });
};
const visible=async(locator,label)=>{await locator.waitFor({state:'visible',timeout:10000}).catch(e=>{throw Error(label+': '+e.message)})};
const screen=async(page,name)=>page.screenshot({path:'acceptance-shots/'+name+'.png',fullPage:true,animations:'disabled'});

try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  await registerApi(desktop);
  await desktop.goto(BASE,{waitUntil:'networkidle'});
  await visible(desktop.getByRole('heading',{name:'National Equipment Identity Register (NEIR)'}),'home heading');
  assert.equal(await desktop.locator('.neir-auth-login').count(),0,'no login buttons');
  assert.equal(await desktop.locator('.neir-auth-register').count(),0,'no registration account gate');
  assert.equal(await desktop.locator('.neir-source-step-card').count(),6,'six guide cards retained');
  await screen(desktop,'01-public-neir-home');

  await desktop.locator('.neir-special-registration-section').getByRole('button',{name:'Apply for Special Registration'}).click();
  const wizard=desktop.getByRole('dialog',{name:'Special Registration',exact:true});
  await visible(wizard,'direct Special Registration modal');
  assert.equal(await wizard.locator('.neir-v7-reason-card').count(),3,'all acquisition options retained');
  assert.equal(await wizard.locator('input[name="application-reason"]:disabled').count(),3,'empty IMEI disables acquisitions');
  await wizard.locator('#neir-v7-imei').fill('2345678901234');
  assert.equal(await wizard.locator('input[name="application-reason"]:disabled').count(),3,'13 digits disabled');
  await wizard.locator('#neir-v7-imei').fill('23456789012345');
  assert.equal(await wizard.locator('input[name="application-reason"]:disabled').count(),0,'14 digits immediately enable cards');
  await wizard.getByRole('radio',{name:'Bought/Brought from Air Mail'}).check();
  await visible(wizard.locator('#neir-v7-arrival'),'arrival shown');
  await wizard.locator('#neir-v7-arrival').fill('2026-10-09');
  const samplePng=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082','hex');
  await wizard.locator('#neir-v7-file-commercialInvoice').setInputFiles({name:'invoice.png',mimeType:'image/png',buffer:samplePng});
  await visible(wizard.getByRole('group',{name:'Attached Commercial Invoice'}),'completed file checklist');
  await screen(desktop,'02-direct-registration');
  await wizard.getByRole('button',{name:'Submit'}).click();
  await visible(desktop.getByRole('status').filter({hasText:'Special Registration submitted'}),'application success');
  assert.equal(records.length,1,'application saved through shared transport');
  await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
  await desktop.getByRole('button',{name:'My Profile'}).click();
  await visible(desktop.getByRole('heading',{name:/Special Registration applications/}),'only submitted registration table');
  await visible(desktop.locator('.neir-special-table').getByText('23456789012345'),'table IMEI');
  assert.equal(await desktop.locator('.neir-special-table tbody tr').count(),1);
  assert.equal(await desktop.getByRole('heading',{name:'Search your device info'}).count(),1);
  await screen(desktop,'03-citizen-applications');

  const mobile=await browser.newPage({viewport:{width:320,height:740},isMobile:true});
  await registerApi(mobile);
  await mobile.goto(BASE,{waitUntil:'networkidle'});
  assert.equal(await mobile.locator('.neir-source-mobile-login').filter({hasText:'Login'}).count(),0,'no mobile login');
  await mobile.locator('.neir-special-registration-section').getByRole('button',{name:'Apply for Special Registration'}).click();
  const dialog=mobile.getByRole('dialog',{name:'Special Registration',exact:true});
  await visible(dialog,'mobile direct registration modal');
  assert.equal(await dialog.locator('.neir-v7-reason-card').count(),3,'320px acquisition options');
  await dialog.locator('#neir-v7-imei').fill('990011112222334');
  assert.equal(await dialog.locator('input[name="application-reason"]:disabled').count(),0,'15 digit mobile enable');
  await dialog.getByRole('radio',{name:'Bought/Brought from Air Mail'}).check();
  await visible(dialog.locator('#neir-v7-arrival'),'mobile arrival');
  const geometry=await mobile.evaluate(()=>({w:window.innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(geometry.scroll<=geometry.w+4,'320px horizontal overflow '+JSON.stringify(geometry));
  await screen(mobile,'04-direct-registration-320');
  console.log('PASS public Citizen direct access, 14/15-digit acquisition gates, document rows, submission-to-table, 320px');
}finally{
  await browser.close();
}
