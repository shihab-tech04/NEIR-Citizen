// Shared Citizen/Admin Special Registration workflow.
// Stores the existing citizen mobile for per-citizen quota and history.
// Attachment bytes remain outside this checklist-only lane.
const URL = Deno.env.get('SUPABASE_URL') || '';
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const origins = new Set([
  'https://shihab-tech04.github.io',
  'https://neir-citizen-ux-demo.vercel.app'
]);
function cors(origin:string|null){
  const allowed=origin && (origins.has(origin)||/^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/.test(origin));
  return { ...(allowed?{'Access-Control-Allow-Origin':origin}:{}),
    'Access-Control-Allow-Methods':'POST,OPTIONS',
    'Access-Control-Allow-Headers':'content-type,authorization,apikey,x-client-info',
    'Vary':'Origin','Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'
  };
}
const json=(value:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(value),{status,headers:cors(origin)});
const requestDB=async(path:string,method='GET',body?:unknown)=>{
  const res=await fetch(URL+'/rest/v1/'+path,{method,headers:{
    apikey:KEY,Authorization:'Bearer '+KEY,
    'Content-Type':'application/json','Prefer':'return=representation'
  },...(body===undefined?{}:{body:JSON.stringify(body)})});
  const payload=await res.text();
  if(!res.ok) {
    console.error('Special Registration SQL operation',res.status,payload.slice(0,240));
    if(payload.includes('SPECIAL_REGISTRATION_LIMIT_REACHED'))
      throw new Error('The limit is 20 active applications. Another IMEI can be submitted after an existing application is accepted.');
    const conflict=res.status===409||payload.includes('"23505"')||payload.includes('already has');
    throw new Error(conflict?'This IMEI already has a Special Registration application.':'Unable to save Special Registration. Please retry.');
  }
  return payload?JSON.parse(payload):null;
};
const reasons:Record<string,string>={'airmail':'Air Mail','gift':'Gift','foreign-tour':'Foreign Tour'};
const publicRow=(r:any)=>({
  id:r.id,imei:r.imei,reason:r.reason,category:reasons[r.reason]||r.reason,
  status:r.status,arrivalDate:r.arrival_date,
  submittedAt:r.submitted_at,appliedAt:r.submitted_at,
  updatedAt:r.updated_at,remarks:r.remarks,
  documents:Array.isArray(r.documents)?r.documents:[]
});
const adminRow=(r:any)=>({
  ...publicRow(r),sl:0,date:r.submitted_at,
  brand:'',model:'Handset',requesterName:'',requesterNid:'',
  customsChallanNo:'',attachments:Array.isArray(r.documents)?r.documents:[],
});

const titles:Record<string,string>={
 commercialInvoice:'Commercial Invoice',courierBill:'Courier Bill',packingList:'Packing List',
 donorPassport:'Donor Passport',donorArrivalSeal:'Arrival Seal',imeiBox:'IMEI Box',
 giftDeed:'Gift Deed',passportInfo:'Passport Information',
 arrivalSeal:'Arrival Seal',travelDocument:'Travel Document'
};
const signedDocument=async(path:string)=>{
  const resp=await fetch(URL+'/storage/v1/object/sign/neir-special-documents/'+path,{
    method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
    body:JSON.stringify({expiresIn:90})
  });
  if(!resp.ok)throw Error('Unable to open uploaded file.');
  const result=await resp.json();
  const signed=result.signedURL||result.signedUrl;
  if(typeof signed!=='string'||!signed)throw Error('Unable to open uploaded file.');
  return signed.startsWith('https://')?signed:URL+'/storage/v1'+signed;
};


const allowedFiles:Record<string,string[]>={
 airmail:['commercialInvoice','courierBill','packingList'],
 gift:['donorPassport','donorArrivalSeal','imeiBox','giftDeed'],
 'foreign-tour':['passportInfo','arrivalSeal','imeiBox','travelDocument']
};
const base64Bytes=(str:string)=>Uint8Array.from(atob(str),x=>x.charCodeAt(0));
const fileMatches=(v:Uint8Array,m:string)=>
 m==='application/pdf'?v[0]===37&&v[1]===80&&v[2]===68&&v[3]===70:
 m==='image/png'?v[0]===137&&v[1]===80&&v[2]===78&&v[3]===71:
 m==='image/jpeg'&&v[0]===255&&v[1]===216&&v[2]===255;
const uploadPrivate=async(path:string,data:Uint8Array,mime:string)=>{
 const response=await fetch(URL+'/storage/v1/object/neir-special-documents/'+path,{
  method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,
  'Content-Type':mime,'x-upsert':'false'},body:data});
 if(!response.ok)throw Error('Uploaded document could not be saved.');
};
const cleanupPrivate=async(paths:string[])=>{
 if(!paths.length)return;
 const response=await fetch(URL+'/storage/v1/object/neir-special-documents',{
  method:'DELETE',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
  body:JSON.stringify({prefixes:paths})
 });
 if(!response.ok)console.error('Unfinished Special Registration files could not be cleaned',response.status);
};

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=='POST')return json({error:'Method not allowed'},405,origin);
  if(!URL||!KEY)return json({error:'Special Registration service unavailable'},503,origin);
  try{
    if(Number(req.headers.get('content-length')||0)>6000000)
      return json({error:'Request is too large'},413,origin);
    const bodyText=await req.text();
    if(bodyText.length>6000000)return json({error:'Request is too large'},413,origin);
    const payload=JSON.parse(bodyText);
    if(!payload || typeof payload.action!=='string')return json({error:'Missing action'},400,origin);
    const action=payload.action;
    if(action==='list' || action==='admin_list' || action==='citizen_list'){
      const citizen=action==='citizen_list';
      if(citizen && (typeof payload.mobile!=='string'||!/^01\d{9}$/.test(payload.mobile)))
        return json({error:'Select a citizen account to view registrations.'},400,origin);
      const filtered=citizen?'&citizen_mobile=eq.'+encodeURIComponent(payload.mobile):'';
      const rows=await requestDB('neir_prototype_special_applications?select=id,citizen_mobile,imei,reason,status,arrival_date,remarks,documents,submitted_at,updated_at&order=submitted_at.desc'+filtered+'&limit=500');
      return json({items:rows.map(action==='admin_list'?adminRow:publicRow)},200,origin);
    }
    if(action==='get'||action==='admin_details'){
      if(typeof payload.id!=='string'||!/^[a-f0-9-]{36}$/i.test(payload.id))
        return json({error:'Invalid application'},400,origin);
      const rows=await requestDB('neir_prototype_special_applications?select=id,citizen_mobile,imei,reason,status,arrival_date,remarks,documents,submitted_at,updated_at&id=eq.'+encodeURIComponent(payload.id));
      if(!rows.length)return json({error:'Application not found'},404,origin);
      const row=adminRow(rows[0]);
      // Mirror the exact documents already stored by the earlier Citizen upload flow.
      // A matching UUID alone is insufficient: also verify the submitted IMEI.
      const legacy=await requestDB('neir_special_registrations?select=id,imei&id=eq.'+encodeURIComponent(payload.id));
      const existing=legacy[0]?.imei===row.imei
        ?await requestDB('neir_special_documents?select=id,document_type,file_name,mime_type,size_bytes,storage_path,uploaded_at&registration_id=eq.'+encodeURIComponent(payload.id)+'&order=uploaded_at.asc')
        :[];
      const matchingFiles=new Map(existing.map((d:any)=>[d.document_type,d]));
      const manifest=Array.isArray(row.documents)?row.documents:[];
      const documents=await Promise.all(manifest.map(async(item:any,index:number)=>{
        const type=typeof item==='string'?item:item.type;
        const legacyDoc=matchingFiles.get(type) as any;
        const saved=typeof item==='object'&&item?.path?item:null;
        const path=saved?.path||legacyDoc?.storage_path;
        const filename=saved?.name||legacyDoc?.file_name;
        const size=saved?.size||legacyDoc?.size_bytes;
        return {id:saved?.path||legacyDoc?.id||String(index+1),type,title:titles[type]||type,
          checked:true,available:!!path,filename,
          size:size?(Number(size)/1024).toFixed(1)+' KB':undefined,
          date:saved?.date||legacyDoc?.uploaded_at,
          mime:saved?.mime||legacyDoc?.mime_type,
          ...(path?{uri:await signedDocument(path)}:{})
        };
      }));
      return json({record:{...row,documents}},200,origin);
    }
    if(action==='submit'){
      const {mobile,imei,reason,arrivalDate,files}=payload;
      if(typeof mobile!=='string'||!/^01\d{9}$/.test(mobile)||
        typeof imei!=='string'||!/^[0-9]{14,15}$/.test(imei)||
        typeof reason!=='string'||!allowedFiles[reason]||
        typeof arrivalDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate)||
        arrivalDate>new Date().toISOString().slice(0,10)||
        !Array.isArray(files)||files.length<1||files.length>8||
        files.length>allowedFiles[reason].length)
        return json({error:'Complete the IMEI, arrival information and uploaded documents.'},400,origin);
      const selected=files.map((f:any)=>f?.type);
      if(new Set(selected).size!==selected.length||
        selected.some((type:string)=>!allowedFiles[reason].includes(type))||
        (reason==='airmail'&&!selected.includes('commercialInvoice'))||
        (reason==='gift'&&['donorPassport','donorArrivalSeal','imeiBox','giftDeed'].some(type=>!selected.includes(type)))||
        (reason==='foreign-tour'&&['passportInfo','arrivalSeal','imeiBox'].some(type=>!selected.includes(type))))
        return json({error:'Required uploaded documents are missing.'},400,origin);
      const requestId=crypto.randomUUID(),paths:string[]=[],manifest:any[]=[];
      try{
        for(const f of files){
          if(typeof f?.name!=='string'||f.name.length<1||f.name.length>180||
            !['application/pdf','image/jpeg','image/png'].includes(f.mime)||
            typeof f.data!=='string'||f.data.length>1450000||
            !Number.isInteger(f.size)||f.size<1||f.size>1048576)
            throw Error('Invalid uploaded attachment.');
          const bytes=base64Bytes(f.data);
          if(bytes.length!==f.size||!fileMatches(bytes,f.mime))
            throw Error('Uploaded file content does not match the selected file.');
          const path='prototype/'+requestId+'/'+f.type+'-'+crypto.randomUUID();
          await uploadPrivate(path,bytes,f.mime);
          paths.push(path);
          manifest.push({type:f.type,name:f.name,mime:f.mime,size:f.size,path});
        }
        const rows=await requestDB('rpc/neir_prototype_submit_special_citizen_files','POST',{
          p_mobile:mobile,p_imei:imei,p_reason:reason,p_arrival:arrivalDate,
          p_document_types:selected,p_files:manifest
        });
        return json({record:{id:rows[0].id,imei,status:rows[0].status,submittedAt:rows[0].submitted_at},
          message:'Special Registration submitted successfully.'},201,origin);
      }catch(err){await cleanupPrivate(paths);throw err;}
    }
    if(action==='update'||action==='admin_update'){
      if(typeof payload.id!=='string'||!/^[a-f0-9-]{36}$/i.test(payload.id)||
        !['In Progress','Accepted','Rejected'].includes(payload.status)||
        typeof payload.remarks!=='string'||payload.remarks.length>2000)
        return json({error:'Check your review status and remarks.'},400,origin);
      const rows=await requestDB('rpc/neir_prototype_update_special','POST',{
        p_id:payload.id,p_status:payload.status,p_remarks:payload.remarks
      });
      return json({record:rows[0]},200,origin);
    }
    return json({error:'Unknown Special Registration action'},400,origin);
  }catch(err){
    const message=err instanceof Error?err.message:'Unexpected error';
    if(message.includes('already has')||message.includes('limit is 20'))return json({error:message},409,origin);
    if(message.includes('Request is too large'))return json({error:message},413,origin);
    if(message.includes('Invalid uploaded')||message.includes('file content'))return json({error:message},400,origin);
    console.error('Special Registration endpoint:',message);
    return json({error:'Special Registration operation could not be completed. Please retry.'},503,origin);
  }
});