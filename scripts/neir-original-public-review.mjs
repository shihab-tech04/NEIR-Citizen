import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
mkdirSync('reference-review',{recursive:true});
const result={source:'https://neir.btrc.gov.bd',captures:[],warnings:[]};
const first=async(page,loc)=>{if(await loc.count()===0)return false;await loc.first().click({timeout:8000});return true};
for(const size of [{width:1918,height:924},{width:390,height:844}]){
 const page=await browser.newPage({viewport:size,deviceScaleFactor:1});
 const id='ref-'+size.width;
 const shot=async suffix=>{await page.screenshot({path:'reference-review/'+id+'-'+suffix+'.png',fullPage:true,animations:'disabled'});result.captures.push(id+'-'+suffix)};
 const capture=async(name,fn)=>{try{await fn();result.captures.push({viewport:size.width,name,status:'PASS'})}catch(e){result.warnings.push({viewport:size.width,name,error:String(e)})}};
 await capture('Home',async()=>{
  await page.goto(result.source,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1800);
  await shot('home');
 });
 const faqQuestions={
  'Registration':['What is special registration?','I am a foreign visitor. Do I need to register my phone?','How long can I use my phone without special registration?','How long does Special Registration take?','What documents are required?','Can Special Registration be rejected?'],
  'Account & Help':['How do I create a NEIR account?','I forgot my password. What should I do?','Why is my account locked?','How do I login?','What if my OTP is not verified during registration?','What if I don’t receive my OTP?','Which documents are relevant for verification or claims?','What if my document is blurry?'],
  'About NEIR':['What is NEIR?','Why is NEIR important?','Who should use the NEIR Citizen Portal?','Does NEIR block illegal or stolen devices?','What devices does NEIR cover?','Is my personal information safe?']
 };
 await capture('FAQ tab content',async()=>{
  for(const name of ['Registration','Account & Help','About NEIR']){
   const loc=page.getByText(name,{exact:true});
   await first(page,loc);
   await page.waitForTimeout(500);
   const txt=await page.locator('body').innerText();
   const faqi=txt.indexOf('FAQ');
   const foot=txt.indexOf('Copyright ©');
   result['faq_'+name]=txt.slice(faqi,foot>faqi?foot:faqi+6000).slice(0,6000);
   await shot('faq-'+name.replace(/[^a-z]/gi,'-'));
   const answers={};
   for(const q of faqQuestions[name]){
     const locator=page.getByText(q,{exact:true});
     if(!(await locator.count())){answers[q]={status:'NOT_FOUND'};continue;}
     await locator.first().click({timeout:6000});
     await page.waitForTimeout(250);
     const current=await page.locator('body').innerText();
     const start=current.indexOf(q,current.indexOf('FAQ'));
     const from=start+q.length;
     const boundaries=[...faqQuestions[name].filter(t=>t!==q), 'Requirements and Rules','Usage Duration','Understanding Special Registration','Account Creation & Access','OTP & Login Issues','Documents & Verification','Users & Access','Device Coverage & Control','Privacy & Security','Terms of Service'].map(t=>current.indexOf(t,from)).filter(x=>x>from);
     const until=Math.min(current.length,...boundaries);
     answers[q]=start<0?{status:'UNREADABLE'}:{status:'READ',answer:current.slice(from,until).trim().slice(0,2000)};
   }
   result['faq_answers_'+name]=answers;

  }
 });
 await capture('Login modal',async()=>{
  await first(page,page.getByRole('button',{name:'Login',exact:true}));
  await page.waitForTimeout(400);
  await shot('login');
  result['login_'+size.width]=(await page.locator('[role=dialog],p-dialog').allInnerTexts()).slice(0,2);
  await first(page,page.getByRole('button',{name:'Close',exact:true}).or(page.locator('.p-dialog-close-button,.p-dialog-header-close')));
 });
 await capture('User Guides web and mobile',async()=>{
  await first(page,page.getByText('User Guides',{exact:true}));
  await page.waitForTimeout(700);
  await shot('guides-web');
  result['guides_'+size.width]=(await page.locator('body').innerText()).slice(0,6500);
  await first(page,page.getByText('Mobile',{exact:true}));
  await page.waitForTimeout(600);
  await shot('guides-mobile');
  result['guides_mobile_'+size.width]=(await page.locator('body').innerText()).slice(0,6500);
  result['guide_images_mobile_'+size.width]=await page.locator('img').evaluateAll(xs=>xs.map(x=>({alt:x.alt,src:x.currentSrc||x.src})).filter(x=>/guide|step|registration|password/i.test(x.src+' '+x.alt)));
  await first(page,page.getByText('Password Reset',{exact:true}));
  await page.waitForTimeout(600);
  result['reset_mobile_'+size.width]=(await page.locator('body').innerText()).slice(0,6500);
  result['reset_images_mobile_'+size.width]=await page.locator('img').evaluateAll(xs=>xs.map(x=>({alt:x.alt,src:x.currentSrc||x.src})).filter(x=>/guide|step|password/i.test(x.src+' '+x.alt)));

 });
 await capture('Contact Us and Purpose dropdown',async()=>{
  await first(page,page.getByText('Contact Us',{exact:true}));
  await page.waitForTimeout(600);
  await shot('contact');
  result['contact_'+size.width]=(await page.locator('body').innerText()).slice(0,5000);
  result['contact_url_'+size.width]=page.url();
  if(!result['contact_'+size.width].includes("We're here to help!"))throw new Error('Original Contact Us did not navigate; dropdown options not verified');

  const selector=page.getByText('Choose Purpose Type',{exact:false}).first();
  if(await selector.count())await selector.click({timeout:4500});
  const selects=page.locator('p-select,[role=combobox]').last();
  if(await selects.count())await selects.click({timeout:4500});
  await page.waitForTimeout(400);
  result['purpose_'+size.width]=await page.locator('[role=option],.p-select-option,.p-dropdown-item').allInnerTexts();
  await shot('purpose');
 });
 await page.close();
}
writeFileSync('reference-review/results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({screens:result.captures.length,warnings:result.warnings,faqSamples:['Registration','Account & Help','About NEIR'].map(n=>({n,length:result['faq_'+n]?.length})),purpose:result.purpose_1918},null,2));
await browser.close();
