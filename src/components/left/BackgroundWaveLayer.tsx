import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { styles } from "../../app/leftTheme";

const SEGMENT_COUNT = 8;
const SEGMENT_WIDTH = 180;
const WAVE_AMPLITUDE = 52;
const TRACK_TRAVEL = 180;

function WaveTrack({
  top,
  duration,
  reverse = false,
  opacity,
}: {
  top: number;
  duration: number;
  reverse?: boolean;
  opacity: number;
}) {
  const initialOffset = reverse ? -TRACK_TRAVEL : 0;
  const targetOffset = reverse ? 0 : -TRACK_TRAVEL;
  const translateX = useRef(new Animated.Value(initialOffset)).current;
  const segments = useMemo(() => Array.from({ length: SEGMENT_COUNT }), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: targetOffset,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: initialOffset,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [duration, initialOffset, targetOffset, translateX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.waveTrack,
        {
          top,
          opacity,
          width: SEGMENT_COUNT * SEGMENT_WIDTH,
          transform: [{ translateX }],
        },
      ]}
    >
      {segments.map((_, index) => (
        <View key={`wave-segment-${top}-${index}`} style={styles.waveSegmentClip}>
          <View
            style={[
              styles.waveSegment,
              {
                transform: [{ translateY: index % 2 === 0 ? 0 : -WAVE_AMPLITUDE }],
              },
            ]}
          />
        </View>
      ))}
    </Animated.View>
  );
}

export function BackgroundWaveLayer() {
  return (
    <View pointerEvents="none" style={styles.waveLayer}>
      <WaveTrack top={118} duration={22000} opacity={0.24} />
      <WaveTrack top={390} duration={26000} reverse opacity={0.18} />
      <WaveTrack top={720} duration={30000} opacity={0.14} />
    </View>
  );
}
