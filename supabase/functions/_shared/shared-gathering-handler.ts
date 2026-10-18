import { gatheringId } from '../../../src/features/guest/gathering-links.ts';
import { gatheringPage } from './gathering-page.ts';
type Plan=Parameters<typeof gatheringPage>[0];
export async function sharedGatheringResponse(req:Request,read:(id:string)=>Promise<Plan|null>,downloadUrl?:string) {
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
    'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"};
  if(req.method!=='GET')return new Response('GET required',{status:405,headers:{...headers,Allow:'GET'}});
  const url=new URL(req.url),code=url.pathname.split('/').filter(Boolean).at(-1) ?? '',id=gatheringId(code);
  if(!id || url.search)return new Response('Gathering unavailable',{status:404,headers});
  try{
    const data=await read(id);
    if(!data)return new Response('This gathering is no longer available',{status:404,headers});
    return new Response(gatheringPage(data,code,downloadUrl),{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
  }catch{return new Response('Temporarily unavailable',{status:503,headers});}
}
