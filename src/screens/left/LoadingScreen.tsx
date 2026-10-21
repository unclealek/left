import { t } from "../../features/preferences/translation-runtime";
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
        <LeftLoadingAnimation label={t("Bringing nearby moments into focus")} />
        <Text style={styles.loadingWordmark}>{t("LEFT")}</Text>
      </View>
      {error ? (
        <>
          <Text style={styles.loadingErrorTitle}>{t("We couldn’t open Left")}</Text>
          <Text style={styles.loadingCaption}>{t(error)}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [styles.loadingRetryButton, pressed && styles.onboardingPressed]}
            >
              <Text style={styles.loadingRetryLabel}>{t("Try again")}</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.loadingCaption}>{t("Restoring your private session…")}</Text>
        </>
      )}
    </View>
  );
}
