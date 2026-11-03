import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({headless:true});
const base = process.env.NEIR_BASE_URL || 'http://127.0.0.1:4567';
const visible = (locator, description) => locator.waitFor({state:'visible',timeout:10000})
  .catch(error=>{throw new Error(description+': '+error.message)});
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.locator('.neir-special-registration-section button').first().click();
  const intro = page.getByRole('dialog',{name:'About Special Registration'});
  await visible(intro,'Eligibility introduction');
  assert.equal(await intro.getByRole('button',{name:'Back',exact:true}).count(),0,
    'Initial modal must not show a misleading Back control');
  assert((await intro.evaluate(el=>getComputedStyle(el).animationName)).includes('neir-modal'),
    'Shared dialog entrance animation missing');

  await intro.getByRole('button',{name:'Proceed to login'}).click();
  const login = page.getByRole('dialog',{name:'Login'});
  await visible(login,'Login from eligibility');
  await visible(login.getByRole('button',{name:'Back',exact:true}),'Modal header Back to eligibility');
  const backRect = await login.getByRole('button',{name:'Back',exact:true}).boundingBox();
  assert(backRect&&backRect.width>=44&&backRect.height>=44,'Back target must be >=44px');
  await login.getByRole('button',{name:'Back',exact:true}).click();
  await visible(intro,'Eligibility restored from Login');

  await intro.getByRole('button',{name:'Proceed to login'}).click();
  await login.getByRole('button',{name:'Forgot Password'}).click();
  const forgot = page.getByRole('dialog',{name:'Forgot Password'});
  await visible(forgot,'Forgot Password view');
  await forgot.getByRole('button',{name:'Back',exact:true}).click();
  await visible(login,'Login restored from Forgot Password');

  await login.getByRole('button',{name:'Sign Up'}).click();
  const register = page.getByRole('dialog',{name:'User Registration'});
  await visible(register,'Registration view');
  await register.locator('#reg-mobile').fill('01711223344');
  await register.locator('#reg-document').fill('1234');
  await register.getByRole('button',{name:'Request for OTP'}).click();
  await visible(register.locator('#reg-otp'),'Registration step 2');
  await register.getByRole('button',{name:'Back',exact:true}).click();
  await visible(register.locator('#reg-document'),'Registration step 1 after Back');
  assert.equal(await register.locator('#reg-mobile').inputValue(),'01711223344',
    'Back must preserve registration data');
  await register.getByRole('button',{name:'Request for OTP'}).click();
  const demoCode = (await register.locator('.neir-reg-demo-code strong').textContent())?.trim() || '';
  assert(/^\d{6}$/.test(demoCode),'Demo OTP must have exactly six digits');
  for(let i=0;i<6;i++) await register.locator(i===0?'#reg-otp':`#reg-otp-${i}`).fill(demoCode[i]);
  await register.getByRole('button',{name:'Verify and Proceed'}).click();
  await visible(register.locator('#reg-pass'),'Registration step 3');
  await register.getByRole('button',{name:'Back',exact:true}).click();
  await visible(register.locator('#reg-otp'),'Registration step 2 restored from step 3');
  await register.getByRole('button',{name:'Verify and Proceed'}).click();
  await register.locator('#reg-pass').fill('StrongPass1!');
  await register.locator('#reg-pass-confirm').fill('StrongPass1!');
  await register.getByRole('button',{name:'Create account'}).click();
  const success = page.getByRole('dialog',{name:'Special Registration login successful'});
  await visible(success,'Successful authenticated handoff');
  assert.equal(await page.getByRole('dialog',{name:'Login',exact:true}).count(),0,
    'Authenticated success should not show a login form');

  await success.getByRole('button',{name:'Proceed to special registration'}).click();
  const wizard = page.getByRole('dialog',{name:'Special Registration',exact:true});
  await visible(wizard,'Registration wizard from success');
  await visible(wizard.getByRole('button',{name:'Back',exact:true}),'Wizard Back to successful handoff');
  await wizard.getByRole('button',{name:'Back',exact:true}).click();
  await visible(success,'Success restored without re-authenticating');
  await success.getByRole('button',{name:'Back',exact:true}).click();
  await visible(intro,'Prior eligibility restored after login success');
  assert(await intro.getByText('You are signed in and can continue your application.').isVisible(),
    'Back must preserve signed-in state and truthful eligibility copy');

  await intro.getByRole('button',{name:'Proceed to special registration'}).click();
  await visible(wizard,'Wizard from signed-in intro');
  await wizard.locator('#neir-v7-imei').fill('12345678901234');
  await wizard.getByRole('radio',{name:'Bought/Brought from Air Mail'}).check();
  await visible(wizard.getByRole('button',{name:'View sample of Courier Bill'}),'Document sample entry');
  await wizard.getByRole('button',{name:'View sample of Courier Bill'}).click();
  await visible(page.getByRole('dialog',{name:'Sample · Courier Bill'}).getByRole('button',{name:'Back to registration'}),'Sample header Back');
  await page.getByRole('dialog',{name:'Sample · Courier Bill'}).getByRole('button',{name:'Back to registration'}).click();
  assert.equal(await wizard.locator('#neir-v7-imei').inputValue(),'12345678901234',
    'Document sample Back must keep IMEI and draft form');
  await wizard.getByRole('button',{name:'Back',exact:true}).click();
  await visible(intro,'Wizard Back restored prior eligibility modal');
  await intro.getByRole('button',{name:'Close dialog'}).click();

  // A device-details → application transition must return to that specific
  // details dialog, not to the general Profile route or login dialog.
  await page.getByRole('button',{name:'Citizen profile menu'}).click();
  await page.getByRole('button',{name:'My Profile'}).click();
  await visible(page.getByRole('heading',{name:'Search your device info'}),'Profile device search');
  await page.locator('#neir-profile-imei-search').fill('359203112345678');
  await page.getByRole('button',{name:'Search device'}).click();
  await page.getByRole('button',{name:'View details'}).click();
  const detail=page.getByRole('dialog',{name:'IMEI details'});
  await visible(detail,'Greylisted handset detail');
  await detail.getByRole('button',{name:'Apply for Special Registration'}).click();
  await visible(wizard,'Wizard entered from device details');
  await wizard.getByRole('button',{name:'Back',exact:true}).click();
  await visible(detail,'Original device detail restored from wizard');
  assert(await detail.getByText('359203112345678').count()>0,
    'Back must restore the same device context');
  await detail.getByRole('button',{name:'Close dialog'}).click();

  const reduced = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(base+'/',{waitUntil:'networkidle'});
  await reduced.locator('.neir-special-registration-section button').first().click();
  const mobileIntro = reduced.getByRole('dialog',{name:'About Special Registration'});
  await visible(mobileIntro,'Reduced-motion mobile modal');
  const motion = await mobileIntro.evaluate(el=>getComputedStyle(el).animationName);
  assert.equal(motion,'none','Reduced-motion user preference must disable modal animation');
  await mobileIntro.getByRole('button',{name:'Proceed to login'}).click();
  const mobileLogin=reduced.getByRole('dialog',{name:'Login'});
  await visible(mobileLogin,'Mobile login');
  await mobileLogin.getByRole('button',{name:'Back',exact:true}).click();
  await visible(mobileIntro,'Mobile Back to intro');
  const geometry=await reduced.evaluate(()=>({
    inner:window.innerWidth,scroll:document.documentElement.scrollWidth,
  }));
  assert(geometry.scroll<=geometry.inner+3,'Mobile dialog navigation caused horizontal overflow');
  console.log('PASS: animated modal transitions, header Back, nested registration steps,');
  console.log('      authenticated modal return, preserved wizard drafts and reduced motion.');
} finally {await browser.close();}
