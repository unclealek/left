import { useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassSurface, glassRadii } from "../../components/glass";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { PrimaryButton } from "../../components/left/ui";
import { T, styles } from "../../app/leftTheme";

type IntroSlide = {
  eyebrow: string;
  title: string;
  body: string;
  icon: LeftIconName;
  accent: string;
  detail: string;
};

const SLIDES: IntroSlide[] = [
  {
    eyebrow: "REAL-WORLD CONNECTION",
    title: "Find the people already in the room.",
    body: "Left makes it easier to notice a good conversation without turning the moment into another feed.",
    icon: "users",
    accent: "#D5EE91",
    detail: "Same place · Same time",
  },
  {
    eyebrow: "MUTUAL OPENNESS",
    title: "Only show up when you mean it.",
    body: "Choose when you are open to being found. See nearby people only when the signal is mutual and the timing feels right.",
    icon: "eye",
    accent: "#E4C89B",
    detail: "Consent before contact",
  },
  {
    eyebrow: "PRIVATE BY DEFAULT",
    title: "Your location stays yours.",
    body: "Left uses your location to understand the venue, never to draw your exact position for other people.",
    icon: "lock",
    accent: "#C7DCD7",
    detail: "Venue context, not a pin",
  },
];

function IntroVisual({ slide, index }: { slide: IntroSlide; index: number }) {
  return (
    <View style={styles.preAuthVisual} accessibilityLabel={slide.detail}>
      <View style={[styles.preAuthVisualHalo, { backgroundColor: `${slide.accent}33` }]} />
      <View style={[styles.preAuthVisualRing, { borderColor: `${slide.accent}99` }]}>
        <View style={[styles.preAuthVisualCore, { backgroundColor: slide.accent }]}>
          <LeftIcon name={slide.icon} size={index === 0 ? 54 : 48} color={T.onboardingInk} />
        </View>
      </View>
      {index === 0 ? (
        <>
          <View style={[styles.preAuthSignalDot, styles.preAuthSignalDotOne, { backgroundColor: slide.accent }]} />
          <View style={[styles.preAuthSignalDot, styles.preAuthSignalDotTwo, { backgroundColor: slide.accent }]} />
          <View style={[styles.preAuthSignalDot, styles.preAuthSignalDotThree, { backgroundColor: slide.accent }]} />
        </>
      ) : null}
      {index === 1 ? (
        <View style={styles.preAuthVisualOrbit}>
          <View style={[styles.preAuthOrbitDot, { backgroundColor: slide.accent }]} />
        </View>
      ) : null}
      {index === 2 ? (
        <View style={styles.preAuthPrivacyPill}>
          <LeftIcon name="map-pin" size={14} color={T.onboardingInk} />
          <Text style={styles.preAuthPrivacyPillText}>VENUE ONLY</Text>
        </View>
      ) : null}
    </View>
  );
}

export function PreAuthOnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = SLIDES[slideIndex];
  const isLastSlide = slideIndex === SLIDES.length - 1;

  function advance() {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setSlideIndex((current) => current + 1);
  }

  return (
    <View
      style={[
        styles.preAuthWrap,
        {
          minHeight: Math.max(620, height),
          paddingTop: Math.max(18, insets.top + 10),
          paddingBottom: Math.max(20, insets.bottom + 14),
        },
      ]}
    >
      <View pointerEvents="none" style={styles.preAuthAmbientLayer}>
        <View style={[styles.preAuthAmbientOrb, styles.preAuthAmbientOrbOne]} />
        <View style={[styles.preAuthAmbientOrb, styles.preAuthAmbientOrbTwo]} />
        <View style={[styles.preAuthAmbientOrb, styles.preAuthAmbientOrbThree]} />
        <View style={styles.preAuthAmbientArc} />
      </View>

      <LinearGradient
        colors={["rgba(198,227,133,0.25)", "rgba(228,200,155,0.12)", "rgba(255,255,255,0)"]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 0.9 }}
        style={styles.preAuthGlow}
      />

      <View style={styles.preAuthHeader}>
        <View style={styles.preAuthBrand}>
          <View style={styles.preAuthLogoRing}>
            <LeftLogoMark size={34} />
          </View>
          <Text style={styles.preAuthWordmark}>LEFT</Text>
        </View>
        <Pressable
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          style={({ pressed }) => [styles.preAuthSkip, pressed && styles.preAuthPressed]}
        >
          <Text style={styles.preAuthSkipLabel}>Skip</Text>
          <LeftIcon name="arrow-up-right" size={15} color={T.onboardingInkSoft} />
        </Pressable>
      </View>

      <View style={styles.preAuthMain}>
        <IntroVisual slide={slide} index={slideIndex} />

        <View style={styles.preAuthCopy}>
          <Text style={styles.preAuthEyebrow}>{slide.eyebrow}</Text>
          <Text style={styles.preAuthTitle}>{slide.title}</Text>
          <Text style={styles.preAuthBody}>{slide.body}</Text>
        </View>

        <GlassSurface variant="soft" radius={glassRadii.card} contentStyle={styles.preAuthDetailCard}>
          <View style={[styles.preAuthDetailIcon, { backgroundColor: `${slide.accent}99` }]}>
            <LeftIcon name={slide.icon} size={18} color={T.onboardingInk} />
          </View>
          <Text style={styles.preAuthDetailText}>{slide.detail}</Text>
          <Text style={styles.preAuthDetailCount}>
            {String(slideIndex + 1).padStart(2, "0")} / 03
          </Text>
        </GlassSurface>
      </View>

      <View style={styles.preAuthFooter}>
        <View style={styles.preAuthProgress} accessibilityLabel={`Introduction page ${slideIndex + 1} of 3`}>
          {SLIDES.map((item, index) => (
            <View
              key={item.eyebrow}
              style={[
                styles.preAuthProgressDot,
                index === slideIndex && styles.preAuthProgressDotActive,
              ]}
            />
          ))}
        </View>
        <PrimaryButton
          label={isLastSlide ? "Enter Left" : "Keep going"}
          onPress={advance}
          trailingIcon={isLastSlide ? "arrow-up-right" : "chevron-right"}
          tone="onboarding"
        />
        <Text style={styles.preAuthFootnote}>A quieter way to meet the room.</Text>
      </View>
    </View>
  );
}