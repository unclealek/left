import { StyleSheet } from "react-native";
import { avatarStyles } from "../components/styles/avatar";
import { T } from "../components/theme";
import { cardStyles } from "../components/styles/cards";
import { dialogStyles } from "../components/styles/dialog";
import { activationStyles } from "../components/styles/features/activation";
import { authStyles } from "../components/styles/features/auth";
import { preAuthStyles } from "../components/styles/features/preAuth";
import { legalStyles } from "../components/styles/features/legal";
import { feedbackStyles } from "../components/styles/features/feedback";
import { discoveryStyles } from "../components/styles/features/discovery";
import { feedStyles } from "../components/styles/features/feed";
import { homeStyles } from "../components/styles/features/home";
import { loadingStyles } from "../components/styles/features/loading";
import { onboardingStyles } from "../components/styles/features/onboarding";
import { profileStyles } from "../components/styles/features/profile";
import { settingsStyles } from "../components/styles/features/settings";
import { formStyles } from "../components/styles/forms";
import { layoutStyles } from "../components/styles/layout";
import { liveStyles } from "../components/styles/live";
import { createNavigationStyles } from "../components/styles/navigation";
import { uiStyles } from "../components/styles/ui";

export { T };

const CONTENT_RAIL_WIDTH = "92%" as const;
const CONTENT_RAIL_MAX = 392;
const navigationStyles = createNavigationStyles(CONTENT_RAIL_WIDTH, CONTENT_RAIL_MAX);

export const styles = StyleSheet.create({
  ...layoutStyles,
  ...dialogStyles,
  ...loadingStyles,
  ...authStyles,
  ...preAuthStyles,
  ...legalStyles,
  ...cardStyles,
  ...onboardingStyles,
  ...formStyles,
  ...liveStyles,
  ...avatarStyles,
  ...feedStyles,
  ...profileStyles,
  ...homeStyles,
  iconButtonPressed: {
    opacity: 0.82,
  },
  ...settingsStyles,
  ...activationStyles,
  ...feedbackStyles,
  ...discoveryStyles,
  ...uiStyles,
  primaryBtnPressed: {
    opacity: 0.85,
  },
  ...navigationStyles,
});
