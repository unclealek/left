import { t } from "../../features/preferences/translation-runtime";
import { Pressable, Text, View } from 'react-native';
import { styles, T } from '../../app/leftTheme';
import { LeftIcon } from '../icons';
import { LeftLogoMark } from './LeftLogoMark';

/** Identity header floats directly over the shared page background. */
export function ProfileHero({ name, onEdit, onSettings, joinedAt }: {
  name: string; onEdit?: () => void; onSettings?: () => void; joinedAt?: string;
}) {
  const joinedYear = joinedAt ? new Date(joinedAt).getFullYear() : NaN;
  return <View style={[styles.profileHeroCard, { paddingTop: 0, paddingBottom: 0, gap: 4 }]}>
    {onSettings ? <Pressable accessibilityRole="button" accessibilityLabel={t("Open settings")} onPress={onSettings}
      style={[styles.profileHeroEditButton, { top: 5, right: 0, width: 40, height: 40, borderRadius: 20 }]}>
      <LeftIcon name="settings" size={21} color={T.textPrimary} />
    </Pressable> : null}
    <View style={{ position: 'relative', marginBottom: 3 }}>
      <View style={[styles.profileBrandHalo, { width: 110, height: 110, borderRadius: 55 }]}><View style={styles.profileBrandCore}><LeftLogoMark size={40} /></View></View>
      {onEdit ? <Pressable accessibilityRole="button" accessibilityLabel={t("Edit profile")} onPress={onEdit}
        style={[styles.profileHeroEditButton, { top: undefined, bottom: 0, right: -5, width: 34, height: 34, borderRadius: 17 }]}>
        <LeftIcon name="edit" size={17} color={T.textSecondary} />
      </Pressable> : null}
    </View>
    <Text style={{ color: T.textSecondary, fontSize: 13, lineHeight: 18 }}>{t("There you are.")}</Text>
    <Text style={[styles.profileDisplayName, { color: T.textPrimary, fontSize: 25, lineHeight: 30 }]}>{name}</Text>
    {Number.isFinite(joinedYear) ? <Text style={{ color: T.textSecondary, fontSize: 12, lineHeight: 18 }}>{t("On HERE since")}{" "}{joinedYear}</Text> : null}
  </View>;
}
