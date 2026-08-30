---
name: Expo web preview on Replit
description: Replit preview requirements for Expo projects that include native-only modules
---

Expo browser previews need the web peer dependencies for any native package that exposes a web entry point, and Expo's CLI accepts `--host lan` rather than `0.0.0.0`. Native-only APIs should be guarded on web.

**Why:** An imported Expo app can pass native TypeScript checks while Metro still fails in the browser from an omitted web peer or a native-only runtime API.

**How to apply:** When enabling Expo web in Replit, verify peer dependencies, use port 5000 with `--host lan`, and capture the preview plus browser logs before declaring setup complete.