// Synthetic NEIR demonstration only. All decisions persist in the isolated NEIR-demo project.
// No government NEIR endpoint is called; service-role credentials are never returned to browsers.
const URL = Deno.env.get('SUPABASE_URL') || '';
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const enc = new TextEncoder();
const allowedOrigin = (o:string|null) => !!o && (o==='https://shihab-tech04.github.io' || o==='https://neir-citizen-ux-demo.vercel.app' || /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/.test(o));
const cors = (o:string|null) => ({
  ...(allowedOrigin(o)?{'Access-Control-Allow-Origin':o!}:{}),
  'Access-Control-Allow-Headers':'content-type,authorization,apikey,x-client-info',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Access-Control-Max-Age':'600',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Vary':'Origin','Content-Type':'application/json; charset=utf-8'
});
const json = (data:unknown,status=200,o:string|null=null)=>new Response(JSON.stringify(data),{status,headers:cors(o)});
const b64 = (v:Uint8Array)=>btoa(Array.from(v,x=>String.fromCharCode(x)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64 = (v:string)=>new Uint8Array(Array.from(atob(v.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-v.length%4)%4)),x=>x.charCodeAt(0)));
const hmac = async()=>{
  if(!KEY)throw Error('Service unavailable');
  return crypto.subtle.importKey('raw',enc.encode(KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
};
const issueToken=async(role:'citizen'|'reviewer',sub:string,name:string)=>{
  const payload=b64(enc.encode(JSON.stringify({v:1,role,sub,name,exp:Math.floor(Date.now()/1000)+3600})));
  const signature=await crypto.subtle.sign('HMAC',await hmac(),enc.encode(payload));
  return payload+'.'+b64(new Uint8Array(signature));
};
const verifyToken=async(token:unknown,role:'citizen'|'reviewer')=>{
  if(typeof token!=='string'||token.length>3000)throw Error('Sign in again to continue.');
  const [body,sig,extra]=token.split('.');
  if(!body||!sig||extra)throw Error('Sign in again to continue.');
  const ok=await crypto.subtle.verify('HMAC',await hmac(),unb64(sig),enc.encode(body));
  if(!ok)throw Error('Sign in again to continue.');
  const payload=JSON.parse(new TextDecoder().decode(unb64(body)));
  if(payload.v!==1||payload.role!==role||typeof payload.sub!=='string'||!Number.isInteger(payload.exp)||payload.exp<Math.floor(Date.now()/1000))throw Error('Session expired. Please sign in again.');
  return payload as {role:string;sub:string;name:string;exp:number};
};
const db=async(path:string,method='GET',body?:unknown)=>{
  const resp=await fetch(URL+'/rest/v1/'+path,{method,headers:{
    'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json',
    'Accept':'application/json','Prefer':'return=representation'
  },...(body===undefined?{}:{body:JSON.stringify(body)})});
  const raw=await resp.text();
  if(!resp.ok){console.error('Special Registration DB error',resp.status,raw.slice(0,350));throw Error('Registration database operation failed.');}
  return raw?JSON.parse(raw):null;
};
const allowed:Record<string,string[]>={
  'airmail':['courierBill','packingList','commercialInvoice'],
  'gift':['donorPassport','donorArrivalSeal','imeiBox','giftDeed'],
  'foreign-tour':['passportInfo','arrivalSeal','imeiBox','travelDocument']
};
const required:Record<string,string[]>={
  'airmail':['commercialInvoice'],
  'gift':['donorPassport','donorArrivalSeal','imeiBox','giftDeed'],
  'foreign-tour':['passportInfo','arrivalSeal','imeiBox']
};
const mime=['application/pdf','image/png','image/jpeg'];
const publicRecord=(r:Record<string,unknown>)=>({
  id:r.id,imei:r.imei,reason:r.reason,status:r.status,
  arrivalDate:r.arrival_date,appliedAt:r.submitted_at,
  updatedAt:r.updated_at,remarks:r.reviewer_remarks
});
const adminRecord=(r:Record<string,unknown>)=>({
  id:r.id,sl:0,imei:r.imei,brand:'',model:'Handset',
  category:r.reason==='airmail'?'Air Mail':r.reason==='gift'?'Gift':'Foreign Tour',
  requesterName:r.citizen_name,requesterNid:'—',
  citizenMobile:r.citizen_mobile,arrivalDate:r.arrival_date,
  status:r.status,remarks:r.reviewer_remarks,date:r.submitted_at,
  documents:[],reason:r.reason
});
const storage=async(path:string,bytes:Uint8Array,mimetype:string)=>{
  const resp=await fetch(URL+'/storage/v1/object/neir-special-documents/'+path,{
    method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':mimetype,'x-upsert':'false'},
    body:bytes
  });
  if(!resp.ok)throw Error('Document upload failed. Please retry.');
};
const removeStorage=async(paths:string[])=>{
  if(paths.length===0)return;
  const resp=await fetch(URL+'/storage/v1/object/neir-special-documents',{
    method:'DELETE',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
    body:JSON.stringify({prefixes:paths})
  });
  if(!resp.ok)console.error('Failed to clean unfinished registration upload',resp.status);
};
const signedDoc=async(path:string)=>{
  const resp=await fetch(URL+'/storage/v1/object/sign/neir-special-documents/'+path,{
    method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
    body:JSON.stringify({expiresIn:300})
  });
  if(!resp.ok)throw Error('Could not open private document.');
  const r=await resp.json();
  const signed=r.signedURL||r.signedUrl;
  return signed?(signed.startsWith('http')?signed:URL+'/storage/v1'+signed):null;
};
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=='POST')return json({error:'Method not allowed'},405,origin);
  if(!URL||!KEY)return json({error:'Registration service unavailable'},503,origin);
  try{
    const payload=await req.json();
    const action=payload?.action;
    if(action==='citizen_login'){
      const mobile=payload.mobile,password=payload.password;
      if(typeof mobile!=='string'||!/^01\d{9}$/.test(mobile)||typeof password!=='string'||password.length<1||password.length>128)
        return json({error:'Incorrect mobile number or password.'},401,origin);
      const found=await db('rpc/verify_neir_demo_login','POST',{p_mobile:mobile,p_password:password});
      const user=Array.isArray(found)?found[0]:null;
      if(!user)return json({error:'Incorrect mobile number or password.'},401,origin);
      return json({mobile:user.mobile,name:user.display_name,token:await issueToken('citizen',user.mobile,user.display_name)},200,origin);
    }
    if(action==='reviewer_login'){
      const username=payload.username,password=payload.password;
      if(typeof username!=='string'||username.length>80||typeof password!=='string'||password.length<1||password.length>128)
        return json({error:'Invalid reviewer credentials.'},401,origin);
      const found=await db('rpc/verify_neir_special_reviewer','POST',{p_username:username,p_password:password});
      const user=Array.isArray(found)?found[0]:null;
      if(!user)return json({error:'Invalid reviewer credentials or account temporarily locked.'},401,origin);
      return json({name:user.display_name,username:user.username,token:await issueToken('reviewer',user.username,user.display_name)},200,origin);
    }
    if(action==='citizen_list'){
      const citizen=await verifyToken(payload.token,'citizen');
      const rows=await db('neir_special_registrations?select=id,imei,reason,status,arrival_date,submitted_at,updated_at,reviewer_remarks&citizen_mobile=eq.'+encodeURIComponent(citizen.sub)+'&order=submitted_at.desc');
      return json({items:rows.map(publicRecord)},200,origin);
    }
    if(action==='submit'){
      const citizen=await verifyToken(payload.token,'citizen');
      const imei=payload.imei,reason=payload.reason,arrival=payload.arrivalDate,passport=payload.passportNumber||'';
      const docs=payload.documents;
      if(typeof imei!=='string'||! /^\d{14,15}$/.test(imei)||!allowed[reason]||typeof arrival!=='string'||
        !/^\d{4}-\d{2}-\d{2}$/.test(arrival)||arrival>new Date().toISOString().slice(0,10)||
        (reason==='foreign-tour'&&(!passport||typeof passport!=='string'))||
        !Array.isArray(docs)||docs.length>4||docs.length===0)
        return json({error:'Check your IMEI, arrival information and required attachments.'},400,origin);
      const types=docs.map((d:any)=>d?.type);
      if(new Set(types).size!==docs.length||types.some((x:string)=>!allowed[reason].includes(x))||
        required[reason].some((r:string)=>!types.includes(r)))
        return json({error:'Required document checklist is incomplete.'},400,origin);
      const already=await db('neir_special_registrations?select=id,status&citizen_mobile=eq.'+encodeURIComponent(citizen.sub)+'&imei=eq.'+imei);
      if(already.length)return json({error:'You have already applied for Special Registration for this IMEI.',record:already[0]},409,origin);
      const appId=crypto.randomUUID();
      const paths:string[]=[];
      const docRows:any[]=[];
      try{
        for(const d of docs){
          if(typeof d?.name!=='string'||d.name.length<1||d.name.length>180||
            !mime.includes(d.mime)||typeof d.data!=='string'||d.data.length>1450000||
            !Number.isInteger(d.size)||d.size<1||d.size>1048576)
            throw Error('Invalid attachment format or size.');
          const binary=unb64(d.data);
          if(binary.length!==d.size)throw Error('Invalid uploaded file size.');
          const pdf=d.mime==='application/pdf'&&binary[0]===37&&binary[1]===80&&binary[2]===68&&binary[3]===70;
          const png=d.mime==='image/png'&&binary[0]===137&&binary[1]===80&&binary[2]===78&&binary[3]===71;
          const jpg=d.mime==='image/jpeg'&&binary[0]===255&&binary[1]===216&&binary[2]===255;
          if(!pdf&&!png&&!jpg)throw Error('Uploaded file content does not match its type.');
          const path=appId+'/'+d.type+'-'+crypto.randomUUID();
          await storage(path,binary,d.mime);
          paths.push(path);
          docRows.push({type:d.type,name:d.name,mime:d.mime,size:d.size,path});
        }
        const posted=await db('rpc/submit_neir_special_registration','POST',{
          p_id:appId,p_mobile:citizen.sub,p_name:citizen.name,p_imei:imei,
          p_reason:reason,p_arrival:arrival,p_passport:passport,p_documents:docRows
        });
        return json({record:{id:appId,status:'Pending',imei,submittedAt:posted?.[0]?.submitted_at},message:'Special Registration submitted for review.'},201,origin);
      }catch(err){
        await removeStorage(paths);
        throw err;
      }
    }
    const reviewer=await verifyToken(payload.token,'reviewer');
    if(action==='admin_list'){
      const rows=await db('neir_special_registrations?select=id,imei,reason,citizen_name,citizen_mobile,arrival_date,status,submitted_at,reviewer_remarks,updated_at&order=submitted_at.desc&limit=1000');
      return json({items:rows.map(adminRecord)},200,origin);
    }
    if(action==='admin_details'){
      if(typeof payload.id!=='string'||!/^[0-9a-f-]{36}$/.test(payload.id))return json({error:'Invalid application ID'},400,origin);
      const rows=await db('neir_special_registrations?select=*&id=eq.'+encodeURIComponent(payload.id));
      if(!rows.length)return json({error:'Application not found'},404,origin);
      const docs=await db('neir_special_documents?select=*&registration_id=eq.'+encodeURIComponent(payload.id)+'&order=uploaded_at.asc');
      const files=[];
      for(const d of docs){
        files.push({id:d.id,type:d.document_type,title:d.document_type,filename:d.file_name,
          name:d.file_name,size:(d.size_bytes/1024).toFixed(1)+' KB',
          date:d.uploaded_at,uri:await signedDoc(d.storage_path)});
      }
      return json({record:{...adminRecord(rows[0]),documents:files}},200,origin);
    }
    if(action==='admin_update'){
      if(typeof payload.id!=='string'||!/^[0-9a-f-]{36}$/.test(payload.id)||!['In Progress','Accepted','Rejected'].includes(payload.status)||
         typeof payload.remarks!=='string'||payload.remarks.length>2000)
        return json({error:'Invalid review action'},400,origin);
      const changed=await db('rpc/review_neir_special_registration','POST',{
        p_id:payload.id,p_reviewer:reviewer.sub,p_status:payload.status,p_remarks:payload.remarks
      });
      return json({record:changed?.[0]},200,origin);
    }
    return json({error:'Unsupported registration operation'},400,origin);
  }catch(err){
    const msg=err instanceof Error?err.message:'Unexpected error';
    if(msg.includes('Sign in again')||msg.includes('Session expired'))return json({error:msg},401,origin);
    if(msg.startsWith('Invalid uploaded')||msg.startsWith('Invalid attachment'))return json({error:msg},400,origin);
    console.error('Special Registration operation failed',msg);
    return json({error:'Unable to complete this Special Registration request. Please retry.'},503,origin);
  }
});