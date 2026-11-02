// Shared Special Registration transport for the existing citizen-profile workflow.
// Submitted document bytes are persisted in the shared private file store, keyed by application.
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
  const entries = Object.entries(input.files);
  if (entries.length < 1 || entries.length > 8)
    throw new Error('Attach the required documents before submitting.');
  // Preserve the citizen's exact selected files (name, type and bytes), not a checklist.
  const files = await Promise.all(entries.map(async ([type, file]) => {
    if (!file || file.size < 1 || file.size > 1024 * 1024 ||
        !['application/pdf','image/jpeg','image/png'].includes(file.type))
      throw new Error('Each attachment must be a JPG, PNG or PDF of at most 1 MB.');
    const data = await new Promise<string>((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read the selected document. Please retry.'));
      reader.readAsDataURL(file);
    });
    if (!data) throw new Error('Could not read the selected document. Please retry.');
    return { type, name:file.name, mime:file.type, size:file.size, data };
  }));
  return neirSpecialRequest('submit',{
    imei:input.imei,reason:input.reason,
    arrivalDate:input.arrivalDate,mobile:input.mobile,files
  });
}
export async function listCitizenSpecialRegistrations(mobile:string):Promise<SpecialApplication[]>{
  const response=await neirSpecialRequest<{items:SpecialApplication[]}>('citizen_list',{mobile});
  return response.items;
}
