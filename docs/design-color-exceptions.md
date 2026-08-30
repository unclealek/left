# Design color exceptions

Left's functional colors come from the shared semantic theme in `src/components/theme`.
Status, text, surface, border, navigation, toast, and glass colors should use those
tokens rather than introducing screen-specific literals.

The following colors are intentionally exempt:

- Google's four logo colors in the Google sign-in mark are third-party brand assets
  and must not be remapped to Left's semantic palette.
- The three pre-auth illustration accents are editorial art direction. They may vary
  by slide, but they must not be reused for status, action, or meaning-bearing UI.
- Venue and avatar illustration artwork may contain local decorative colors. Any text,
  controls, state indicators, or accessibility-relevant contrast layered over that art
  must still use semantic theme tokens.