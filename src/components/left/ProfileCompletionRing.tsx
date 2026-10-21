import { t } from "../../features/preferences/translation-runtime";
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { T } from '../../app/leftTheme';

/** A closed track with an exact, clockwise completion arc. */
export function ProfileCompletionRing({ value }: { value: number }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const circumference = 2 * Math.PI * 27;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={t("Profile completion")}
    accessibilityValue={{ min: 0, max: 100, now: percent }} style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={56} height={56} viewBox="0 0 64 64" style={{ position: 'absolute' }}>
      <Circle cx={32} cy={32} r={27} fill="none" stroke="rgba(95,115,63,0.12)" strokeWidth={5} />
      <Circle cx={32} cy={32} r={27} fill="none" stroke={T.primary} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - percent / 100)} rotation={-90} origin="32, 32" />
    </Svg>
    <Text style={{ fontSize: 16, fontWeight: '700', color: T.textPrimary }}>{Math.round(percent)}%</Text>
  </View>;
}
