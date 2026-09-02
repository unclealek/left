export const leftColors = {
    porcelain: "#F4F2EE",
    porcelainSoft: "#EEECE6",
    porcelainMuted: "#E5E2DA",
    stone: "#D4D0C6",
    taupe: "#B8B4AA",
    warmGray: "#817B72",
    slate: "#5C5852",
    charcoal: "#3A3732",
    espresso: "#1A1815",
    inkBlack: "#1A1815",
    actionBrown: "#5F733F",
    white: "#FFFFFF",
    moss: "#5F733F",
    mossSoft: "#E8EEDF",
    terracotta: "#D97852",
    ochre: "#D6A331",
    slateBlue: "#75867B",
    creoleBrown: "#1A1815",
    yellowGreen: "#DCE6C9",
    } as const;

    export const semanticColors = {
    success: "#5F733F",
    warning: "#D89625",
    error: "#C95B4B",
    info: "#607C70",
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
