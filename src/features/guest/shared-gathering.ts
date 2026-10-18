import { createClient } from '@supabase/supabase-js';
import type { VenueExperience } from '../../types/left-domain';
import { gatheringCode } from './gathering-links';
function makePublicClient() { return createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!,process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(10000)})}}); }
let publicClient:ReturnType<typeof makePublicClient>|null=null;
export async function fetchSharedGathering(id:string):Promise<VenueExperience|null> {
  gatheringCode(id); // Validate before a network call.
  if(!publicClient) publicClient=makePublicClient();
  const {data,error}=await publicClient.rpc('get_shared_gathering',{p_experience_id:id});
  if(error)throw new Error('This gathering could not be loaded. Please try again.');
  if(!data)return null;
  return {...data,hostUserId:'',hostFirstName:'Host',viewerAttending:false} as VenueExperience;
}
