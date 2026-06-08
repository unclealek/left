import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T, styles } from "../../app/leftTheme";

export function LoadingScreen() {
  return (
    <View style={styles.loadingWrap}>
      <LinearGradient colors={["#ffffff", "#faf7ff", "#f3edff"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.loadingCenter}>
        <View style={styles.loadingRing}>
          <Text style={styles.loadingChevron}>{"<"}</Text>
          <View style={styles.loadingDot} />
        </View>
      </View>
      <Text style={styles.loadingCaption}>Loading your session.</Text>
    </View>
  );
}
