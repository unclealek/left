import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const config = vi.hoisted(() => ({ ready: true }));
vi.mock("react-native", () => ({ Pressable: "Pressable", Text: "Text", View: "View", TextInput: "TextInput", Platform: { OS: "ios" } }));
vi.mock("expo-linear-gradient", () => ({ LinearGradient: "Gradient" }));
vi.mock("../../app/leftConfig", () => ({ avatarStyles: [], interestOptions: [] }));
vi.mock("../../app/leftTheme", () => ({ T: {}, styles: {} }));
vi.mock("../../components/left/ui", () => ({ PrimaryButton: "Button", SelectChip: "Chip" }));
vi.mock("../../components/icons", () => ({ LeftIcon: "Icon" }));
vi.mock("../../components/left/LeftLogoMark", () => ({ LeftLogoMark: "Logo" }));
vi.mock("../../components/left/OnboardingAmbientScribbles", () => ({ OnboardingAmbientScribbles: "Scribbles" }));
vi.mock("../../components/glass", () => ({ GlassSurface: "Glass", glassRadii: {} }));
vi.mock("../../features/legal/legal-config", () => ({
  get legalContentReady() { return config.ready; },
  LEGAL_DOCUMENTS: { terms: { title: "Terms of Service" }, privacy: { title: "Privacy Policy" }, community: { title: "Community Guidelines" } },
}));
import { LegalAcknowledgementScreen } from "./OnboardingScreens";

type Node = React.ReactElement<Record<string, any>>;
function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  const node = value as Node;
  return [node, ...nodes(node.props.children), ...nodes(node.props.footer)];
}
function screen(agreed = false) {
  const onOpenDocument = vi.fn();
  const onContinue = vi.fn();
  const tree = LegalAcknowledgementScreen({ agreed, onOpenDocument, onContinue, onToggle: vi.fn(), onBack: vi.fn() });
  return { elements: nodes(tree), onOpenDocument, onContinue };
}
describe("compact legal acceptance UI", () => {
  beforeEach(() => { vi.stubGlobal("React", React); config.ready = true; });
  it("shows one unchecked checkbox and disables Continue", () => {
    const { elements } = screen();
    const checks = elements.filter(n => n.props.accessibilityRole === "checkbox");
    expect(checks).toHaveLength(1);
    expect(checks[0].props.accessibilityState.checked).toBe(false);
    expect(elements.find(n => n.props.label === "Agree & Continue")?.props.disabled).toBe(true);
  });
  it("allows continuing only after agreement to published documents", () => {
    expect(screen(true).elements.find(n => n.props.label === "Agree & Continue")?.props.disabled).toBe(false);
    config.ready = false;
    expect(screen(true).elements.find(n => n.props.label === "Agree & Continue")?.props.disabled).toBe(true);
  });
  it("exposes all three document links before agreement without continuing", () => {
    const { elements, onOpenDocument, onContinue } = screen();
    const links = elements.filter(n => n.props.accessibilityRole === "link");
    expect(links).toHaveLength(3);
    links.forEach(n => n.props.onPress());
    expect(onOpenDocument.mock.calls).toEqual([["terms"], ["privacy"], ["community"]]);
    expect(onContinue).not.toHaveBeenCalled();
  });
});
