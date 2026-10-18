// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2.106.2';
import { sharedGatheringResponse } from '../_shared/shared-gathering-handler.ts';
Deno.serve(req=>sharedGatheringResponse(req,async id=>{
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(5000)})}});
  const {data,error}=await client.rpc('get_shared_gathering',{p_experience_id:id});
  if(error)throw new Error('Public preview unavailable');
  return data;
},Deno.env.get('LEFT_DOWNLOAD_URL')));
