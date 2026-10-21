import { t } from "../../features/preferences/translation-runtime";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { AppUser } from '../../types/left-domain';
import { T } from '../../app/leftTheme';
import { LeftIcon, type LeftIconName } from '../icons';
import { ProfileHero } from './ProfileHero';
import { ProfileCompletionRing } from './ProfileCompletionRing';
import { useReducedTransparency } from './use-navigation-accessibility';

type Props = {
  user: AppUser; sessionVisible: boolean; currentVenueName: string;
  nearbyVenueCount: number; approachCount: number; savedVenueCount: number;
  onEdit: () => void; onOpenSettings: () => void; onOpenSafety: () => void;
  onOpenSaved: () => void; onBecomeVisible: () => void;
};
const interestIcon = (interest: string): LeftIconName => /food|coffee/i.test(interest) ? 'coffee'
  : /learning/i.test(interest) ? 'book-open' : /wellbeing/i.test(interest) ? 'sun' : 'compass';

export function ProfileOverview(p: Props) {
  const { user } = p;
  const opaque = useReducedTransparency();
  const { fontScale } = useWindowDimensions();
  const card = [s.card, opaque && s.opaque];
  const fields = [user.interests.length >= 3, Boolean(user.offering), Boolean(user.socialRhythm), Boolean(user.conversationStyle)];
  const completion = Math.round(fields.filter(Boolean).length / fields.length * 100);
  const columns: Array<{ icon: LeftIconName; label: string; value: string }> = [
    { icon: 'users', label: 'Drawn to', value: user.interests.map(interest => t(interest)).join('\n') || 'Add your interests' },
    { icon: 'clock', label: 'Usually around', value: t(user.socialRhythm) || 'Add your rhythm' },
    { icon: 'message-circle', label: 'Conversation style', value: t(user.conversationStyle) || 'Add your style' },
  ];
  const stats: Array<{ icon: LeftIconName; value: number; label: string }> = [
    { icon: 'radio', value: p.sessionVisible ? 1 : 0, label: 'Live now' },
    { icon: 'activity', value: p.approachCount, label: 'Approaches started' },
    { icon: 'map-pin', value: p.nearbyVenueCount, label: 'Venues nearby' },
  ];
  return <View style={s.page}>
    <View testID="profile-section-identity"><ProfileHero name={user.firstName} onEdit={p.onEdit} onSettings={p.onOpenSettings} joinedAt={user.createdAt} /></View>
    <View testID="profile-section-interests" style={s.interests}>
      {user.interests.map(interest => <View key={interest} style={[s.pill, opaque && s.opaque]}>
        <LeftIcon name={interestIcon(interest)} size={15} color={T.primary} /><Text style={s.interestText}>{t(interest)}</Text>
      </View>)}
    </View>
    <View testID="profile-section-visibility" style={card}>
      <View style={s.presenceRow}>
        <View style={s.iconBubble}><LeftIcon name={p.sessionVisible ? "eye" : "user"} size={23} color={T.primary} /></View>
        <View style={s.copy}><Text style={s.title}>{p.sessionVisible ? `Visible at ${p.currentVenueName}` : t("Currently private")}</Text>
          <Text style={s.body}>{p.sessionVisible ? t("Manage your visibility at this venue.") : t("Go visible to appear at venues and see people around you.")}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={p.sessionVisible ? t("Manage visibility") : t("Go visible")} onPress={p.onBecomeVisible} style={s.action}>
          <LeftIcon name="eye" size={18} color="#FFFFFF" /><Text style={s.actionText}>{p.sessionVisible ? t("Manage") : t("Go visible")}</Text>
        </Pressable>
      </View>
      <View style={s.rule} />
      <Pressable accessibilityRole="button" accessibilityLabel={t("Privacy and safety controls")} onPress={p.onOpenSafety} style={s.row}>
        <View style={s.smallBubble}><LeftIcon name="shield" size={22} color={T.primary} /></View>
        <Text style={[s.body, s.copy, { color: T.textPrimary }]}>{t("Privacy and safety controls")}</Text><LeftIcon name="chevron-right" size={19} color={T.textSecondary} />
      </Pressable>
    </View>
    <View testID="profile-section-compass" style={card}>
      <View style={s.row}><View style={s.smallBubble}><LeftIcon name="compass" size={22} color={T.primary} /></View><Text style={[s.title, s.copy]}>{t("My social compass")}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Edit social compass")} onPress={p.onEdit} style={s.edit}><LeftIcon name="edit" size={14} color={T.primary} /><Text style={s.interestText}>{t("Edit")}</Text></Pressable>
      </View>
      <View testID="profile-compass-columns" style={fontScale > 1.3 ? s.columnsStacked : s.columns}>
        {columns.map((column, index) => <View key={column.label} style={[s.column, index > 0 && (fontScale > 1.3 ? s.columnStackedDivider : s.columnDivider)]}>
          <View style={s.columnHeading}><LeftIcon name={column.icon} size={16} color={T.textSecondary} /><Text style={s.columnLabel}>{t(column.label)}</Text></View>
          <Text style={s.columnValue}>{t(column.value)}</Text>
        </View>)}
      </View>
    </View>
    <Pressable testID="profile-section-completion" accessibilityRole="button" accessibilityLabel={t("Complete your profile, {percent}% complete", { percent: completion })} onPress={p.onEdit} style={card}>
      <View style={s.row}><ProfileCompletionRing value={completion} /><View style={s.copy}><Text style={s.title}>{t("Profile completion")}</Text>
        <Text style={s.body}>{completion === 100 ? t("Your social compass is ready.") : t("Add a few details to make your vibe and introductions more useful.")}</Text></View><LeftIcon name="chevron-right" size={19} color={T.primary} /></View>
    </Pressable>
    <Pressable testID="profile-section-saved" accessibilityRole="button" accessibilityLabel={t("Open {count} saved places", { count: p.savedVenueCount })} onPress={p.onOpenSaved} style={card}>
      <View style={s.row}><View style={s.iconBubble}><LeftIcon name="bookmark" size={23} color={T.primary} /></View><View style={s.copy}><Text style={s.title}>{t("Saved places")}</Text><Text style={s.body}>{t("Build a private list for later")}</Text></View>
        <View style={s.count}><Text style={s.countText}>{String(p.savedVenueCount)}</Text></View><LeftIcon name="chevron-right" size={19} color={T.primary} /></View>
    </Pressable>
    <View testID="profile-section-moments" style={s.moments}>
      <Text style={s.heading}>{t("Your recent moments")}</Text>
      <View style={[...card, s.stats]}>{stats.map((stat, index) => <View key={stat.label} style={[s.stat, index > 0 && s.statDivider]}>
        <View style={s.statValue}><LeftIcon name={stat.icon} size={18} color={T.primary} /><Text style={s.number}>{stat.value}</Text></View><Text style={s.statLabel}>{t(stat.label)}</Text>
      </View>)}</View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  page: { gap: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 22, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.92)', gap: 10 },
  opaque: { backgroundColor: '#F7F4EE' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 38 },
  presenceRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  title: { color: T.textPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  body: { color: T.textSecondary, fontSize: 11, lineHeight: 16 },
  heading: { color: T.textPrimary, fontSize: 20, lineHeight: 25, fontWeight: '700', marginHorizontal: 2 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 0, marginBottom: 5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 22, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: 'rgba(247,248,232,0.56)', borderColor: 'rgba(255,255,255,0.65)', borderWidth: 1 },
  interestText: { color: T.primary, fontSize: 11, lineHeight: 17 },
  iconBubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(95,115,63,0.08)', justifyContent: 'center', alignItems: 'center' },
  smallBubble: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(95,115,63,0.06)', justifyContent: 'center', alignItems: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 20, backgroundColor: T.primary },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  rule: { height: 1, backgroundColor: 'rgba(95,115,63,0.12)' },
  edit: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: 10, borderRadius: 22, backgroundColor: 'rgba(95,115,63,0.06)' },
  columns: { flexDirection: 'row', marginTop: 4 },
  columnsStacked: { gap: 10 },
  column: { flex: 1, minWidth: 0, paddingHorizontal: 6, gap: 7 },
  columnDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(95,115,63,0.12)' },
  columnStackedDivider: { borderTopWidth: 1, borderTopColor: 'rgba(95,115,63,0.12)', paddingTop: 10 },
  columnHeading: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  columnLabel: { flex: 1, fontSize: 10, lineHeight: 14, color: T.textSecondary },
  columnValue: { color: T.textSecondary, fontSize: 11, lineHeight: 16, paddingLeft: 20 },
  count: { minWidth: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(95,115,63,0.07)' },
  countText: { color: T.primary, fontSize: 14, fontWeight: '600' },
  moments: { gap: 8, marginTop: 5 },
  stats: { flexDirection: 'row', gap: 0, paddingVertical: 15 },
  stat: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(95,115,63,0.16)' },
  statValue: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  number: { color: T.textPrimary, fontSize: 23, fontWeight: '600' },
  statLabel: { color: T.textSecondary, fontSize: 11, lineHeight: 15, textAlign: 'center' },
});
