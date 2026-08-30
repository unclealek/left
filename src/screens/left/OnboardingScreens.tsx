import type { ReactNode } from "react";
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AvatarStyle } from "../../types/left-domain";
import { avatarStyles } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/left/ui";
import { LeftIcon } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { GlassSurface, glassRadii } from "../../components/glass";
import { validateFirstName } from "../../features/onboarding/onboarding-validation";
import { canCompleteLegalStep } from "../../features/onboarding/onboarding-flow";
import {
  LEGAL_DOCUMENTS,
  legalContentReady,
  type LegalDocumentId,
} from "../../features/legal/legal-content";

const avatarLabels: Record<AvatarStyle, string> = {
  geometric: "Soft Square",
  abstract: "Echo",
  minimal: "Orbit",
  soft: "Pebble",
};

function OnboardingShell({
  step,
  children,
  footer,
  onBack,
  showProgress = true,
}: {
  step?: 1 | 2 | 3 | 4;
  children: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
  showProgress?: boolean;
}) {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.onboardingPage, { minHeight: Math.max(560, height - 120) }]}>
      <View style={styles.onboardingHeader}>
        <View style={styles.onboardingHeaderRow}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              style={({ pressed }) => [styles.onboardingBackButton, pressed && styles.onboardingPressed]}
            >
              <LeftIcon name="arrow-left" size={21} color={T.onboardingInk} />
            </Pressable>
          ) : (
            <View style={styles.onboardingBackButton} />
          )}
          <LeftLogoMark size={42} />
          <View style={styles.onboardingBackButton} />
        </View>
        {showProgress && step ? (
          <View
            style={styles.onboardingProgress}
            accessibilityRole="progressbar"
            accessibilityLabel={`Onboarding step ${step} of 4`}
            accessibilityValue={{ min: 1, max: 4, now: step }}
          >
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={[
                  styles.onboardingProgressTrack,
                  item <= step && styles.onboardingProgressTrackActive,
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.onboardingContent}>{children}</View>
      <View style={styles.onboardingFooter}>{footer}</View>
    </View>
  );
}

function AvatarShape({ avatarStyle, size = "tile" }: { avatarStyle: AvatarStyle; size?: "tile" | "preview" | "hero" }) {
  const large = size === "hero";
  const preview = size === "preview";
  const dimension = large ? 150 : preview ? 66 : 72;

  return (
    <View style={[styles.onboardingAvatarHalo, { width: dimension, height: dimension }]}>
      <LinearGradient
        colors={
          avatarStyle === "minimal"
            ? [T.onboardingAccent, T.onboardingAccent, T.onboardingInk]
            : avatarStyle === "abstract"
              ? [T.onboardingInk, "#6D4A2B", T.onboardingAccent]
              : avatarStyle === "soft"
                ? [T.onboardingAccent, T.onboardingAccent, T.onboardingAccent]
                : [T.onboardingAccent, T.onboardingAccent, T.onboardingInk]
        }
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.onboardingAvatarShape,
          { width: dimension, height: dimension },
          avatarStyle === "geometric" && styles.onboardingAvatarGeometric,
          avatarStyle === "abstract" && styles.onboardingAvatarAbstract,
          avatarStyle === "minimal" && styles.onboardingAvatarMinimal,
          avatarStyle === "soft" && styles.onboardingAvatarSoft,
        ]}
      >
        {avatarStyle === "abstract" ? (
          <>
            <View style={styles.onboardingAvatarEchoOne} />
            <View style={styles.onboardingAvatarEchoTwo} />
          </>
        ) : null}
        {avatarStyle === "minimal" ? <View style={styles.onboardingAvatarOrbitCore} /> : null}
        {avatarStyle === "soft" ? <View style={styles.onboardingAvatarPebbleGlow} /> : null}
      </LinearGradient>
    </View>
  );
}

export function NameScreen({
  firstNameDraft,
  onChangeFirstName,
  onContinue,
  onBack,
}: {
  firstNameDraft: string;
  onChangeFirstName: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const validation = validateFirstName(firstNameDraft);

  return (
    <OnboardingShell
      step={1}
      onBack={onBack}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          disabled={!validation.valid}
          trailingIcon="chevron-right"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>What should people call you?</Text>
        <Text style={styles.onboardingBody}>Just your first name. Keep it simple.</Text>
      </View>

      <View style={styles.onboardingNameBlock}>
        <TextInput
          value={firstNameDraft}
          onChangeText={onChangeFirstName}
          placeholder="Your first name"
          placeholderTextColor={T.onboardingInkMuted}
          style={styles.onboardingNameInput}
          accessibilityLabel="First name"
          accessibilityHint="Enter the name people nearby should call you."
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          returnKeyType="next"
          autoFocus
          onSubmitEditing={() => {
            if (validation.valid) onContinue();
          }}
        />
        {!validation.valid && firstNameDraft.length > 0 ? (
          <Text accessibilityRole="alert" style={styles.onboardingError}>{validation.message}</Text>
        ) : null}
        {validation.valid ? (
          <View style={styles.onboardingGreeting}>
            <View style={styles.onboardingGreetingIcon}>
              <LeftIcon name="smile" size={19} color={T.onboardingInk} />
            </View>
            <Text style={styles.onboardingGreetingText}>Nice to meet you, {validation.normalized}.</Text>
          </View>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

export function AvatarScreen({
  firstName,
  avatarStyle,
  onPick,
  onContinue,
  onBack,
}: {
  firstName: string;
  avatarStyle: AvatarStyle;
  onPick: (style: AvatarStyle) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  function surpriseMe() {
    const currentIndex = avatarStyles.indexOf(avatarStyle);
    onPick(avatarStyles[(currentIndex + 1 + Math.floor(Math.random() * (avatarStyles.length - 1))) % avatarStyles.length]);
  }

  return (
    <OnboardingShell
      step={2}
      onBack={onBack}
      footer={<PrimaryButton label="Continue" onPress={onContinue} trailingIcon="chevron-right" tone="onboarding" />}
    >
      <View style={styles.onboardingIntroBlock}>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>Pick your social shape</Text>
        <Text style={styles.onboardingBody}>This is how you’ll appear to people nearby.</Text>
      </View>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Social shape"
        style={styles.onboardingAvatarGrid}
      >
        {avatarStyles.map((style) => {
          const active = avatarStyle === style;
          return (
            <Pressable
              key={style}
              onPress={() => onPick(style)}
              accessibilityRole="radio"
              accessibilityLabel={avatarLabels[style]}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.onboardingAvatarTile,
                active && styles.onboardingAvatarTileActive,
                pressed && styles.onboardingPressed,
              ]}
            >
              {active ? (
                <View style={styles.onboardingAvatarCheck}>
                  <LeftIcon name="check" size={13} color={T.onboardingAccent} />
                </View>
              ) : null}
              <AvatarShape avatarStyle={style} />
              <Text style={styles.onboardingAvatarLabel}>{avatarLabels[style]}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={surpriseMe}
        accessibilityRole="button"
        style={({ pressed }) => [styles.onboardingSurpriseButton, pressed && styles.onboardingPressed]}
      >
        <LeftIcon name="shuffle" size={18} color={T.onboardingInk} />
        <Text style={styles.onboardingSurpriseLabel}>Surprise me</Text>
      </Pressable>

      <View style={styles.onboardingPreviewBlock}>
        <Text style={styles.onboardingSectionTitle}>How you’ll appear nearby</Text>
        <View style={styles.onboardingPreviewCard}>
          <AvatarShape avatarStyle={avatarStyle} size="preview" />
          <View style={styles.onboardingPreviewCopy}>
            <Text style={styles.onboardingPreviewName}>{firstName || "You"}</Text>
            <View style={styles.onboardingPreviewStatusRow}>
              <View style={styles.onboardingPreviewStatusDot} />
              <Text style={styles.onboardingPreviewStatus}>Open to chat</Text>
            </View>
          </View>
          <LeftIcon name="chevron-right" size={20} color="rgba(31,14,6,0.36)" />
        </View>
      </View>
    </OnboardingShell>
  );
}

function VenueDetectionStep({ number, icon, label }: { number: number; icon: "log-in" | "map-pin" | "users"; label: string }) {
  return (
    <View style={styles.onboardingDetectionStep}>
      <View style={styles.onboardingDetectionNumber}>
        <Text style={styles.onboardingDetectionNumberText}>{number}</Text>
      </View>
      <View style={styles.onboardingDetectionIcon}>
        <LeftIcon name={icon} size={26} color={T.onboardingInk} />
      </View>
      <Text style={styles.onboardingDetectionLabel}>{label}</Text>
    </View>
  );
}

export function LocationScreen({
  authError,
  notificationsEnabled = false,
  busy = false,
  onContinue,
  onBack,
  onOpenSettings,
}: {
  authError: string | null;
  notificationsEnabled?: boolean;
  busy?: boolean;
  onContinue: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <OnboardingShell
      step={3}
      onBack={onBack}
      footer={
        <PrimaryButton
          label={busy ? "Requesting permissions..." : "Allow location & notifications"}
          onPress={onContinue}
          loading={busy}
          leadingIcon="map-pin"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>Give Left the right access</Text>
        <Text style={styles.onboardingBody}>
          Location helps Left understand which venue you’re in. Notifications let Left tell you when something relevant happens.
        </Text>
      </View>

      <View accessibilityLabel="How venue detection works" style={styles.onboardingDetectionFlow}>
        <VenueDetectionStep number={1} icon="log-in" label="You enter a place" />
        <View style={styles.onboardingDetectionConnector} />
        <VenueDetectionStep number={2} icon="map-pin" label="Left detects the venue" />
        <View style={styles.onboardingDetectionConnector} />
        <VenueDetectionStep number={3} icon="users" label="Nearby people appear" />
      </View>

      <View style={styles.onboardingPermissionList}>
        <GlassSurface variant="soft" radius={glassRadii.card} contentStyle={styles.onboardingPrivacyCard}>
          <View style={styles.onboardingPrivacyIcon}>
            <LeftIcon name="map-pin" size={18} color={T.onboardingInk} />
          </View>
          <View style={styles.onboardingPrivacyCopy}>
            <Text style={styles.onboardingPrivacyTitle}>Location access is required</Text>
            <Text style={styles.onboardingPrivacyBody}>
              {Platform.OS === "web"
                ? "This preview uses location only while the page is open. Your exact location is not shown to other people."
                : "Left uses background location for venue-level matching. Your exact location is not shown to other people."}
            </Text>
          </View>
        </GlassSurface>
        <GlassSurface variant="soft" radius={glassRadii.card} contentStyle={styles.onboardingPrivacyCard}>
          <View style={styles.onboardingPrivacyIcon}>
            <LeftIcon name="radio" size={18} color={T.onboardingInk} />
          </View>
          <View style={styles.onboardingPrivacyCopy}>
            <Text style={styles.onboardingPrivacyTitle}>
              {Platform.OS === "web" ? "Notifications are available in the mobile app" : "Notifications are optional"}
            </Text>
            <Text style={styles.onboardingPrivacyBody}>
              {Platform.OS === "web"
                ? "The web preview will not request notification access."
                : notificationsEnabled
                  ? "Notifications are on. You can change this later in Settings."
                  : "You can allow notifications now or turn them on later in Settings."}
            </Text>
          </View>
        </GlassSurface>
      </View>
      {authError ? (
        <View accessibilityRole="alert" style={styles.onboardingRecoveryCard}>
          <Text style={styles.onboardingError}>{authError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.onboardingSettingsButton, pressed && styles.onboardingPressed]}
          >
            <LeftIcon name="settings" size={17} color={T.onboardingInk} />
            <Text style={styles.onboardingSettingsLabel}>Open device settings</Text>
          </Pressable>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

type LegalChecks = Record<LegalDocumentId, boolean>;

export function LegalAcknowledgementScreen({
  checks,
  onToggle,
  onOpenDocument,
  onBack,
  onContinue,
  busy = false,
  error,
  standalone = false,
}: {
  checks: LegalChecks;
  onToggle: (document: LegalDocumentId) => void;
  onOpenDocument: (document: LegalDocumentId) => void;
  onBack: () => void;
  onContinue: () => void;
  busy?: boolean;
  error?: string | null;
  standalone?: boolean;
}) {
  const canContinue = canCompleteLegalStep(legalContentReady, checks);

  return (
    <OnboardingShell
      step={standalone ? undefined : 4}
      showProgress={!standalone}
      onBack={onBack}
      footer={
        <PrimaryButton
          label={
            busy
              ? "Saving your choices…"
              : legalContentReady
                ? "Agree and finish"
                : "Continue in preview"
          }
          onPress={onContinue}
          disabled={!canContinue}
          loading={busy}
          trailingIcon="chevron-right"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>
          {standalone ? "One last step before you enter" : "Know what you’re joining"}
        </Text>
        <Text style={styles.onboardingBody}>
          {standalone
            ? "Review the policies that govern your account, privacy, and participation in Left."
            : "Review the policies that govern your account, privacy, and participation in Left."}
        </Text>
      </View>

      {!legalContentReady ? (
        <View accessibilityRole="alert" style={styles.onboardingLegalPending}>
          <LeftIcon name="alert-circle" size={20} color={T.visibilityOff} />
          <Text style={styles.onboardingLegalPendingText}>
            Approved legal content has not been published in this preview. No policy acceptance will be recorded.
          </Text>
        </View>
      ) : null}

      <View accessibilityLabel="Policies" style={styles.onboardingLegalList}>
        {(Object.keys(LEGAL_DOCUMENTS) as LegalDocumentId[]).map((documentId) => {
          const document = LEGAL_DOCUMENTS[documentId];
          return (
            <View key={documentId} style={styles.onboardingLegalRow}>
              {legalContentReady ? (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: checks[documentId] }}
                  accessibilityLabel={`Accept ${document.title}`}
                  onPress={() => onToggle(documentId)}
                  style={[
                    styles.onboardingLegalCheck,
                    checks[documentId] && styles.onboardingLegalCheckActive,
                  ]}
                >
                  {checks[documentId] ? (
                    <LeftIcon name="check" size={15} color={T.actionContent} />
                  ) : null}
                </Pressable>
              ) : (
                <View style={styles.onboardingLegalPendingDot} />
              )}
              <Pressable
                accessibilityRole="link"
                onPress={() => onOpenDocument(documentId)}
                style={styles.onboardingLegalLinkButton}
              >
                <Text style={styles.onboardingLegalLink}>{document.title}</Text>
                <Text style={styles.onboardingLegalSummary}>{document.summary}</Text>
                <Text style={styles.onboardingLegalStatus}>
                  {legalContentReady ? "Review document" : "Content pending"}
                </Text>
              </Pressable>
              <LeftIcon name="chevron-right" size={19} color={T.textMuted} />
            </View>
          );
        })}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.onboardingError}>{error}</Text> : null}
    </OnboardingShell>
  );
}

export function CompleteScreen({
  firstName,
  avatarStyle,
  onBack,
  onContinue,
}: {
  firstName: string;
  avatarStyle: AvatarStyle;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <OnboardingShell
      step={4}
      onBack={onBack}
      footer={<PrimaryButton label="See what’s nearby" onPress={onContinue} trailingIcon="arrow-up-right" tone="onboarding" />}
    >
      <View style={styles.onboardingCompleteHero}>
        <Text style={[styles.onboardingSparkle, styles.onboardingSparkleOne]}>✦</Text>
        <Text style={[styles.onboardingSparkle, styles.onboardingSparkleTwo]}>✧</Text>
        <Text style={[styles.onboardingSparkle, styles.onboardingSparkleThree]}>✦</Text>
        <View style={styles.onboardingOrbitOuter}>
          <View style={styles.onboardingOrbitInner}>
            <AvatarShape avatarStyle={avatarStyle} size="hero" />
          </View>
        </View>
        <Text accessibilityRole="header" style={styles.onboardingCompleteName}>{firstName}</Text>
        <Text style={styles.onboardingCompleteSignal}>Your signal is ready.</Text>
      </View>

      <GlassSurface
        variant="medium"
        radius={glassRadii.card}
        contentStyle={styles.onboardingReadyCard}
      >
        <View style={styles.onboardingReadyBadge}>
          <LeftIcon name="sun" size={20} color={T.onboardingInk} />
        </View>
        <Text style={styles.onboardingReadyText}>Ready to be found in the right places.</Text>
      </GlassSurface>
    </OnboardingShell>
  );
}
