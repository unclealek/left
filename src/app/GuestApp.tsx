import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, T } from './leftTheme';
import { PrimaryButton, SelectChip } from '../components/left/ui';
import { ExperienceDetailScreen } from '../screens/left/ExperienceDetailScreen';
import { VenueDetailScreen } from '../screens/left/VenueDetailScreen';
import { fetchSharedGathering } from '../features/guest/shared-gathering';
import type { VenueExperience } from '../types/left-domain';

export function GuestApp({sharedGatheringId,onSignIn}:{sharedGatheringId:string|null;onSignIn:()=>void}) {
  const insets=useSafeAreaInsets();
  const [tab,setTab]=useState<'Home'|'Venues'|'Gatherings'|'Profile'>('Home');
  const [gathering,setGathering]=useState<VenueExperience|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [reload,setReload]=useState(0);
  const [detail,setDetail]=useState<'gathering'|'venue'|null>(null);
  useEffect(()=>{
    let active=true;setGathering(null);setError(null);setDetail(null);
    if(!sharedGatheringId){setLoading(false);return;}
    setLoading(true);
    void fetchSharedGathering(sharedGatheringId).then(value=>{
      if(!active)return;setGathering(value);
      if(value)setDetail('gathering');else setError('This gathering is no longer available.');
    }).catch(reason=>{if(active)setError(reason.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[sharedGatheringId,reload]);
  const sampleVenue={id:'guest-preview-venue',name:'A neighbourhood café',venueType:'cafe' as const,latitude:0,longitude:0,radiusMeters:60,source:'local_catalog' as const,distanceMeters:null};
  return <View style={styles.shell}>
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={[styles.content,{paddingTop:insets.top+20,paddingBottom:insets.bottom+32,gap:20}]}>
      <Text style={styles.experienceTitle}>Explore as a guest</Text>
      <Text style={styles.experienceValidationHint}>Browse first. Sign in to join a gathering, host, save places or become visible.</Text>
      <View style={styles.chipWrap}>{(['Home','Venues','Gatherings','Profile'] as const).map(value=><SelectChip key={value} label={value} active={tab===value} onPress={()=>{setTab(value);setDetail(null);}} />)}</View>
      {loading ? <ActivityIndicator accessibilityLabel="Loading shared gathering" color={T.primary}/> : null}
      {error ? <View style={styles.experienceReviewNotice}><Text style={styles.experienceReviewText}>{error}</Text><SelectChip label="Try again" active={false} onPress={()=>setReload(x=>x+1)}/></View> : null}
      {detail==='gathering' && gathering ? <ExperienceDetailScreen experience={gathering} attendanceBusy={false} onBack={()=>setDetail(null)} onToggleAttendance={onSignIn} onOpenVenue={()=>{setTab('Venues');setDetail('venue');}} guest /> :
       detail==='venue' ? <View>
        <Text style={styles.experienceValidationHint}>{gathering ? 'Shared gathering venue' : 'Example venue · UI preview'}</Text>
        <VenueDetailScreen guest venue={gathering ? {...sampleVenue,name:gathering.venueName} : sampleVenue} venueSummary={{venueId:'',venueName:'',visibleCount:0,energyLevel:'calm',activeVibes:[],popularIntents:[],pulseCopy:''}} venueActivity={null} sessionVisible={false} detailsLoading={false} saved={false} saving={false} onBack={()=>setDetail(gathering ? 'gathering' : null)} onPrimaryAction={onSignIn} onToggleSaved={onSignIn}/>
       </View> : <>
        {tab==='Home' ? <View style={styles.experienceReviewNotice}>
          <Text style={styles.experienceTitle}>Small plans. Real places.</Text>
          <Text style={styles.experienceReviewText}>Discover how LEFT brings people together, without creating an account first.</Text>
          <SelectChip label="Explore venues" active={false} onPress={()=>setTab('Venues')}/>
          <SelectChip label="Host something small" active={false} onPress={onSignIn}/>
        </View> : null}
        {tab==='Venues' ? <View style={styles.experienceReviewNotice}>
          <Text style={styles.experienceReviewEyebrow}>UI PREVIEW</Text><Text style={styles.experienceReviewText}>A neighbourhood café</Text>
          <Text style={styles.experienceValidationHint}>An example of a venue page. Sign in for location-based discovery.</Text>
          <SelectChip label="View venue preview" active={false} onPress={()=>setDetail('venue')}/>
        </View> : null}
        {tab==='Gatherings' || tab==='Home' ? <View style={styles.experienceReviewNotice}>
          <Text style={styles.experienceReviewText}>{gathering ? gathering.title : 'Small gatherings'}</Text>
          <Text style={styles.experienceValidationHint}>{gathering ? gathering.venueName : 'Open a shared gathering link to see the reviewed plan. Joining and hosting require an account.'}</Text>
          {gathering ? <SelectChip label="View gathering" active={false} onPress={()=>setDetail('gathering')}/> : null}
        </View> : null}
        {tab==='Profile' ? <View style={styles.experienceReviewNotice}><Text style={styles.experienceReviewText}>Your profile starts when you sign in.</Text><Text style={styles.experienceValidationHint}>Guest browsing doesn’t create a profile or show people who are visible nearby.</Text></View> : null}
       </>}
      <PrimaryButton label="Sign in to take part" onPress={onSignIn}/>
    </ScrollView>
  </View>;
}
