import { isUuid } from "../../lib/validation";
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export function gatheringCode(id:string) {
  if(!isUuid(id)) throw new Error('Invalid gathering ID');
  const bytes=id.replaceAll('-','').match(/../g)!.map(x=>parseInt(x,16));
  let bits=0,value=0,result='';
  for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=6){bits-=6;result+=alphabet[(value>>>bits)&63];}}
  if(bits)result+=alphabet[(value<<(6-bits))&63];
  return result;
}
export function gatheringId(code:string):string|null {
  if(!/^[A-Za-z0-9_-]{22}$/.test(code))return null;
  let bits=0,value=0,hex='';
  for(const character of code){value=(value<<6)|alphabet.indexOf(character);bits+=6;if(bits>=8){bits-=8;hex+=((value>>>bits)&255).toString(16).padStart(2,'0');}}
  const id=`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  return isUuid(id) && gatheringCode(id)===code ? id : null;
}
export function shareOrigin(value?:string):string|null {
  try { const url=new URL(value || '');return url.protocol==='https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname==='/' ? url.origin : null; }catch{return null;}
}
export function parseGatheringLink(value:string,base?:string):string|null {
  try{
    const url=new URL(value);
    if(url.username || url.password || url.search || url.hash)return null;
    const path=url.protocol==='left:' && url.hostname==='g' ? `/g${url.pathname}` : url.origin===shareOrigin(base) ? url.pathname : '';
    const match=path.match(/^\/g\/([A-Za-z0-9_-]{22})$/);
    return match ? gatheringId(match[1]) : null;
  }catch{return null;}
}
export function approvedGatheringUrl(plan:{id:string;status:string;starts_at:string},base?:string,now=Date.now()) {
  const origin=shareOrigin(base);
  if(!origin || plan.status!=='published' || !(Date.parse(plan.starts_at)>now) || !isUuid(plan.id))return null;
  return `${origin}/g/${gatheringCode(plan.id)}`;
}
