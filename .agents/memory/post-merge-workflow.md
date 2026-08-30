---
name: Post-merge workflow setup
description: The project has separate mobile and admin lockfiles and a managed Expo preview workflow.
---

The post-merge setup must install dependencies from both the mobile root and the admin workspace using their lockfiles. Running that installation can temporarily disrupt a live Metro process; the existing Expo workflow should be restarted afterward before validating the preview.

**Why:** Replacing node_modules while Metro is serving can produce transient missing-module and missing-asset errors even when the installation completed successfully.

**How to apply:** Keep the hook non-interactive and idempotent, then restart the existing `Start application` workflow after setup changes or dependency reconciliation.