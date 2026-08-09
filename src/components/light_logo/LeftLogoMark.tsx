import { Image } from "react-native";

const MARK_BLACK = require("../../../assets/brand/left-mark-black.png");
const MARK_WHITE = require("../../../assets/brand/left-mark-white.png");

export function LeftLogoMark({
  size = 24,
  tone = "dark",
}: {
  size?: number;
  tone?: "dark" | "light";
}) {
  return (
    <Image
      source={tone === "light" ? MARK_WHITE : MARK_BLACK}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
