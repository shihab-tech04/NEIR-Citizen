// NEIR-demo application transport: opaque, short-lived sessions only.
// Neither this file nor any browser stores a service-role credential.
const ENDPOINT = 'https://wjsdylxbvdnraztktbtg.supabase.co/functions/v1/neir-special-registration';

export type SpecialApplication = {
  id: string; imei: string; reason: string; status: 'Pending'|'In Progress'|'Accepted'|'Rejected';
  arrivalDate: string; appliedAt: string; updatedAt: string; remarks: string;
};
export async function neirSpecialRequest<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action,...payload})
    });
  } catch {
    throw new Error('Unable to connect to the Special Registration service. Please retry.');
  }
  const raw = await response.json().catch(() => ({})) as {error?: string};
  if (!response.ok) throw new Error(raw.error || 'Special Registration request failed.');
  return raw as T;
}
function base64File(file: File): Promise<string> {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read ' + file.name));
    reader.onload = () => {
      const data = String(reader.result || '');
      const b64 = data.split(',')[1];
      b64 ? resolve(b64) : reject(new Error('Unable to encode ' + file.name));
    };
    reader.readAsDataURL(file);
  });
}
export async function submitNeirSpecialRegistration(input: {
  token: string; imei: string; reason: string; arrivalDate: string;
  passportNumber: string; files: Record<string, File>;
}): Promise<{record:{id:string;imei:string;status:string};message:string}> {
  const documents = await Promise.all(Object.entries(input.files).map(async ([type,file]) => ({
    type, name:file.name, mime:file.type, size:file.size, data:await base64File(file)
  })));
  return neirSpecialRequest('submit', {
    token: input.token,imei:input.imei,reason:input.reason,
    arrivalDate:input.arrivalDate,passportNumber:input.passportNumber,documents
  });
}
export async function listCitizenSpecialRegistrations(token: string): Promise<SpecialApplication[]> {
  const result=await neirSpecialRequest<{items:SpecialApplication[]}>('citizen_list',{token});
  return result.items;
}