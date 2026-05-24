import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LeftApp } from "./src/app/LeftApp";
import "./src/features/location/location-task";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LeftApp />
    </SafeAreaProvider>
  );
}
