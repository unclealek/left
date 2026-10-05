import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../../lib/supabase';
import type { RuntimeVenueCandidate } from '../location/location-storage';
import type { VenueActivityEnvelope } from './activity-types';
import { googleMapsPlaceUrl, popularTimesActivity } from './popular-times-model';
import { createPopularTimesSubscriptions, PENDING_POPULAR_TIMES, UNAVAILABLE_POPULAR_TIMES, type PopularTimesState } from './popular-times-subscription';
const subscriptions = createPopularTimesSubscriptions(supabase);
let foregroundUsers = 0;
let foregroundSubscription: ReturnType<typeof AppState.addEventListener> | undefined;
function watchForeground() {
  if (++foregroundUsers === 1) foregroundSubscription = AppState.addEventListener('change', state => {
    if (state === 'active') subscriptions.refresh();
  });
  return () => { if (--foregroundUsers === 0) foregroundSubscription?.remove(); };
}
// Recompute the local-hour display without polling the backend/provider.
function useDisplayClock(enabled: boolean) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => tick(value => value + 1), 60_000);
    return () => clearInterval(timer);
  }, [enabled]);
}
export function usePopularTimes(placeId?: string | null, placeUrl?: string | null) {
  useDisplayClock(!!placeId);
  const [value,setValue] = useState<{placeId:string;state:PopularTimesState} | null>(null);
  useEffect(() => {
    if (!placeId || !placeUrl) return;
    const stop = subscriptions.watch(placeId,placeUrl,state => setValue({placeId,state}));
    const stopForeground = watchForeground();
    return () => {stop(); stopForeground();};
  }, [placeId,placeUrl]);
  return !placeId || !placeUrl ? UNAVAILABLE_POPULAR_TIMES : value?.placeId === placeId ? value.state : PENDING_POPULAR_TIMES;
}
export function usePopularTimesForVenues(venues: RuntimeVenueCandidate[], presence: Record<string,VenueActivityEnvelope>, enabled: boolean) {
  useDisplayClock(enabled);
  const [states,setStates] = useState<Record<string,PopularTimesState>>({});
  const key = JSON.stringify([...new Set(venues.flatMap(venue => venue.placeId ? [venue.placeId] : []))].sort());
  useEffect(() => {
    if (!enabled) return;
    const stops = (JSON.parse(key) as string[]).map(placeId => subscriptions.watch(placeId,googleMapsPlaceUrl(placeId),state => setStates(old => ({...old,[placeId]:state}))));
    const stopForeground = watchForeground();
    return () => {stops.forEach(stop => stop()); stopForeground();};
  }, [key,enabled]);
  if (!enabled) return presence;
  const result = {...presence};
  for (const venue of venues) {
    if (!venue.placeId) continue;
    const state = states[venue.placeId] ?? PENDING_POPULAR_TIMES;
    const activity = popularTimesActivity(state.data,venue.timezone);
    if (state.status === 'failed' && !state.data) {activity.refreshing = false; activity.displayText = 'Popular times unavailable';}
    result[venue.id] = {venueId:venue.id, googlePlaceId:venue.placeId,name:venue.name, activity,
      leftPresence:presence[venue.id]?.leftPresence ?? {total:0,visible:0,openToMeet:0}};
  }
  return result;
}
