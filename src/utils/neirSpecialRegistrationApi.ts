// Shared Special Registration transport for the existing citizen-profile workflow.
// The API records the document checklist, not uploaded identity documents.
const ENDPOINT = 'https://wjsdylxbvdnraztktbtg.supabase.co/functions/v1/neir-prototype-special';

export type SpecialApplication = {
  id: string;
  imei: string;
  reason: string;
  status: 'Pending'|'In Progress'|'Accepted'|'Rejected';
  arrivalDate: string;
  appliedAt: string;
  updatedAt: string;
  remarks: string;
};
export async function neirSpecialRequest<T>(action:string,payload:Record<string,unknown>={}):Promise<T>{
  let response:Response;
  try{
    response=await fetch(ENDPOINT,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action,...payload})
    });
  }catch{
    throw new Error('Unable to connect to Special Registration. Please retry.');
  }
  const result=await response.json().catch(()=>({})) as {error?:string};
  if(!response.ok)throw new Error(result.error||'Special Registration request failed.');
  return result as T;
}
export async function submitNeirSpecialRegistration(input:{
  imei:string;reason:string;arrivalDate:string;mobile:string;
  passportNumber:string;files:Record<string,File>;
}):Promise<{record:{id:string;imei:string;status:string};message:string}>{
  const documents=Object.keys(input.files);
  return neirSpecialRequest('submit',{
    imei:input.imei,reason:input.reason,
    arrivalDate:input.arrivalDate,mobile:input.mobile,documents
  });
}
export async function listCitizenSpecialRegistrations(mobile:string):Promise<SpecialApplication[]>{
  const response=await neirSpecialRequest<{items:SpecialApplication[]}>('citizen_list',{mobile});
  return response.items;
}
