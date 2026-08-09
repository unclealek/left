export const leftColors = {
  porcelain: "#FBF7F5",
  porcelainSoft: "#F5F1EF",
  porcelainMuted: "#EBE6E2",
  stone: "#D9D3D0",
  taupe: "#B8B2AE",
  warmGray: "#8E8986",
  slate: "#66615F",
  charcoal: "#4B4745",
  espresso: "#2D2A28",
  inkBlack: "#000000",
  white: "#FFFFFF",
  moss: "#6F8F72",
  terracotta: "#C77B5A",
  ochre: "#D4A64A",
  slateBlue: "#5F7896",
} as const;

export const semanticColors = {
  success: "#3C8D63",
  warning: "#D68A28",
  error: "#C94B4B",
  info: "#2F6EB8",
} as const;

export function alpha(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${opacity})`;
}
