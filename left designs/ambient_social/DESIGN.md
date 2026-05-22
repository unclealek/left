---
name: Ambient Social
colors:
  surface: '#12121c'
  surface-dim: '#12121c'
  surface-bright: '#383843'
  surface-container-lowest: '#0d0d17'
  surface-container-low: '#1b1b25'
  surface-container: '#1f1f29'
  surface-container-high: '#292933'
  surface-container-highest: '#34343f'
  on-surface: '#e3e1ef'
  on-surface-variant: '#c8c4d6'
  inverse-surface: '#e3e1ef'
  inverse-on-surface: '#302f3a'
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
  background: '#12121c'
  on-background: '#e3e1ef'
  surface-variant: '#34343f'
typography:
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
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
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 20px
  container-padding: 24px
  stack-gap: 12px
---

## Brand & Style
This design system is built on the philosophy of **Ambient Reality**. It rejects the loud, attention-grabbing patterns of traditional social media in favor of a "reality-first" approach. The interface acts as a soft layer over the physical world, prioritizing anonymity and contextual presence over identity-heavy profiles.

The visual style is **Atmospheric Minimalism** with elements of **Glassmorphism**. By using a "Void" and "Deep" palette, the UI creates a sense of infinite space where human connections appear as glowing orbs of energy. The emotional response should be one of calm curiosity—a digital extension of a dimly lit, safe social space. Visual noise is aggressively reduced to ensure that the "connection moments" feel significant and luminous.

## Colors
The palette is strictly dark-mode, designed to recede into the background of the user's environment. 

- **The Void & The Deep:** The primary canvas uses `#0D0D12` for the lowest base layer (the "void") and `#13131A` for scrolling containers.
- **Iris (Primary):** Used for intent and action. It represents the "soul" of the interface.
- **Aurora (Secondary):** Indicates active presence and success. It feels organic and alive.
- **Blush (Connection):** Reserved exclusively for mutual interest and "waves"—moments of human warmth.
- **Amber (Energy):** A functional accent for temporal elements like expiring sessions or urgent activity.

**Bubble System Logic:**
Connections are visualized through a gradient system. Proximity is represented by scale, while density/intensity of activity is mapped from `bubble_low` (distant/quiet) to `bubble_high` (immediate/vibrant).

## Typography
Typography in this design system is functional and clean, ensuring that information remains legible against glowing background elements.

- **DM Sans (Headings & Body):** Chosen for its geometric clarity and modern warmth. Headings use a tight letter-spacing to feel impactful yet soft. 
- **JetBrains Mono (Tags/Metadata):** Used for technical data, proximity distances, and timestamps. This reinforces the "contextual discovery" aspect, treating environmental data with a systematic, distinct aesthetic.
- **Hierarchy:** Use `label-caps` for section headers and `label-mono` for all metadata. `body-lg` is preferred for anonymous "thought" bubbles to ensure high readability.

## Layout & Spacing
The layout follows a **Fluid Content Model** optimized for the iPhone 14 (390px width). Instead of a rigid grid, the design system utilizes "safe zones" and centered gravity.

- **Margins:** A standard 20px horizontal margin ensures content does not bleed into the screen edges.
- **The Core Stack:** Elements are vertically stacked with a 12px gap to maintain a sense of breathability.
- **Tap Targets:** All interactive elements maintain a minimum 44x44px hit area, even if visually smaller, to support "on-the-go" usage.
- **Safety Anchor:** The Safety Control button is always anchored to the bottom right (24px from edges) for instant accessibility.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Luminescence** rather than traditional shadows.

1.  **Level 0 (Void):** The canvas. Pure depth.
2.  **Level 1 (Deep):** Base interactive surfaces.
3.  **Level 2 (Surface):** Hover/Active states, using `#1C1C26`.
4.  **Level 3 (Glow):** The highest elevation level. Interactive "Bubbles" use a backdrop blur (20px) and an inner Iris glow to appear as if they are floating above the void.

Borders are used sparingly at 1px thickness (`#2A2A38`) to define boundaries without adding visual weight.

## Shapes
The shape language is organic and soft, avoiding sharp corners to maintain the "ambient" feel.

- **Standard Elements:** Use a 0.5rem (8px) radius for input fields and small cards.
- **Discovery Orbs:** Connection bubbles are always perfectly circular.
- **Action Buttons:** Use a 1rem (16px) radius to create a distinct, approachable look that sits between a rectangle and a pill.
- **Glass Sheets:** Large expanded views (Tap to Expand) use a 1.5rem (24px) top-corner radius when sliding from the bottom.

## Components

- **Iris Orbs (Bubbles):** The primary discovery element. They utilize a radial gradient from Iris to Deep. The size of the orb is dynamically tied to proximity. On tap, they expand using a spring animation to show "Soft Anonymity" profiles.
- **Ambient Buttons:** CTAs are filled with the Iris gradient. Secondary actions are ghost buttons with a `#2A2A38` border and Iris text.
- **Safety Trigger:** A persistent floating action button (FAB) in the bottom right, styled with a subtle Blush glow to ensure it is visible but not distracting. One tap triggers immediate safety controls.
- **Contextual Chips:** Small tags using JetBrains Mono, styled with a `#1C1C26` background and Muted text. Used for shared interests or current vibe.
- **Expansion Cards:** When a bubble is tapped, it morphs into a centered card. These cards use a heavy backdrop blur (Glassmorphism) to keep the user grounded in their current environment.
- **Activity Warning:** Amber-tinted progress bars at the top of expanded views to indicate how much "energy" (time) is left in the current session.