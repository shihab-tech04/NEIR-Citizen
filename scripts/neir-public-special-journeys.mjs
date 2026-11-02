import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const BASE=process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
mkdirSync('acceptance-shots',{recursive:true});
const browser=await chromium.launch({headless:true});
const mobileNumber='01711223344';
const row={id:'9d45a4ca-11fd-4ff1-9c55-914d9cda1190',imei:'23456789012345',reason:'airmail',
  status:'Pending',arrivalDate:'2026-10-09',appliedAt:'2026-11-01T08:00:00Z',updatedAt:'2026-11-01T08:00:00Z',remarks:''};
const records=[];
const registerApi=async page=>{
  await page.route('**/functions/v1/neir-demo-login', async route=>{
    const data=route.request().postDataJSON();
    const valid=data.mobile===mobileNumber&&data.password==='test-password';
    await route.fulfill({status:valid?200:401,contentType:'application/json',
      body:JSON.stringify(valid?{mobile:mobileNumber,name:'Md. Zahid Hasan'}:{error:'Wrong credentials'})});
  });
  await page.route('**/functions/v1/neir-prototype-special', async route=>{
    const req=route.request().postDataJSON();
    let code=200,body={};
    if(req.action==='citizen_list'){
      assert.equal(req.mobile,mobileNumber,'citizen history requested by existing mobile');
      body={items:records.filter(r=>r.citizenMobile===req.mobile)};
    }else if(req.action==='submit'){
      assert.equal(req.mobile,mobileNumber,'submit links IMEI to the logged-in citizen');
      assert(Array.isArray(req.files)&&req.files.length===1,'citizen sends the uploaded document, not merely checklist titles');
      assert.equal(req.files[0].type,'commercialInvoice');
      assert.equal(req.files[0].name,'invoice.png');
      assert.equal(req.files[0].mime,'image/png');
      assert.equal(Buffer.from(req.files[0].data,'base64').length,req.files[0].size,'exact submitted file bytes are preserved');
      const active=records.filter(r=>r.status!=='Accepted'&&r.citizenMobile===req.mobile);
      if(active.length>=20){code=409;body={error:'The limit is 20 active applications.'};}
      else{
        records.push({...row,id:String(records.length+1),citizenMobile:req.mobile,
          imei:req.imei,reason:req.reason,arrivalDate:req.arrivalDate});
        code=201;body={record:{id:String(records.length),imei:req.imei,status:'Pending'},
          message:'Special Registration submitted successfully.'};
      }
    } else body={error:'Unexpected operation'};
    await route.fulfill({status:code,contentType:'application/json',body:JSON.stringify(body)});
  });
};
const visible=async(loc,label)=>loc.waitFor({state:'visible',timeout:10000})
  .catch(e=>{throw Error(label+': '+e.message)});
const screenshot=(page,name)=>page.screenshot({path:'acceptance-shots/'+name+'.png',
  fullPage:true,animations:'disabled'});
const login=async page=>{
  const dialog=page.getByRole('dialog',{name:'Login',exact:true});
  await visible(dialog,'login dialog');
  await dialog.locator('#login-mobile').fill(mobileNumber);
  await dialog.locator('#login-password').fill('test-password');
  await dialog.getByRole('button',{name:'LOGIN'}).click();
};

try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  await registerApi(desktop);
  await desktop.goto(BASE,{waitUntil:'networkidle'});
  await visible(desktop.getByRole('heading',{name:'National Equipment Identity Register (NEIR)'}),'home');
  await visible(desktop.locator('.neir-auth-login'),'signed-out Login');
  assert.equal(await desktop.getByRole('button',{name:'Citizen profile menu'}).count(),0);
  await screenshot(desktop,'01-signed-out-home');
  await desktop.locator('.neir-special-registration-section')
    .getByRole('button',{name:'Apply for Special Registration'}).click();
  const intro=desktop.getByRole('dialog',{name:'About Special Registration'});
  await visible(intro,'approved eligibility explanation before login');
  await visible(intro.getByText('What is Special Registration?'),'special registration explanation');
  await visible(intro.getByText('Who may need to apply?'),'eligibility information');
  assert.equal(await desktop.getByRole('dialog',{name:'Login',exact:true}).count(),0,
    'guest must not land directly on login');
  await intro.getByRole('button',{name:'Proceed to login'}).click();
  assert.equal(await desktop.getByText('Log in to apply for Special Registration').count(),0,
    'obsolete login notice must stay removed');
  await login(desktop);
  const success=desktop.getByRole('dialog',{name:'Special Registration login successful'});
  await visible(success,'explicit successful-login confirmation');
  await visible(success.getByText('You are ready to apply!'),'approved confirmation headline');
  await visible(success.locator('.neir-registration-success-mark'),'approved confirmation icon');
  assert.equal(await success.locator('.neir-registration-success-next').count(),0,
    'removed Next-step panel must not return to the approved success modal');
  await screenshot(desktop,'02-login-success-approved');
  assert.equal(await desktop.getByRole('dialog',{name:'Special Registration',exact:true}).count(),0,
    'form must wait for Proceed to special registration');
  await success.getByRole('button',{name:'Proceed to special registration'}).click();
  const wizard=desktop.getByRole('dialog',{name:'Special Registration',exact:true});
  await visible(wizard,'special registration after explicit success handoff');
  assert.equal(await wizard.locator('.neir-v7-reason-card').count(),3);
  await wizard.locator('#neir-v7-imei').fill('23456789012345');
  await wizard.getByRole('radio',{name:'Bought/Brought from Air Mail'}).check();
  await wizard.locator('#neir-v7-arrival').fill('2026-10-09');
  const png=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082','hex');
  await wizard.locator('#neir-v7-file-commercialInvoice').setInputFiles({
    name:'invoice.png',mimeType:'image/png',buffer:png});
  await wizard.getByRole('button',{name:'Submit'}).click();
  await visible(desktop.getByRole('status').filter({hasText:'Special Registration submitted'}),'success');
  assert.equal(records.length,1);
  await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
  await desktop.getByRole('button',{name:'My Profile'}).click();
  await visible(desktop.getByRole('heading',{name:/Special Registration applications/}),'profile list');
  await visible(desktop.locator('.neir-special-table').getByText('23456789012345'),'IMEI row');
  await visible(desktop.getByText('1/20 applications in use · 19 available'),'quota count');
  await screenshot(desktop,'02-profile-one-application');

  records[0].status='Accepted';
  await desktop.getByRole('button',{name:'Refresh status'}).click();
  await visible(desktop.getByText('0/20 applications in use · 20 available'),'accepted frees slot');
  assert.equal(await desktop.locator('.neir-special-table').getByText('23456789012345').count(),1,
    'accepted applications remain in history');
  for(let n=0;n<20;n++)records.push({...row,id:String(n+100),imei:String(78000000000000+n),
    citizenMobile:mobileNumber,status:'Rejected'});
  await desktop.getByRole('button',{name:'Refresh status'}).click();
  await visible(desktop.getByText('20/20 applications in use · 0 available'),'limit reached');
  await desktop.getByRole('button',{name:'Citizen profile menu'}).click();
  await desktop.getByRole('button',{name:'Logout'}).click();
  await visible(desktop.locator('.neir-auth-login'),'Logout returns to guest');
  assert.equal(await desktop.getByRole('heading',{name:'Search your device info'}).count(),0);

  const mobile=await browser.newPage({viewport:{width:320,height:740},isMobile:true});
  await registerApi(mobile);
  await mobile.goto(BASE,{waitUntil:'networkidle'});
  await visible(mobile.locator('.neir-source-mobile-login').filter({hasText:'Login'}),'mobile guest login');
  await mobile.locator('.neir-source-mobile-login').filter({hasText:'Login'}).click();
  await login(mobile);
  await visible(mobile.getByRole('heading',{name:'Search your device info'}),'mobile profile');
  const geometry=await mobile.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(geometry.scroll<=geometry.w+4,'mobile overflow: '+JSON.stringify(geometry));
  await screenshot(mobile,'03-mobile-profile-and-quota');
  console.log('PASS approved guest intro → login → success → registration, signed-out desktop/mobile, SQL-synced citizen submissions/list, 20 slot cap, accepted release, logout');
}finally{
  await browser.close();
}
