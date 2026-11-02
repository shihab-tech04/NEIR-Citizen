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
  ...publicRow(r),sl:0,date:r.submitted_at,citizenMobile:r.citizen_mobile,
  brand:'',model:'Handset',requesterName:r.citizen_mobile,requesterNid:'',
  customsChallanNo:'',attachments:Array.isArray(r.documents)?r.documents:[],
});
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=='POST')return json({error:'Method not allowed'},405,origin);
  if(!URL||!KEY)return json({error:'Special Registration service unavailable'},503,origin);
  try{
    if(Number(req.headers.get('content-length')||0)>10240)
      return json({error:'Request is too large'},413,origin);
    const payload=await req.json();
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
      // A checklist is persisted, not the uploaded files or private identity data.
      return json({record:{...row,documents:row.documents.map((type:string,index:number)=>({
        id:String(index+1),type,title:{
          commercialInvoice:'Commercial Invoice',courierBill:'Courier Bill',packingList:'Packing List',
          donorPassport:'Donor Passport',donorArrivalSeal:'Arrival Seal',imeiBox:'IMEI Box',
          giftDeed:'Gift Deed',passportInfo:'Passport Information',
          arrivalSeal:'Arrival Seal',travelDocument:'Travel Document'
        }[type]||type,checked:true
      }))}},200,origin);
    }
    if(action==='submit'){
      const mobile=payload.mobile,imei=payload.imei,reason=payload.reason,arrivalDate=payload.arrivalDate,docTypes=payload.documents;
      if(typeof mobile!=='string'||!/^01\d{9}$/.test(mobile)||
        typeof imei!=='string'||!/^[0-9]{14,15}$/.test(imei)||
        !Object.prototype.hasOwnProperty.call(reasons,reason)||
        typeof arrivalDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate)||
        arrivalDate>new Date().toISOString().slice(0,10)||
        !Array.isArray(docTypes)||docTypes.length>8||docTypes.some((d:unknown)=>typeof d!=='string'))
        return json({error:'Complete the IMEI, arrival information and required documents.'},400,origin);
      const rows=await requestDB('rpc/neir_prototype_submit_special_citizen','POST',{
        p_mobile:mobile,p_imei:imei,p_reason:reason,p_arrival:arrivalDate,p_documents:docTypes
      });
      return json({record:{id:rows[0].id,imei,status:rows[0].status,submittedAt:rows[0].submitted_at},
        message:'Special Registration submitted successfully.'},201,origin);
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
    console.error('Special Registration endpoint:',message);
    return json({error:'Special Registration operation could not be completed. Please retry.'},503,origin);
  }
});