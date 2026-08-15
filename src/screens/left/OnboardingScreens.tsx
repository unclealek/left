import type { ReactNode } from "react";
import { Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AvatarStyle } from "../../types/left-domain";
import { avatarStyles } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/left/ui";
import { LeftIcon } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { GlassSurface, glassRadii } from "../../components/glass";

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
}: {
  step: 1 | 2 | 3 | 4;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.onboardingPage, { minHeight: Math.max(620, height - 150) }]}>
      <View style={styles.onboardingHeader}>
        <LeftLogoMark size={48} />
        <View style={styles.onboardingProgress} accessibilityLabel={`Onboarding step ${step} of 4`}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[
                styles.onboardingProgressTrack,
                item <= Math.min(step, 3) && styles.onboardingProgressTrackActive,
              ]}
            />
          ))}
        </View>
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
}: {
  firstNameDraft: string;
  onChangeFirstName: (value: string) => void;
  onContinue: () => void;
}) {
  const firstName = firstNameDraft.trim();

  return (
    <OnboardingShell
      step={1}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          disabled={!firstName}
          trailingIcon="chevron-right"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text style={styles.onboardingTitle}>What should people call you?</Text>
        <Text style={styles.onboardingBody}>Just your first name. Keep it simple.</Text>
      </View>

      <View style={styles.onboardingNameBlock}>
        <TextInput
          value={firstNameDraft}
          onChangeText={(value) => onChangeFirstName(value.split(" ")[0] ?? "")}
          placeholder="Your first name"
          placeholderTextColor="rgba(31,14,6,0.38)"
          style={styles.onboardingNameInput}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (firstName) onContinue();
          }}
        />
        {firstName ? (
          <View style={styles.onboardingGreeting}>
            <View style={styles.onboardingGreetingIcon}>
              <LeftIcon name="smile" size={19} color={T.onboardingInk} />
            </View>
            <Text style={styles.onboardingGreetingText}>Nice to meet you, {firstName}.</Text>
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
}: {
  firstName: string;
  avatarStyle: AvatarStyle;
  onPick: (style: AvatarStyle) => void;
  onContinue: () => void;
}) {
  function surpriseMe() {
    const currentIndex = avatarStyles.indexOf(avatarStyle);
    onPick(avatarStyles[(currentIndex + 1 + Math.floor(Math.random() * (avatarStyles.length - 1))) % avatarStyles.length]);
  }

  return (
    <OnboardingShell
      step={2}
      footer={<PrimaryButton label="Continue" onPress={onContinue} trailingIcon="chevron-right" tone="onboarding" />}
    >
      <View style={styles.onboardingIntroBlock}>
        <Text style={styles.onboardingTitle}>Pick your social shape</Text>
        <Text style={styles.onboardingBody}>This is how you’ll appear to people nearby.</Text>
      </View>

      <View style={styles.onboardingAvatarGrid}>
        {avatarStyles.map((style) => {
          const active = avatarStyle === style;
          return (
            <Pressable
              key={style}
              onPress={() => onPick(style)}
              accessibilityRole="button"
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
}: {
  authError: string | null;
  busy?: boolean;
  onContinue: () => void;
}) {
  return (
    <OnboardingShell
      step={3}
      footer={
        <PrimaryButton
          label={busy ? "Turning on venue detection..." : "Turn on venue detection"}
          onPress={onContinue}
          loading={busy}
          leadingIcon="map-pin"
          tone="onboarding"
        />
      }
    >
      <View style={styles.onboardingIntroBlock}>
        <Text style={styles.onboardingTitle}>Let Left find the room</Text>
        <Text style={styles.onboardingBody}>
          Left uses location to understand which venue you’re in and show the people sharing that place.
        </Text>
      </View>

      <View style={styles.onboardingDetectionFlow}>
        <VenueDetectionStep number={1} icon="log-in" label="You enter a place" />
        <View style={styles.onboardingDetectionConnector} />
        <VenueDetectionStep number={2} icon="map-pin" label="Left detects the venue" />
        <View style={styles.onboardingDetectionConnector} />
        <VenueDetectionStep number={3} icon="users" label="Nearby people appear" />
      </View>

      <GlassSurface
        variant="soft"
        radius={glassRadii.card}
        contentStyle={styles.onboardingPrivacyCard}
      >
        <View style={styles.onboardingPrivacyIcon}>
          <LeftIcon name="lock" size={18} color={T.onboardingInk} />
        </View>
        <View style={styles.onboardingPrivacyCopy}>
          <Text style={styles.onboardingPrivacyTitle}>Your exact location is not shown to other people.</Text>
          <Text style={styles.onboardingPrivacyBody}>Location is used to understand shared venues and nearby presence.</Text>
        </View>
      </GlassSurface>
      {authError ? <Text style={styles.onboardingError}>{authError}</Text> : null}
    </OnboardingShell>
  );
}

export function CompleteScreen({
  firstName,
  avatarStyle,
  onContinue,
}: {
  firstName: string;
  avatarStyle: AvatarStyle;
  onContinue: () => void;
}) {
  return (
    <OnboardingShell
      step={4}
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
        <Text style={styles.onboardingCompleteName}>{firstName}</Text>
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
