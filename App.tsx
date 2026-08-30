import { useFonts } from "expo-font";
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, DevSettings, Platform, Pressable, Text, View } from "react-native";
import { LeftApp } from "./src/app/LeftApp";
import { leftColors } from "./src/components/color";
import "./src/features/location/location-task";

export default function App() {
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
      <LeftApp />
    </SafeAreaProvider>
  );
}
