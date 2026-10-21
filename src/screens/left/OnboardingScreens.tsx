import { t } from "../../features/preferences/translation-runtime";
import { useReducedMotion } from "../../components/left/use-navigation-accessibility";
import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AvatarStyle } from "../../types/left-domain";
import { avatarStyles, interestOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { PrimaryButton, SelectChip } from "../../components/left/ui";
import { LeftIcon } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { OnboardingAmbientScribbles } from "../../components/left/OnboardingAmbientScribbles";
import { validateFirstName } from "../../features/onboarding/onboarding-validation";
import { canCompleteLegalStep } from "../../features/onboarding/onboarding-flow";
import {
  LEGAL_DOCUMENTS,
  legalContentReady,
  type LegalDocumentId,
} from "../../features/legal/legal-config";

const avatarLabels: Record<AvatarStyle, string> = {
  geometric: "Soft Square",
  abstract: "Echo",
  minimal: "Orbit",
  soft: "Pebble",
};

function OnboardingProgress({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  const progress = useRef(new Animated.Value(Math.max(0, step - 1))).current;
  const reduceMotion = useReducedMotion();

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
              accessibilityLabel={t("Go back")}
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
              <Text style={styles.onboardingStepBadgeText}>{t("STEP")}{" "}{step}{" "}{t("OF 5")}</Text>
            </View>
          ) : (
            <View style={styles.onboardingStepBadge}>
              <Text style={styles.onboardingStepBadgeText}>{t("FINAL STEP")}</Text>
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

function AvatarShape({ avatarStyle, size }: { avatarStyle: AvatarStyle; size: "chip" | "hero" }) {
  const dimension = size === "hero" ? 112 : 48;

  return (
    <View style={[styles.onboardingAvatarHalo, { width: dimension, height: dimension }]}>
      <LinearGradient
        colors={
          avatarStyle === "minimal"
            ? [T.onboardingAccent, T.onboardingAccent, T.onboardingInk]
            : avatarStyle === "abstract"
              ? [T.onboardingInk, T.venueAccent, T.onboardingAccent]
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
  interests,
  onToggleInterest,
  onContinue,
  onBack,
  error,
}: {
  firstNameDraft: string;
  onChangeFirstName: (value: string) => void;
  avatarStyle: AvatarStyle;
  onPickAvatar: (style: AvatarStyle) => void;
  interests: string[];
  onToggleInterest: (interest: string) => void;
  onContinue: () => void;
  onBack: () => void;
  error?: string | null;
}) {
  const validation = validateFirstName(firstNameDraft);

  return (
    <OnboardingShell
      step={1}
      onBack={onBack}
      footer={
        <PrimaryButton
          label={t("Continue")}
          onPress={onContinue}
          disabled={!validation.valid || interests.length < 3}
          trailingIcon="chevron-right"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <View style={styles.onboardingEyebrowBadge}>
          <LeftIcon name="user" size={13} color={T.onboardingInk} />
          <Text style={styles.onboardingEyebrowBadgeText}>{t("AUTHENTIC PRESENCE")}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>{t("Tell us a little about you.")}</Text>
        <Text style={styles.onboardingBody}>{t("Help people nearby recognize your name and profile symbol.")}</Text>
      </View>

      <View style={styles.onboardingProfileHero}>
        <AvatarShape avatarStyle={avatarStyle} size="hero" />
        <View style={styles.onboardingProfileEditBadge}>
          <LeftIcon name="shuffle" size={17} color={T.onboardingInk} />
        </View>
        <Text style={styles.onboardingProfileHeroTitle}>{t("Your profile symbol")}</Text>
        <Text style={styles.onboardingProfileHeroBody}>{t("Choose how you appear to people nearby")}</Text>
      </View>

      <View style={styles.onboardingProfileForm}>
        <Text style={styles.onboardingFieldLabel}>{t("First name")}</Text>
        <TextInput
          value={firstNameDraft}
          onChangeText={onChangeFirstName}
          placeholder={t("Your first name")}
          placeholderTextColor={T.onboardingInkMuted}
          style={styles.onboardingNameInput}
          accessibilityLabel={t("First name")}
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
          <Text accessibilityRole="alert" style={styles.onboardingError}>{t(validation.message)}</Text>
        ) : null}
      </View>

      <View style={styles.onboardingShapeSection}>
        <View style={styles.onboardingShapeSectionHeader}>
          <Text style={styles.onboardingSectionTitle}>{t("Choose a shape")}</Text>
          <Text style={styles.onboardingShapeSelection}>{t(avatarLabels[avatarStyle])}</Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.onboardingShapeRow}>
          {avatarStyles.map((style) => {
            const active = avatarStyle === style;
            return (
              <Pressable
                key={style}
                accessibilityRole="radio"
                accessibilityLabel={t(avatarLabels[style])}
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

      <View style={styles.onboardingShapeSection}>
        <View style={styles.onboardingShapeSectionHeader}>
          <Text style={styles.onboardingSectionTitle}>{t("What are you into?")}</Text>
          <Text style={styles.onboardingShapeSelection}>{interests.length ? `${interests.length} selected` : t("Choose at least 3")}</Text>
        </View>
        <Text style={styles.onboardingBody}>{t("Choose at least three communities and conversations. These become the vibes you can share when you go visible.")}</Text>
        <View style={[styles.chipWrap, { marginTop: 12 }]}>
          {interestOptions.map((interest) => (
            <SelectChip
              key={interest}
              label={t(interest)}
              active={interests.includes(interest)}
              onPress={() => onToggleInterest(interest)}
            />
          ))}
        </View>
        {interests.length < 3 ? (
          <Text accessibilityRole="alert" style={styles.onboardingError}>
            {t(3 - interests.length === 1 ? "Choose {count} more interest to continue." : "Choose {count} more interests to continue.", { count: 3 - interests.length })}
          </Text>
        ) : null}
        {error ? <Text accessibilityRole="alert" style={styles.onboardingError}>{t(error)}</Text> : null}
      </View>

      <View style={styles.onboardingProfileTrustCard}>
        <View style={styles.onboardingProfileTrustIcon}>
          <LeftIcon name="shield" size={18} color={T.onboardingInk} />
        </View>
        <View style={styles.onboardingPrivacyCopy}>
          <Text style={styles.onboardingPrivacyTitle}>{t("Mutual respect and real presence")}</Text>
          <Text style={styles.onboardingPrivacyBody}>{t("Your profile stays intentionally simple and grounded in real places.")}</Text>
        </View>
      </View>
    </OnboardingShell>
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
          label={busy ? t("Requesting location...") : t("Allow location")}
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
        <Text accessibilityRole="header" style={[styles.onboardingTitle, styles.onboardingTitleCentered]}>{t("You’re in control.")}</Text>
        <Text style={styles.onboardingBody}>{t("Your safety and privacy are fundamental to every connection you make here.")}{" "}</Text>
      </View>

      <View accessibilityLabel={t("Privacy and safety controls")} style={styles.onboardingSafetyFeatureList}>
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
              <Text style={styles.onboardingSafetyFeatureTitle}>{t(item.title)}</Text>
              <Text style={styles.onboardingSafetyFeatureBody}>{t(item.body)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.onboardingPrivacyQuote}>
        <View style={styles.onboardingPrivacyQuoteRule} />
        <Text style={styles.onboardingPrivacyQuoteText}>{t("“A good community begins when every person feels respected and safe.”")}</Text>
      </View>

      <Pressable accessibilityRole="link" onPress={onOpenSettings} style={styles.onboardingPermissionLink}>
        <LeftIcon name="map-pin" size={18} color={T.onboardingAccent} />
        <Text style={styles.onboardingPermissionLinkText}>
          {Platform.OS === "web" ? t("Review browser location settings") : t("Review device location settings")}
        </Text>
      </Pressable>
      {authError ? (
        <View accessibilityRole="alert" style={styles.onboardingRecoveryCard}>
          <Text style={styles.onboardingError}>{t(authError)}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.onboardingSettingsButton, pressed && styles.onboardingPressed]}
          >
            <LeftIcon name="settings" size={17} color={T.onboardingInk} />
            <Text style={styles.onboardingSettingsLabel}>{t("Open device settings")}</Text>
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
            label={enabled ? t("Continue") : busy ? t("Requesting notifications...") : t("Allow notifications")}
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
          <Text style={styles.onboardingEyebrowBadgeText}>{t("QUIET UPDATES")}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>{t("Stay in the loop, quietly.")}</Text>
        <Text style={styles.onboardingBody}>{t("Notifications are optional. Left only uses them for moments that help you act, connect, or stay safe.")}{" "}</Text>
      </View>

      <View accessibilityLabel={t("Notification types")} style={styles.onboardingMomentList}>
        {notificationMoments.map((moment) => (
          <View key={moment.title} style={styles.onboardingMomentRow}>
            <View style={styles.onboardingMomentIcon}>
              <LeftIcon name={moment.icon} size={19} color={T.onboardingInk} />
            </View>
            <View style={styles.onboardingMomentCopy}>
              <Text style={styles.onboardingMomentTitle}>{t(moment.title)}</Text>
              <Text style={styles.onboardingMomentBody}>{t(moment.body)}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.onboardingPermissionNote}>{t("You can change this any time in Settings. Choosing “Not now” will not block account setup.")}{" "}</Text>
    </OnboardingShell>
  );
}

export function LegalAcknowledgementScreen({
  agreed, onToggle, onOpenDocument, onBack, onContinue,
  busy = false, error, standalone = false,
}: {
  agreed: boolean;
  onToggle: () => void;
  onOpenDocument: (document: LegalDocumentId) => void;
  onBack: () => void;
  onContinue: () => void;
  busy?: boolean;
  error?: string | null;
  standalone?: boolean;
}) {
  const canContinue = canCompleteLegalStep(legalContentReady, agreed);
  return (
    <OnboardingShell
      step={standalone ? 5 : 2}
      showProgress={!standalone}
      onBack={onBack}
      footer={
        <PrimaryButton label={t("Agree & Continue")} onPress={onContinue}
          disabled={!canContinue || busy} loading={busy} trailingIcon="chevron-right" tone="onboarding" />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text accessibilityRole="header" style={styles.onboardingTitle}>{t("Before you join Left")}</Text>
        <Text style={styles.onboardingBody}>{t("Welcome to a community designed for real-world social discovery.")}</Text>
        <Text style={styles.onboardingBody}>{t("By continuing, you agree to Left’s Terms of Service and Community Guidelines, and acknowledge that our Privacy Policy has been made available to you.")}{" "}</Text>
      </View>
      <View style={styles.onboardingLegalSection}>
        <View accessibilityLabel={t("Legal documents")} style={styles.onboardingFinalPolicyList}>
          {(Object.keys(LEGAL_DOCUMENTS) as LegalDocumentId[]).map((id) => (
            <Pressable key={id} accessibilityRole="link" onPress={() => onOpenDocument(id)}
              style={({ pressed }) => [styles.onboardingFinalPolicyRow, pressed && styles.onboardingPressed]}>
              <View style={styles.onboardingFinalPolicyIcon}>
                <LeftIcon name={id === "privacy" ? "shield" : "file-text"} size={20} color={T.onboardingAccent} />
              </View>
              <View style={styles.onboardingLegalLinkButton}>
                <Text style={styles.onboardingFinalPolicyTitle}>{t(LEGAL_DOCUMENTS[id].title)}</Text>
                {LEGAL_DOCUMENTS[id].version ? <Text style={styles.onboardingFinalPolicySummary}>{t("Version")}{" "}{LEGAL_DOCUMENTS[id].version}{" "}{t("· Effective")}{" "}{LEGAL_DOCUMENTS[id].publishedAt}
                </Text> : null}
              </View>
              <LeftIcon name="external-link" size={20} color={T.onboardingInkMuted} />
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="checkbox"
          accessibilityLabel={t("I agree to the Terms of Service and Community Guidelines")}
          accessibilityState={{ checked: agreed, disabled: busy || !legalContentReady }}
          disabled={busy || !legalContentReady} onPress={onToggle}
          style={({ pressed }) => [styles.onboardingFinalConsent, pressed && styles.onboardingPressed]}>
          <View style={[styles.onboardingPledgeCheck, agreed && styles.onboardingLegalCheckActive]}>
            {agreed ? <LeftIcon name="check" size={16} color={T.actionContent} /> : null}
          </View>
          <View style={styles.onboardingPledgeCopy}>
            <Text style={styles.onboardingPledgeTitle}>{t("I agree to the Terms of Service and Community Guidelines.")}</Text>
            <Text style={styles.onboardingPledgeBody}>{t("The Privacy Policy explains how Left uses personal data. Location and notification permissions remain separate.")}</Text>
          </View>
        </Pressable>
        {!legalContentReady ? <View accessibilityRole="alert" style={styles.onboardingLegalPending}>
          <Text style={styles.onboardingLegalPendingText}>{t("Left’s legal documents are not available yet. Please try again after the next update.")}</Text>
        </View> : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.onboardingError}>{t(error)}</Text> : null}
    </OnboardingShell>
  );
}
