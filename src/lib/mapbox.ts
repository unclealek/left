import Mapbox from "@rnmapbox/maps";

export const MAPBOX_PUBLIC_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ??
  process.env["Map_Box_Token"] ??
  "";
export const MAPBOX_ENABLED = MAPBOX_PUBLIC_TOKEN.trim().length > 0;

if (MAPBOX_ENABLED) {
  Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);
}
