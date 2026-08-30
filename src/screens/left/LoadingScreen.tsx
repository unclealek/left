import { Pressable, Text, View } from "react-native";
import { styles } from "../../app/leftTheme";
import { LeftLoadingAnimation } from "../../components/left/LeftLoadingAnimation";

export function LoadingScreen({
  error,
  onRetry,
}: {
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.loadingWrap} accessibilityRole={error ? "alert" : undefined}>
      <View style={styles.loadingCenter}>
        <LeftLoadingAnimation label="Restoring your private session" />
        <Text style={styles.loadingWordmark}>LEFT</Text>
      </View>
      {error ? (
        <>
          <Text style={styles.loadingErrorTitle}>We couldn’t open Left</Text>
          <Text style={styles.loadingCaption}>{error}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [styles.loadingRetryButton, pressed && styles.onboardingPressed]}
            >
              <Text style={styles.loadingRetryLabel}>Try again</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.loadingCaption}>Restoring your private session…</Text>
        </>
      )}
    </View>
  );
}
