import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPopularTimesSubscriptions } from './popular-times-subscription';
function setup() {
  let event: (payload:any) => void = () => {};
  let subscribed: (status:string) => void = () => {};
  const row = {place_id:'ChIJtest',status:'ready',has_data:true};
  const channel = {on:vi.fn((_kind,_filter,callback) => {event=callback;return channel;}),subscribe:vi.fn(callback => {subscribed=callback;return channel;})};
  const select = {eq:vi.fn(() => select),maybeSingle:vi.fn().mockResolvedValue({data:row,error:null})};
  const client = {channel:vi.fn(() => channel),removeChannel:vi.fn(),functions:{invoke:vi.fn().mockResolvedValue({data:{...row,status:'pending'},error:null})},from:vi.fn(() => ({select:() => select}))};
  return {client, row, event:(data:any) => event({new:data}), subscribed:() => subscribed('SUBSCRIBED'),store:createPopularTimesSubscriptions(client as unknown as SupabaseClient)};
}
const flush = async () => {await Promise.resolve();await Promise.resolve();await Promise.resolve();};
describe('popular times realtime lifecycle', () => {
  it('shares the request and channel, updates ready, and releases the last listener', async () => {
    const s=setup(); const first=vi.fn();const second=vi.fn();
    const stop1=s.store.watch('ChIJtest','url',first);const stop2=s.store.watch('ChIJtest','url',second);
    await flush();expect(s.client.functions.invoke).toHaveBeenCalledTimes(1);
    s.event(s.row);expect(first).toHaveBeenLastCalledWith({data:s.row,status:'ready',hasData:true});expect(second).toHaveBeenLastCalledWith({data:s.row,status:'ready',hasData:true});
    stop1();expect(s.client.removeChannel).not.toHaveBeenCalled();stop2();expect(s.client.removeChannel).toHaveBeenCalledTimes(1);
  });
  it('does not let an old HTTP pending response overwrite a ready realtime event', async () => {
    const s=setup();let resolve:(value:any) => void = () => {};
    s.client.functions.invoke.mockImplementation(() => new Promise(r => {resolve=r;}));
    const listener=vi.fn();const stop=s.store.watch('ChIJtest','url',listener);
    s.event(s.row);resolve({data:{...s.row,status:'pending'},error:null});await flush();
    expect(listener).toHaveBeenLastCalledWith({data:s.row,status:'ready',hasData:true});stop();
  });
  it('reconciles on subscription to close the initial request/subscription gap', async () => {
    const s=setup();const listener=vi.fn();const stop=s.store.watch('ChIJtest','url',listener);
    await flush();s.subscribed();await flush();expect(listener).toHaveBeenLastCalledWith({data:s.row,status:'ready',hasData:true});stop();
  });
  it('renders failure without a retry loop', async () => {
    const s=setup();s.client.functions.invoke.mockResolvedValue({data:null,error:{message:'offline'}} as any);
    const listener=vi.fn();const stop=s.store.watch('ChIJtest','url',listener);await flush();
    expect(listener).toHaveBeenLastCalledWith({data:null,status:'failed',hasData:false});expect(s.client.functions.invoke).toHaveBeenCalledTimes(1);stop();
  });
  it('recovers a pending lease once at its deadline', async () => {
    vi.useFakeTimers();const s=setup();s.client.functions.invoke.mockResolvedValue({data:{...s.row,status:'pending',pending_until:new Date(Date.now()+1000).toISOString()},error:null} as any);
    const stop=s.store.watch('ChIJtest','url',vi.fn());await flush();await vi.advanceTimersByTimeAsync(2001);
    expect(s.client.functions.invoke).toHaveBeenCalledTimes(2);stop();vi.useRealTimers();
  });
});
it('refreshes active places on foreground and ignores completion after unmount', async () => {
  const s=setup();const listener=vi.fn();const stop=s.store.watch('ChIJtest','url',listener);await flush();
  s.store.refresh();await flush();expect(s.client.functions.invoke).toHaveBeenCalledTimes(2);
  stop();const count=listener.mock.calls.length;s.event(s.row);await flush();expect(listener).toHaveBeenCalledTimes(count);
});
it('handles a rejected network request and an unrelated realtime row', async () => {
  const s=setup();s.client.functions.invoke.mockRejectedValue(new Error('offline'));
  const listener=vi.fn();const stop=s.store.watch('ChIJtest','url',listener);await flush();
  expect(listener).toHaveBeenLastCalledWith({data:null,status:'failed',hasData:false});
  s.event({...s.row,place_id:'other'});expect(listener).toHaveBeenLastCalledWith({data:null,status:'failed',hasData:false});stop();
});
