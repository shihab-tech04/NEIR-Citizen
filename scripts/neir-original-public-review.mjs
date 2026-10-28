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
 });
 await capture('Contact Us and Purpose dropdown',async()=>{
  await first(page,page.getByText('Contact Us',{exact:true}));
  await page.waitForTimeout(600);
  await shot('contact');
  result['contact_'+size.width]=(await page.locator('body').innerText()).slice(0,5000);
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
