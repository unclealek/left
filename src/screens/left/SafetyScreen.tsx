import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import type { VenuePreference } from "../../features/location/location-storage";

export function SafetyScreen({
  venueName,
  sessionVisible,
  venueMuted,
  venueAction,
  venueMessage,
  venuePreferences,
  venuePreferenceAction,
  venuePreferenceMessage,
  locationStatus,
  visibilityAction,
  onBack,
  onGoVisible,
  onPauseVisibility,
  onEndSession,
  onHideVenue,
  onMuteVenue,
  onClearVenueHidden,
  onClearVenueMuted,
}: {
  venueName: string;
  sessionVisible: boolean;
  venueMuted: boolean;
  venueAction: "hiding" | "muting" | null;
  venueMessage: { tone: "success" | "error"; text: string } | null;
  venuePreferences: VenuePreference[];
  venuePreferenceAction: {
    venueId: string;
    action: "hide" | "mute" | "unhide" | "unmute";
  } | null;
  venuePreferenceMessage: { tone: "success" | "error"; text: string } | null;
  locationStatus: string;
  visibilityAction: "pause" | "end" | null;
  onBack: () => void;
  onGoVisible: () => void;
  onPauseVisibility: () => void;
  onEndSession: () => void;
  onHideVenue: () => void;
  onMuteVenue: () => void;
  onClearVenueHidden: (venueId: string, venueName: string) => void;
  onClearVenueMuted: (venueId: string, venueName: string) => void;
}) {
  function confirmHideVenue() {
    Alert.alert(
      "Hide this venue?",
      `You will not appear at ${venueName} until you unhide it.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Hide venue", style: "destructive", onPress: onHideVenue },
      ],
    );
  }

  return (
    <ScrollView
      style={screenStyles.page}
      contentContainerStyle={screenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.topBar}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.profileHeaderButton, pressed && styles.iconButtonPressed]}
        >
          <LeftIcon name="chevron-left" size={28} color={T.textPrimary} />
        </Pressable>
        <Text style={screenStyles.topBarTitle}>Privacy and safety</Text>
        <View style={styles.profileHeaderButton} />
      </View>

      <View style={screenStyles.header}>
        <Text style={screenStyles.subtitle}>
          Control visibility, venue privacy, and alerts from one place.
        </Text>
      </View>

      <View style={screenStyles.card}>
        <Text style={screenStyles.sectionTitle}>Current visibility</Text>
        <View style={screenStyles.statusPill}>
          <View
            style={[
              screenStyles.statusDot,
              sessionVisible ? screenStyles.statusDotVisible : screenStyles.statusDotHidden,
            ]}
          />
          <Text style={screenStyles.statusPillText}>
            {sessionVisible ? "Visible nearby" : "Not currently visible"}
          </Text>
        </View>
        <Text style={screenStyles.bodyText}>
          {sessionVisible
            ? "You are discoverable to others nearby until you pause or end this session."
            : "You are hidden from others and alerts are paused."}
        </Text>

        <View style={screenStyles.divider} />

        <Pressable
          disabled={!!visibilityAction}
          onPress={sessionVisible ? onPauseVisibility : onGoVisible}
          style={({ pressed }) => [
            screenStyles.primaryAction,
            !!visibilityAction && screenStyles.primaryActionDisabled,
            pressed && !visibilityAction && screenStyles.buttonPressed,
          ]}
        >
          <LeftIcon
            name={sessionVisible ? "pause-circle" : "eye-off"}
            size={18}
            color={T.white}
          />
          <Text style={screenStyles.primaryActionText}>
            {sessionVisible
              ? visibilityAction === "pause"
                ? "Pausing..."
                : "Pause visibility"
              : "Go visible"}
          </Text>
        </Pressable>

        <Pressable
          disabled={!sessionVisible || !!visibilityAction}
          onPress={onEndSession}
          style={({ pressed }) => [
            screenStyles.secondaryAction,
            (!sessionVisible || visibilityAction === "pause") && screenStyles.secondaryActionDisabled,
            pressed && sessionVisible && !visibilityAction && screenStyles.buttonPressed,
          ]}
        >
          <Text style={screenStyles.secondaryActionText}>
            {visibilityAction === "end" ? "Ending..." : "End session"}
          </Text>
        </Pressable>
      </View>

      <View style={screenStyles.card}>
        <Text style={screenStyles.sectionTitle}>Venue privacy</Text>
        <Text style={screenStyles.bodyText}>
          Choose where you can be seen and where alerts are allowed.
        </Text>

        <RowAction
          icon="shield"
          label="Hide this venue"
          onPress={confirmHideVenue}
          disabled={!!venueAction}
        />
        <RowAction
          icon="bell"
          label={
            venueAction === "muting"
              ? "Muting alerts here"
              : venueMuted
                ? "Alerts already muted here"
                : "Mute alerts here"
          }
          onPress={onMuteVenue}
          disabled={!!venueAction || venueMuted}
        />

        {venueMessage ? (
          <Text
            style={[
              screenStyles.inlineMessage,
              venueMessage.tone === "success"
                ? screenStyles.inlineMessageSuccess
                : screenStyles.inlineMessageError,
            ]}
          >
            {venueMessage.text}
          </Text>
        ) : null}

        <View style={screenStyles.privateVenueNote}>
          <View style={screenStyles.privateVenueIcon}>
            <LeftIcon name="lock" size={16} color={T.white} />
          </View>
          <Text style={screenStyles.privateVenueText}>
            Your venue stays private until you're visible.
          </Text>
        </View>
      </View>

      <View style={screenStyles.card}>
        <Text style={screenStyles.sectionTitle}>Hidden & muted venues</Text>
        {venuePreferenceMessage ? (
          <Text
            style={[
              screenStyles.inlineMessage,
              venuePreferenceMessage.tone === "success"
                ? screenStyles.inlineMessageSuccess
                : screenStyles.inlineMessageError,
            ]}
          >
            {venuePreferenceMessage.text}
          </Text>
        ) : null}

        {venuePreferences.length === 0 ? (
          <View style={screenStyles.emptyState}>
            <View style={screenStyles.emptyIconBubble}>
              <LeftIcon name="archive" size={24} color={T.primary} />
            </View>
            <Text style={screenStyles.emptyTitle}>No hidden or muted venues yet.</Text>
            <Text style={screenStyles.emptyBody}>
              Places you hide or mute will appear here.
            </Text>
          </View>
        ) : (
          <View style={screenStyles.preferenceList}>
            {venuePreferences.map((preference, index) => {
              const activeAction =
                venuePreferenceAction?.venueId === preference.venueId
                  ? venuePreferenceAction.action
                  : null;

              return (
                <View
                  key={preference.venueId}
                  style={[
                    screenStyles.preferenceRow,
                    index === venuePreferences.length - 1 && screenStyles.preferenceRowLast,
                  ]}
                >
                  <View style={screenStyles.preferenceCopy}>
                    <Text style={screenStyles.preferenceVenueName}>{preference.venueName}</Text>
                    <Text style={screenStyles.preferenceMeta}>
                      {preference.hidden && preference.muted
                        ? "Hidden and alerts muted"
                        : preference.hidden
                          ? "Hidden venue"
                          : "Alerts muted"}
                    </Text>
                  </View>
                  <View style={screenStyles.preferenceActions}>
                    {preference.hidden ? (
                      <MiniActionButton
                        label={activeAction === "unhide" ? "Unhiding..." : "Unhide"}
                        onPress={() => onClearVenueHidden(preference.venueId, preference.venueName)}
                        disabled={!!activeAction}
                      />
                    ) : null}
                    {preference.muted ? (
                      <MiniActionButton
                        label={activeAction === "unmute" ? "Turning on..." : "Unmute"}
                        onPress={() => onClearVenueMuted(preference.venueId, preference.venueName)}
                        disabled={!!activeAction}
                      />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={screenStyles.footerMeta}>{locationStatus}</Text>
      </View>
    </ScrollView>
  );
}

function RowAction({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: LeftIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        screenStyles.rowAction,
        disabled && screenStyles.rowActionDisabled,
        pressed && !disabled && screenStyles.buttonPressed,
      ]}
    >
      <View style={screenStyles.rowIconBubble}>
        <LeftIcon name={icon} size={20} color={T.textPrimary} />
      </View>
      <Text style={screenStyles.rowLabel}>{label}</Text>
      <LeftIcon name="chevron-right" size={22} color={T.textSecondary} />
    </Pressable>
  );
}

function MiniActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        screenStyles.miniActionButton,
        disabled && screenStyles.miniActionButtonDisabled,
        pressed && !disabled && screenStyles.buttonPressed,
      ]}
    >
      <Text style={screenStyles.miniActionText}>{label}</Text>
    </Pressable>
  );
}

const screenStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: T.ink,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 18,
  },
  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    flex: 1,
    color: T.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: T.fontBodyBold,
    textAlign: "center",
    marginHorizontal: 8,
  },
  header: {
    gap: 6,
    paddingHorizontal: 0,
  },
  subtitle: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: T.fontBody,
    maxWidth: 360,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceGlassStrong,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 12,
    shadowColor: T.primary,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionTitle: {
    color: T.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: T.fontBodyBold,
    letterSpacing: -0.2,
  },
  statusPill: {
    alignSelf: "flex-start",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.primarySoft,
    paddingHorizontal: 12,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  statusDotVisible: {
    backgroundColor: T.visibilityOn,
  },
  statusDotHidden: {
    backgroundColor: T.textMuted,
  },
  statusPillText: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  bodyText: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: T.fontBody,
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginTop: 2,
    marginBottom: 0,
  },
  primaryAction: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: T.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryActionDisabled: {
    backgroundColor: T.textMuted,
  },
  primaryActionText: {
    color: T.white,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
    letterSpacing: -0.1,
  },
  secondaryAction: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: T.borderBlack,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionDisabled: {
    opacity: 0.42,
  },
  secondaryActionText: {
    color: T.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  rowAction: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    paddingVertical: 8,
  },
  rowActionDisabled: {
    opacity: 0.58,
  },
  rowIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.primarySoft,
  },
  rowLabel: {
    flex: 1,
    color: T.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  privateVenueNote: {
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: T.surfaceGlassStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  privateVenueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.primary,
  },
  privateVenueText: {
    flex: 1,
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  inlineMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: T.fontBodyMedium,
  },
  inlineMessageSuccess: {
    color: T.visibilityOn,
  },
  inlineMessageError: {
    color: T.dangerText,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  emptyIconBubble: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.primarySoft,
  },
  emptyTitle: {
    color: T.textPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontFamily: T.fontBodyBold,
    textAlign: "center",
  },
  emptyBody: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: T.fontBody,
    textAlign: "center",
    maxWidth: 260,
  },
  preferenceList: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceGlassStrong,
  },
  preferenceRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  preferenceRowLast: {
    borderBottomWidth: 0,
  },
  preferenceCopy: {
    gap: 4,
  },
  preferenceVenueName: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  preferenceMeta: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: T.fontBody,
  },
  preferenceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniActionButton: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.primarySoft,
  },
  miniActionButtonDisabled: {
    opacity: 0.56,
  },
  miniActionText: {
    color: T.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  footerMeta: {
    color: T.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: T.fontBody,
  },
  buttonPressed: {
    opacity: 0.86,
  },
});
