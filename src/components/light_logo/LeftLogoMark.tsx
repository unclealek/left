import { Image } from "react-native";

const MARK_SQUARE = require("../../../assets/brand/left-app-icon-foreground.png");

export function LeftLogoMark({
  size = 24,
  tone = "dark",
}: {
  size?: number;
  tone?: "dark" | "light";
}) {
  return (
    <Image
      source={MARK_SQUARE}
      resizeMode="contain"
      tintColor={tone === "light" ? "#FFFFFF" : "#161616"}
      style={{
        width: size * 2.25,
        height: size * 2.25,
      }}
    />
  );
}
