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

The Liquid Glass tab navigation uses scoped semantic tokens in `src/components/theme/navigation.ts`
for the explicitly requested palette: moss `#607B3F`, ivory `#F7F4EE`, ink `#171812`
and lime `#D5EE91`. These do not replace the established screen/content palette.

The approved hospitality Home redesign uses `src/components/theme/hospitality.ts`
for the same moss/ivory/ink/lime palette plus secondary text `#73756F`. Home content
uses solid cards and a bundled decorative image with an ivory wash. The shared
primary button has an opt-in hospitality tone; other screens keep their defaults.
