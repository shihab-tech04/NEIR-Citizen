import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const sources=[['original','https://neir.btrc.gov.bd/'],['clone','http://127.0.0.1:4567/']];
mkdirSync('faq-parity',{recursive:true});
const report={screens:[],summary:{}};
for(const width of [1918,390]){
 for(const [kind,url] of sources){
  const page=await browser.newPage({viewport:{width,height:930},deviceScaleFactor:1});
  try{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
   await page.waitForTimeout(1300);
   const faq=page.getByText('FAQ',{exact:true}).first();
   await faq.waitFor({state:'visible',timeout:15000});
   const bounds=await faq.boundingBox();
   await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),Math.max(0, (bounds?.y||0)+await page.evaluate(()=>window.scrollY)-145));
   await page.waitForTimeout(400);
   const fields={
    heading:page.getByText('FAQ',{exact:true}).first(),
    subtitle:page.getByText('Need help?',{exact:true}).first(),
    firstTab:page.getByText('IMEI Check',{exact:true}).last(),
    secondTab:page.getByText('Registration',{exact:true}).last(),
    firstGroup:page.getByText('IMEI Basics',{exact:true}).first(),
    firstQuestion:kind==='clone'?page.locator('.neir-faq-question').first():page.getByText('What is an IMEI number?',{exact:true}).first(),
    secondQuestion:kind==='clone'?page.locator('.neir-faq-question').nth(1):page.getByText('How can I find my IMEI?',{exact:true}).first()
   };
   const m={kind,width};
   for(const [key,locator] of Object.entries(fields)){
    const box=await locator.boundingBox();
    m[key]=box?Object.fromEntries(['x','y','width','height'].map(k=>[k,Math.round(box[k]*10)/10])):null;
    if(kind==='clone'&&!box)throw Error('FAQ missing '+key);
   }
   if(kind==='clone'){
    const metrics=await page.evaluate(()=>{
     const first=document.querySelector('.neir-faq-question');
     const firstGroup=document.querySelector('.neir-faq-group');
     const tab=document.querySelector('.neir-faq-tab');
     const firstItem=document.querySelector('.neir-faq-item');
     const subtitle=document.querySelector('.neir-faq-intro p');
     return {
      rowHeight:+first.getBoundingClientRect().height.toFixed(1),
      tabHeight:+tab.getBoundingClientRect().height.toFixed(1),
      contentWidth:+document.querySelector('.neir-faq-content').getBoundingClientRect().width.toFixed(1),
      groupPadding:getComputedStyle(firstGroup).padding,
      rowPadding:getComputedStyle(firstItem).padding,
      firstQuestionWeight:getComputedStyle(first).fontWeight,
      subtitleColor:getComputedStyle(subtitle).color,
      overflow:document.documentElement.scrollWidth-window.innerWidth
     };
    });
    Object.assign(m,metrics);
    if(width===1918){
      assert(metrics.rowHeight>=70&&metrics.rowHeight<=78,'Original desktop accordion row height expected ~72px');
      assert(metrics.tabHeight>=57&&metrics.tabHeight<=62,'Original desktop tab height expected ~59px');
      assert(Number(metrics.firstQuestionWeight)>=600,'Original FAQ question text must be semibold');
    }
    assert(metrics.overflow<=3,'FAQ viewport must not overflow horizontally');
   }
   await page.screenshot({path:'faq-parity/'+kind+'-'+width+'-closed.png',fullPage:false,animations:'disabled'});
   if(kind==='clone'){
    await page.getByRole('button',{name:'What is an IMEI number?'}).click();
    assert(await page.getByText('IMEI (International Mobile Equipment Identity)',{exact:false}).isVisible(),'Expanded FAQ answer missing');
   } else {
    await page.getByText('What is an IMEI number?',{exact:true}).first().click();
   }
   await page.locator('body').click({position:{x:15,y:20}});
   await page.screenshot({path:'faq-parity/'+kind+'-'+width+'-open.png',fullPage:false,animations:'disabled'});
   report.screens.push(m);
  }catch(err){
   report.screens.push({kind,width,error:String(err)});
   if(kind==='clone')throw err;
  }finally{await page.close()}
 }
}
for(const width of [1918,390]){
 const src=report.screens.find(x=>x.kind==='original'&&x.width===width);
 const c=report.screens.find(x=>x.kind==='clone'&&x.width===width);
 if(!src?.heading||!c?.heading)continue;
 report.summary[width]={};
 for(const key of ['heading','subtitle','firstTab','secondTab','firstGroup','firstQuestion','secondQuestion']){
  if(src[key]&&c[key]){
   report.summary[width][key]=Object.fromEntries(['x','y','width','height'].map(dim=>[dim,Math.round((c[key][dim]-src[key][dim])*10)/10]));
  }
 }
}
writeFileSync('faq-parity/metrics.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2).slice(0,14000));
await browser.close();
