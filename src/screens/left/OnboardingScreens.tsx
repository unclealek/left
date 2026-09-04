import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AvatarStyle } from "../../types/left-domain";
import { avatarStyles } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/left/ui";
import { LeftIcon } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { OnboardingAmbientScribbles } from "../../components/left/OnboardingAmbientScribbles";
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

function OnboardingProgress({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  const progress = useRef(new Animated.Value(Math.max(0, step - 1))).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) {
      progress.setValue(step);
      return;
    }
    Animated.timing(progress, {
      toValue: step,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, reduceMotion, step]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 5],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={styles.onboardingProgress}
      accessibilityRole="progressbar"
      accessibilityLabel={`Onboarding step ${step} of 5`}
      accessibilityValue={{ min: 1, max: 5, now: step }}
    >
      <View style={styles.onboardingProgressRail}>
        <Animated.View style={[styles.onboardingProgressFill, { width: fillWidth }]} />
      </View>
      <View pointerEvents="none" style={styles.onboardingProgressNodes}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[
              styles.onboardingProgressNode,
              { left: `${item * 20}%` },
              item < step && styles.onboardingProgressNodeComplete,
              item === step && styles.onboardingProgressNodeCurrent,
            ]}
          >
            {item < step ? <LeftIcon name="check" size={8} color={T.actionContent} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function OnboardingShell({
  step,
  children,
  footer,
  onBack,
  showProgress = true,
}: {
  step?: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
  showProgress?: boolean;
}) {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.onboardingPage, { minHeight: Math.max(560, height - 120) }]}>
      <OnboardingAmbientScribbles />
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
          {showProgress && step ? (
            <View style={styles.onboardingStepBadge}>
              <View style={styles.onboardingStepBadgeDot} />
              <Text style={styles.onboardingStepBadgeText}>STEP {step} OF 5</Text>
            </View>
          ) : (
            <View style={styles.onboardingStepBadge}>
              <Text style={styles.onboardingStepBadgeText}>FINAL STEP</Text>
            </View>
          )}
          <View style={styles.onboardingHeaderMark}>
            <LeftLogoMark size={25} />
          </View>
        </View>
        {showProgress && step ? (
          <OnboardingProgress step={step} />
        ) : null}
      </View>
      <View style={styles.onboardingContent}>{children}</View>
      <View style={styles.onboardingFooter}>{footer}</View>
    </View>
  );
}

function AvatarShape({ avatarStyle, size = "tile" }: { avatarStyle: AvatarStyle; size?: "chip" | "tile" | "preview" | "hero" }) {
  const large = size === "hero";
  const preview = size === "preview";
  const chip = size === "chip";
  const dimension = large ? 112 : preview ? 66 : chip ? 48 : 72;

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
  avatarStyle,
  onPickAvatar,
  onContinue,
  onBack,
}: {
  firstNameDraft: string;
  onChangeFirstName: (value: string) => void;
  avatarStyle: AvatarStyle;
  onPickAvatar: (style: AvatarStyle) => void;
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
        <View style={styles.onboardingEyebrowBadge}>
          <LeftIcon name="user" size={13} color={T.onboardingInk} />
          <Text style={styles.onboardingEyebrowBadgeText}>AUTHENTIC PRESENCE</Text>
        </View>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>Tell us a little about you.</Text>
        <Text style={styles.onboardingBody}>Help people nearby recognize your name and profile symbol.</Text>
      </View>

      <View style={styles.onboardingProfileHero}>
        <AvatarShape avatarStyle={avatarStyle} size="hero" />
        <View style={styles.onboardingProfileEditBadge}>
          <LeftIcon name="shuffle" size={17} color={T.onboardingInk} />
        </View>
        <Text style={styles.onboardingProfileHeroTitle}>Your profile symbol</Text>
        <Text style={styles.onboardingProfileHeroBody}>Choose how you appear to people nearby</Text>
      </View>

      <View style={styles.onboardingProfileForm}>
        <Text style={styles.onboardingFieldLabel}>First name</Text>
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
          onSubmitEditing={() => {
            if (validation.valid) onContinue();
          }}
        />
        {!validation.valid && firstNameDraft.length > 0 ? (
          <Text accessibilityRole="alert" style={styles.onboardingError}>{validation.message}</Text>
        ) : null}
      </View>

      <View style={styles.onboardingShapeSection}>
        <View style={styles.onboardingShapeSectionHeader}>
          <Text style={styles.onboardingSectionTitle}>Choose a shape</Text>
          <Text style={styles.onboardingShapeSelection}>{avatarLabels[avatarStyle]}</Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.onboardingShapeRow}>
          {avatarStyles.map((style) => {
            const active = avatarStyle === style;
            return (
              <Pressable
                key={style}
                accessibilityRole="radio"
                accessibilityLabel={avatarLabels[style]}
                accessibilityState={{ selected: active }}
                onPress={() => onPickAvatar(style)}
                style={({ pressed }) => [
                  styles.onboardingShapeOption,
                  active && styles.onboardingShapeOptionActive,
                  pressed && styles.onboardingPressed,
                ]}
              >
                <AvatarShape avatarStyle={style} size="chip" />
                {active ? (
                  <View style={styles.onboardingShapeCheck}>
                    <LeftIcon name="check" size={12} color={T.actionContent} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.onboardingProfileTrustCard}>
        <View style={styles.onboardingProfileTrustIcon}>
          <LeftIcon name="shield" size={18} color={T.onboardingInk} />
        </View>
        <View style={styles.onboardingPrivacyCopy}>
          <Text style={styles.onboardingPrivacyTitle}>Mutual respect and real presence</Text>
          <Text style={styles.onboardingPrivacyBody}>Your profile stays intentionally simple and grounded in real places.</Text>
        </View>
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
        <Text accessibilityRole="header" style={styles.onboardingTitle}>Pick your profile symbol</Text>
        <Text style={styles.onboardingBody}>This is how you’ll appear to people nearby.</Text>
      </View>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Profile symbol"
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
  busy = false,
  onContinue,
  onBack,
  onOpenSettings,
}: {
  authError: string | null;
  busy?: boolean;
  onContinue: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <OnboardingShell
      step={4}
      onBack={onBack}
      footer={
        <PrimaryButton
          label={busy ? "Requesting location..." : "Allow location"}
          onPress={onContinue}
          loading={busy}
          leadingIcon="map-pin"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <View style={styles.onboardingPermissionHeroIcon}>
          <LeftIcon name="heart" size={35} color={T.onboardingInk} />
          <View style={styles.onboardingPermissionHeroBadge}>
            <LeftIcon name="shield" size={14} color={T.actionContent} />
          </View>
        </View>
        <Text accessibilityRole="header" style={[styles.onboardingTitle, styles.onboardingTitleCentered]}>You’re in control.</Text>
        <Text style={styles.onboardingBody}>
          Your safety and privacy are fundamental to every connection you make here.
        </Text>
      </View>

      <View accessibilityLabel="Privacy and safety controls" style={styles.onboardingSafetyFeatureList}>
        {[
          { icon: "eye" as const, title: "Control your visibility", body: "Choose when people can discover you at a shared venue." },
          { icon: "lock" as const, title: "Your location stays protected", body: "Left uses venue context. Your precise coordinates are never shown to other people." },
          { icon: "shield" as const, title: "Block and report", body: "Quickly block or quietly report behaviour that makes you uncomfortable." },
          { icon: "settings" as const, title: "Change settings anytime", body: "Privacy controls remain available inside your profile." },
        ].map((item) => (
          <View key={item.title} style={styles.onboardingSafetyFeatureCard}>
            <View style={styles.onboardingSafetyFeatureIcon}>
              <LeftIcon name={item.icon} size={21} color={T.onboardingInk} />
            </View>
            <View style={styles.onboardingPrincipleCopy}>
              <Text style={styles.onboardingSafetyFeatureTitle}>{item.title}</Text>
              <Text style={styles.onboardingSafetyFeatureBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.onboardingPrivacyQuote}>
        <View style={styles.onboardingPrivacyQuoteRule} />
        <Text style={styles.onboardingPrivacyQuoteText}>“A good community begins when every person feels respected and safe.”</Text>
      </View>

      <Pressable accessibilityRole="link" onPress={onOpenSettings} style={styles.onboardingPermissionLink}>
        <LeftIcon name="map-pin" size={18} color={T.onboardingAccent} />
        <Text style={styles.onboardingPermissionLinkText}>
          {Platform.OS === "web" ? "Review browser location settings" : "Review device location settings"}
        </Text>
      </Pressable>
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

export function NotificationScreen({
  enabled = false,
  busy = false,
  onContinue,
  onSkip,
  onBack,
}: {
  enabled?: boolean;
  busy?: boolean;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const notificationMoments: Array<{ icon: "users" | "radio" | "shield"; title: string; body: string }> = [
    { icon: "users", title: "Mutual openings", body: "Know when the timing is right for both people." },
    { icon: "radio", title: "Venue moments", body: "Get a quiet prompt after you have settled into a place." },
    { icon: "shield", title: "Safety and account", body: "Receive important trust, privacy, and account updates." },
  ];

  return (
    <OnboardingShell
      step={3}
      onBack={onBack}
      footer={
        <View style={styles.onboardingPermissionFooter}>
          <PrimaryButton
            label={enabled ? "Continue" : busy ? "Requesting notifications..." : "Allow notifications"}
            onPress={onContinue}
            loading={busy}
            leadingIcon="radio"
            tone="onboarding"
          />
          {!enabled ? (
            <Pressable
              accessibilityRole="button"
              onPress={onSkip}
              style={({ pressed }) => [styles.onboardingNotNowButton, pressed && styles.onboardingPressed]}
            >
              <Text style={styles.onboardingNotNowLabel}>Not now</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <View style={styles.onboardingEyebrowBadge}>
          <LeftIcon name="radio" size={13} color={T.onboardingInk} />
          <Text style={styles.onboardingEyebrowBadgeText}>QUIET UPDATES</Text>
        </View>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>Stay in the loop, quietly.</Text>
        <Text style={styles.onboardingBody}>
          Notifications are optional. Left only uses them for moments that help you act, connect, or stay safe.
        </Text>
      </View>

      <View accessibilityLabel="Notification types" style={styles.onboardingMomentList}>
        {notificationMoments.map((moment) => (
          <View key={moment.title} style={styles.onboardingMomentRow}>
            <View style={styles.onboardingMomentIcon}>
              <LeftIcon name={moment.icon} size={19} color={T.onboardingInk} />
            </View>
            <View style={styles.onboardingMomentCopy}>
              <Text style={styles.onboardingMomentTitle}>{moment.title}</Text>
              <Text style={styles.onboardingMomentBody}>{moment.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.onboardingPermissionNote}>
        You can change this any time in Settings. Choosing “Not now” will not block account setup.
      </Text>
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
  const canContinue = standalone
    ? canCompleteLegalStep(legalContentReady, checks)
    : checks.community;
  const allPoliciesAccepted = Object.values(checks).every(Boolean);

  function toggleAllPolicies() {
    (Object.keys(checks) as LegalDocumentId[]).forEach((documentId) => {
      if (checks[documentId] === allPoliciesAccepted) onToggle(documentId);
    });
  }

  return (
    <OnboardingShell
      step={standalone ? 5 : 2}
      showProgress
      onBack={onBack}
      footer={
        <PrimaryButton
          label={
            busy
              ? "Saving your choices…"
              : standalone
                ? legalContentReady
                  ? "Join the community"
                  : "Finish setup"
                : "I agree"
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
          {standalone ? "One last thing." : "Good people make good communities."}
        </Text>
        <Text style={styles.onboardingBody}>
          {standalone
            ? "Before entering Left, review the policies that protect our community and your privacy."
            : "We build real connection through intentional presence, kindness, and respect for one another."}
        </Text>
      </View>

      {!standalone ? (
        <>
          <View accessibilityLabel="Community principles" style={styles.onboardingPrincipleList}>
            {[
              { icon: "heart" as const, title: "Be respectful", body: "Treat people as you would in real life. Welcome individuality and assume positive intent." },
              { icon: "minus-circle" as const, title: "Respect boundaries", body: "Check in before assuming conversational, emotional, or physical space." },
              { icon: "smile" as const, title: "Be yourself", body: "Authenticity makes real connection easier. No performances or false personas." },
              { icon: "shield" as const, title: "Keep the community safe", body: "Block or report behaviour that makes you or someone else uncomfortable." },
            ].map((rule) => (
              <View key={rule.title} style={styles.onboardingPrincipleCard}>
                <View style={styles.onboardingPrincipleIcon}>
                  <LeftIcon name={rule.icon} size={21} color={T.onboardingInk} />
                </View>
                <View style={styles.onboardingPrincipleCopy}>
                  <Text style={styles.onboardingPrincipleTitle}>{rule.title}</Text>
                  <Text style={styles.onboardingPrincipleBody}>{rule.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.onboardingPledgeCard}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checks.community }}
              accessibilityLabel="Agree to follow the Community Guidelines"
              onPress={() => onToggle("community")}
              style={[
                styles.onboardingPledgeCheck,
                checks.community && styles.onboardingLegalCheckActive,
              ]}
            >
              {checks.community ? <LeftIcon name="check" size={16} color={T.actionContent} /> : null}
            </Pressable>
            <View style={styles.onboardingPledgeCopy}>
              <Text style={styles.onboardingPledgeTitle}>I agree to follow the Community Guidelines</Text>
              <Text style={styles.onboardingPledgeBody}>I’ll help nurture a warm, accountable space.</Text>
              <Pressable accessibilityRole="link" onPress={() => onOpenDocument("community")} style={styles.onboardingPledgeLink}>
                <LeftIcon name="book-open" size={16} color={T.onboardingAccent} />
                <Text style={styles.onboardingPledgeLinkText}>Read Community Guidelines</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.onboardingSafetyStatement}>Zero tolerance for harassment, discrimination, or hate speech.</Text>
        </>
      ) : null}

      {standalone ? (
        <View style={styles.onboardingLegalSection}>
          <View accessibilityLabel="Policies" style={styles.onboardingFinalPolicyList}>
            {(Object.keys(LEGAL_DOCUMENTS) as LegalDocumentId[]).map((documentId) => {
              const document = LEGAL_DOCUMENTS[documentId];
              return (
                <Pressable
                  key={documentId}
                  accessibilityRole="link"
                  onPress={() => onOpenDocument(documentId)}
                  style={({ pressed }) => [styles.onboardingFinalPolicyRow, pressed && styles.onboardingPressed]}
                >
                  <View style={styles.onboardingFinalPolicyIcon}>
                    <LeftIcon name={documentId === "privacy" ? "shield" : "file-text"} size={20} color={T.onboardingAccent} />
                  </View>
                  <View style={styles.onboardingLegalLinkButton}>
                    <Text style={styles.onboardingFinalPolicyTitle}>{document.title}</Text>
                    <Text numberOfLines={1} style={styles.onboardingFinalPolicySummary}>{document.summary}</Text>
                  </View>
                  <LeftIcon name="chevron-right" size={20} color={T.onboardingInkMuted} />
                </Pressable>
              );
            })}
          </View>

          {legalContentReady ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allPoliciesAccepted }}
              onPress={toggleAllPolicies}
              style={({ pressed }) => [styles.onboardingFinalConsent, pressed && styles.onboardingPressed]}
            >
              <View style={[styles.onboardingPledgeCheck, allPoliciesAccepted && styles.onboardingLegalCheckActive]}>
                {allPoliciesAccepted ? <LeftIcon name="check" size={16} color={T.actionContent} /> : null}
              </View>
              <View style={styles.onboardingPledgeCopy}>
                <Text style={styles.onboardingPledgeTitle}>I understand and accept all policies</Text>
                <Text style={styles.onboardingPledgeBody}>I agree to Left’s terms, privacy rules, and community standards.</Text>
              </View>
            </Pressable>
          ) : (
            <View accessibilityRole="alert" style={styles.onboardingLegalPending}>
              <LeftIcon name="alert-circle" size={18} color={T.visibilityOff} />
              <Text style={styles.onboardingLegalPendingText}>
                These preview documents are still being finalized. No policy acceptance will be recorded yet.
              </Text>
            </View>
          )}
        </View>
      ) : null}

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
