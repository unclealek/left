---
name: Supabase OAuth on Expo web
description: Why the Replit-hosted Expo web app uses a different Supabase OAuth flow from native builds.
---

Use Supabase's same-tab OAuth redirect on top-level web pages and let the web client detect the returned session URL. In Replit's embedded Preview, open OAuth in a real browser tab. Keep the browser auth-session flow for native builds.

**Why:** Expo's popup auth session can return `dismiss`, while Google's sign-in page cannot render inside Replit's Preview iframe. The provider URL itself can still be valid.

**How to apply:** Preserve the platform and iframe split. Open a blank tab synchronously from the button press before awaiting the OAuth URL so popup blockers do not reject it. Verify the callback path is served and allowlisted.