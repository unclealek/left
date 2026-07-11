import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T, styles } from "../../app/leftTheme";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";

export function LoadingScreen() {
  return (
    <View style={styles.loadingWrap}>
      <LinearGradient colors={["#FFF9EF", "#FFF6E8", "#F8EEDB"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.loadingCenter}>
        <View style={styles.loadingRing}>
          <LeftDoorwayMark size={54} archColor={T.secondary} innerColor={T.surface} baseColor={T.primarySoft} />
        </View>
      </View>
      <Text style={styles.loadingCaption}>Loading your session.</Text>
    </View>
  );
}
