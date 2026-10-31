// Restricted to synthetic NEIR presentation accounts. This is not citizen authentication.
const PROJECT_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
function cors(origin: string | null): Record<string, string> {
  const trusted = origin === 'https://neir-citizen-ux-demo.vercel.app' ||
    origin === 'https://shihab-tech04.github.io' ||
    (origin !== null && /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/.test(origin));
  return {
    ...(trusted ? {'Access-Control-Allow-Origin': origin!} : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}
Deno.serve(async (req: Request) => {
  const headers = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (req.method !== 'POST') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
  let mobile: unknown;
  let password: unknown;
  try {
    const payload = await req.json();
    mobile = payload?.mobile;
    password = payload?.password;
  } catch {
    return new Response(JSON.stringify({error:'Invalid request'}), {status:400,headers});
  }
  const invalid = JSON.stringify({error:'Incorrect mobile number or password.'});
  if (typeof mobile !== 'string' || !/^01\d{9}$/.test(mobile) ||
      typeof password !== 'string' || password.length === 0 || password.length > 128) {
    return new Response(invalid,{status:401,headers});
  }
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({error:'Demo sign-in is temporarily unavailable.'}), {status:503,headers});
  }
  try {
    const result = await fetch(PROJECT_URL + '/rest/v1/rpc/verify_neir_demo_login', {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SERVICE_ROLE_KEY,'Authorization':'Bearer '+SERVICE_ROLE_KEY},
      body:JSON.stringify({p_mobile:mobile,p_password:password}),
    });
    if (!result.ok) {
      console.error('Demo login query failed with HTTP',result.status);
      return new Response(JSON.stringify({error:'Demo sign-in is temporarily unavailable.'}),{status:503,headers});
    }
    const matched = await result.json();
    const citizen = Array.isArray(matched) ? matched[0] : null;
    if (!citizen) return new Response(invalid,{status:401,headers});
    return new Response(JSON.stringify({mobile:citizen.mobile,name:citizen.display_name}),{status:200,headers});
  } catch (error) {
    console.error('Demo login service unavailable',error instanceof Error?error.name:'Error');
    return new Response(JSON.stringify({error:'Demo sign-in is temporarily unavailable.'}),{status:503,headers});
  }
});
