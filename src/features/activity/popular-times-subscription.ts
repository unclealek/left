import type { SupabaseClient } from '@supabase/supabase-js';
import type { PopularTimesRow } from './popular-times-model';
export type PopularTimesState = {data: PopularTimesRow | null; status: 'pending' | 'ready' | 'failed'; hasData: boolean};
export const PENDING_POPULAR_TIMES: PopularTimesState = {data:null,status:'pending',hasData:false};
export const UNAVAILABLE_POPULAR_TIMES: PopularTimesState = {data:null,status:'ready',hasData:false};

// One channel/request per place across the detail hook and nearby-card consumers.
export function createPopularTimesSubscriptions(client: SupabaseClient) {
  const entries = new Map<string, {state: PopularTimesState; listeners:Set<(state:PopularTimesState) => void>; stop:() => void; refresh:() => void}>();
  function watch(placeId: string, placeUrl: string, listener: (state:PopularTimesState) => void) {
    let entry = entries.get(placeId);
    if (!entry) {
      const listeners = new Set<(state:PopularTimesState) => void>();
      let disposed = false;
      let revision = 0;
      let inFlight = false;
      let subscribedDuringRequest = false;
      let recovery: ReturnType<typeof setTimeout> | undefined;
      const current = {state:PENDING_POPULAR_TIMES, listeners, stop:() => {}, refresh:() => {}};
      entry = current;
      entries.set(placeId, current);
      const publish = (row: PopularTimesRow | null, failed = false) => {
        if (disposed) return;
        revision += 1;
        current.state = {data:row,status:failed ? 'failed' : row?.status ?? 'pending',hasData:row?.status === 'ready' && row.has_data};
        listeners.forEach(callback => callback(current.state));
        if (recovery) clearTimeout(recovery);
        // A single lease-deadline recovery, not polling while an actor is running.
        if (row?.status === 'pending' && row.pending_until) {
          const delay = Date.parse(row.pending_until) - Date.now() + 1000;
          if (delay > 0) recovery = setTimeout(() => void request(), delay);
        }
      };
      const request = async () => {
        if (disposed || inFlight) return;
        inFlight = true;
        const started = revision;
        let responseApplied = false;
        try {
          const {data,error} = await client.functions.invoke<PopularTimesRow>('get-popular-times', {body:{placeId,placeUrl}});
          if (started === revision) { publish(error ? null : data, !!error || !data); responseApplied = true; }
        } catch { if (started === revision) publish(null,true); }
        finally {
          inFlight = false;
          if (subscribedDuringRequest || (!responseApplied && current.state.status === 'pending')) { subscribedDuringRequest = false; void reconcile(); }
        }
      };
      const reconcile = async () => {
        if (disposed) return;
        const started = revision;
        try {
          const {data,error} = await client.from('venue_popular_times').select('*').eq('place_id',placeId).maybeSingle();
          if (!error && data && started === revision) publish(data as PopularTimesRow);
        } catch { /* Keep the last state; reconnect/foreground will reconcile. */ }
      };
      const channel = client.channel(`popular-times:${placeId}`)
        .on('postgres_changes', {event:'*',schema:'public',table:'venue_popular_times',filter:`place_id=eq.${placeId}`}, payload => {
          const row = payload.new as PopularTimesRow;
          if (row.place_id !== placeId) return;
          publish(row);
        }).subscribe(status => {
          if (status === 'SUBSCRIBED') {
            if (inFlight) subscribedDuringRequest = true;
            void reconcile();
          }
        });
      current.stop = () => { disposed = true; if (recovery) clearTimeout(recovery); void client.removeChannel(channel); };
      current.refresh = () => void request();
      void request();
    }
    entry.listeners.add(listener);
    listener(entry.state);
    return () => {
      entry!.listeners.delete(listener);
      if (!entry!.listeners.size) {entry!.stop(); entries.delete(placeId);}
    };
  }
  return {watch, refresh:() => entries.forEach(entry => entry.refresh())};
}
