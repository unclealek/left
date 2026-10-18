import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, DevSettings, Linking, Platform, Pressable, Text, View } from "react-native";
import { LeftApp } from "./src/app/LeftApp";
import { GuestApp } from "./src/app/GuestApp";
import { parseGatheringLink } from "./src/features/guest/gathering-links";
import { supabase } from "./src/lib/supabase";
import { leftColors } from "./src/components/color";
import "./src/features/location/location-task";

export default function App() {
  const [guest,setGuest]=useState(false);
  const [sharedGatheringId,setSharedGatheringId]=useState<string|null>(null);
  const [startAtAuth,setStartAtAuth]=useState(false);
  const [sharedLinkRevision,setSharedLinkRevision]=useState(0);
  useEffect(()=>{
    let active=true;
    let request=0;
    const openLink=async(url:string)=>{
      const id=parseGatheringLink(url,process.env.EXPO_PUBLIC_GATHERING_SHARE_ORIGIN);
      if(!id)return;
      const current=++request;
      const {data,error}=await supabase.auth.getSession();
      if(!active || current!==request)return;
      setSharedGatheringId(id);setSharedLinkRevision(value=>value+1);setGuest(!!error || !data.session || !!data.session.user.is_anonymous);
    };
    void Linking.getInitialURL().then(url=>{if(active && url)void openLink(url);}).catch(()=>{});
    const subscription=Linking.addEventListener("url",event=>{void openLink(event.url);});
    return()=>{active=false;subscription.remove();};
  },[]);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  if (!fontsLoaded || fontError) {
    const retry = () => {
      if (Platform.OS === "web" && typeof globalThis.location?.reload === "function") {
        globalThis.location.reload();
        return;
      }
      DevSettings.reload();
    };

    return (
      <View
        accessibilityLabel="Loading Left"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          backgroundColor: leftColors.porcelain,
        }}
      >
        {fontError ? null : <ActivityIndicator color={leftColors.creoleBrown} />}
        <Text style={{ color: leftColors.charcoal, fontSize: 14 }}>
          {fontError ? "Left couldn’t load its interface." : "Opening Left…"}
        </Text>
        {fontError ? (
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={{
              minHeight: 48,
              minWidth: 140,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: leftColors.actionBrown,
            }}
          >
            <Text style={{ color: leftColors.yellowGreen, fontSize: 15, fontWeight: "700" }}>
              Try again
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {guest ? <GuestApp key={sharedLinkRevision} sharedGatheringId={sharedGatheringId} onSignIn={()=>{setStartAtAuth(true);setGuest(false);}} /> :
        <LeftApp onBrowseGuest={()=>setGuest(true)} sharedGatheringId={sharedGatheringId} sharedLinkRevision={sharedLinkRevision} startAtAuth={startAtAuth}/>}

    </SafeAreaProvider>
  );
}
