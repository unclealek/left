import {createClient} from '@supabase/supabase-js';
import {expect,it,vi} from 'vitest';
it('the installed SDK attaches the active session token to functions.invoke',async()=>{
 const fetcher=vi.fn().mockResolvedValue(new Response('{}',{headers:{'Content-Type':'application/json'}}));
 const client=createClient('https://example.supabase.co','public-anon-key',{
  accessToken:async()=>'signed-in-session-token',global:{fetch:fetcher},
 });
 await client.functions.invoke('get-popular-times',{body:{placeId:'ChIJtest',placeUrl:'https://www.google.com/maps/test'}});
 const headers=new Headers(fetcher.mock.calls[0][1].headers);
 expect(headers.get('Authorization')).toBe('Bearer signed-in-session-token');
 expect(headers.get('apikey')).toBe('public-anon-key');
});
