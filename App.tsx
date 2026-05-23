import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LeftApp } from "./src/app/LeftApp";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LeftApp />
    </SafeAreaProvider>
  );
}
