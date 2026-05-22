---
name: Contextual Discovery System
colors:
  surface: '#13121a'
  surface-dim: '#13121a'
  surface-bright: '#3a3841'
  surface-container-lowest: '#0e0d15'
  surface-container-low: '#1c1b23'
  surface-container: '#201f27'
  surface-container-high: '#2a2932'
  surface-container-highest: '#35343d'
  on-surface: '#e5e1ec'
  on-surface-variant: '#c8c4d6'
  inverse-surface: '#e5e1ec'
  inverse-on-surface: '#312f38'
  outline: '#928fa0'
  outline-variant: '#474554'
  surface-tint: '#c6c0ff'
  primary: '#c6c0ff'
  on-primary: '#2700a1'
  primary-container: '#8b80ff'
  on-primary-container: '#21008e'
  inverse-primary: '#5748d0'
  secondary: '#5cdbbe'
  on-secondary: '#00382e'
  secondary-container: '#05a68c'
  on-secondary-container: '#003329'
  tertiary: '#ffb1c1'
  on-tertiary: '#5f102b'
  tertiary-container: '#d87089'
  on-tertiary-container: '#560824'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6c0ff'
  on-primary-fixed: '#150066'
  on-primary-fixed-variant: '#3f2bb8'
  secondary-fixed: '#7bf8da'
  secondary-fixed-dim: '#5cdbbe'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005143'
  tertiary-fixed: '#ffd9df'
  tertiary-fixed-dim: '#ffb1c1'
  on-tertiary-fixed: '#3f0017'
  on-tertiary-fixed-variant: '#7d2841'
  background: '#13121a'
  on-background: '#e5e1ec'
  surface-variant: '#35343d'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '300'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: DM Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

The design system focuses on **Immersive Social Discovery**. The brand personality is enigmatic yet energetic, designed to feel like a living, breathing ecosystem rather than a static interface. It utilizes a **Glassmorphic-Minimalist** hybrid style, where deep, dark canvas layers provide a void-like backdrop for vibrant, pulsing organic elements.

The target audience consists of urban explorers and digital natives who value serendipity and context. The UI should evoke a sense of "digital bioluminescence"—where connections and discoveries glow and drift within a structured, high-fidelity dark environment.

## Colors

This design system is strictly **Dark Mode Only**. The palette is constructed through "Luminous Depth," using ultra-dark neutrals to allow the high-saturation accent colors to pop.

- **Primary (Iris):** Used for primary actions, active states, and core branding.
- **Secondary (Aurora):** Denotes success, growth, and positive discovery.
- **Tertiary (Blush):** Specifically reserved for social "connections" and interpersonal interactions.
- **Quaternary (Amber):** Represents "Energy"—active live states, trending topics, or urgent notifications.

The hierarchy of surfaces is defined by hex values to ensure perfect contrast: inputs sit slightly higher than cards, which sit higher than the body background.

## Typography

The typography system relies exclusively on **DM Sans** to maintain a clean, modern, and slightly geometric aesthetic that remains legible against dark backgrounds. 

- **Display & Headlines:** Use heavier weights (500-600) with tighter letter spacing for a punchy, editorial feel. 
- **Body Text:** Primarily utilizes the Light (300) and Regular (400) weights to prevent "glow-bleed" on high-contrast OLED screens.
- **Labels:** Always use Medium (500) or SemiBold (600) weights with increased letter spacing and uppercase styling to ensure functional elements are distinguishable from narrative content.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. While the core application is designed for a mobile-first "Phone Body" (#0d0d14), the content within utilizes a flexible 4-column (mobile) or 12-column (tablet/desktop) grid.

- **The Drift Zone:** Discovery screens utilize a "No Grid" approach for floating bubble elements, allowing them to drift randomly within safe-area margins.
- **Structured Spacing:** All functional UI components (buttons, cards, inputs) follow a strict 8px rhythm.
- **Margins:** Standard mobile screens use a 20px side margin to create breathing room between the edge of the device and the content sheets.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Luminous Blurs**. Shadows are rarely used; instead, depth is communicated by the brightness of the surface.

- **Level 0 (Floor):** `#0a0a10` - The outer wrap background.
- **Level 1 (Base):** `#0d0d14` - The main application canvas.
- **Level 2 (Raised):** `#13131c` - Cards and floating sheets. These use a 1px border of `#1e1e2e` to define edges.
- **Level 3 (Overlay):** Bottom sheets and tooltips. These use a backdrop blur (20px) to partially reveal the drifting content beneath them.
- **Accent Elevation:** Discovery bubbles use a soft outer glow (15-30px blur) matching their respective accent color to simulate light emission.

## Shapes

The shape language is a contrast between **Geometric Containers** and **Organic Content**.

- **Containers:** Primary cards and structural elements use a "Rounded" (0.5rem / 8px) or "Large" (1rem / 16px) radius.
- **Primary Interaction:** Buttons have a specific 12px radius, creating a signature "squircle" look that feels friendly yet precise.
- **Pill Shapes:** Reserved for tags, chips, and segmented control indicators.
- **Circular Bubbles:** Used exclusively for discovery avatars and "interest" nodes. These elements must always be 1:1 aspect ratio with 100% border radius.

## Components

### Buttons
- **Primary:** Iris (#7b6ef6) background with white text. 12px border radius.
- **Secondary:** Ghost border (#3d3780) with muted text. 12px border radius.
- **Discovery Pulse:** Circular buttons that exhibit a slow scale animation (1.0 to 1.05) to indicate interactability.

### Discovery Bubbles
Circular nodes containing imagery or icons. They utilize a "Drift" animation (subtle X/Y translation) and a "Pulse" animation (box-shadow expansion) when active or trending.

### Tags & Chips
Always pill-shaped. Backgrounds use a 10% opacity version of the accent color with a matching 100% opacity text color for a "tinted glass" effect.

### Segmented Controls
Housed in a `#161622` (Surface Input) container. The active segment is a pill-shaped "Iris" or "Aurora" mover that slides horizontally with a spring transition.

### Bottom Sheets
Slide up from the bottom of the viewport. They feature a top-center "handle" (40x4px, `#2a2a38`) and use a heavy backdrop blur to maintain context with the discovery layer underneath.

### Input Fields
Filled style using `#161622`. Borders are invisible until focus, at which point they transition to a 1px Iris (#7b6ef6) stroke.