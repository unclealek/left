# Metro image-size compatibility

Expo 54's Metro uses both synchronous `imageSize(bytes)` and `imageSize(filePath)`. Upstream image-size 2.0.3 fixes the malformed-image parser advisories but removed the synchronous path overload.

This build-only adapter reads path inputs into bytes and delegates all parsing to pinned upstream 2.0.3. It contains no copied image-parser implementation and is not shipped in the mobile runtime. Root npm overrides route the old package name here; the upstream parser uses the distinct `image-size-modern` alias.

Only the synchronous buffer/path interfaces used by the installed Metro are supported. No legacy callback API is implemented. Remove the adapter when a supported Expo/Metro upgrade uses the upstream v2 API directly.

Validated using a clean `npm ci`, dependency-tree inspection, API tests, and both web and iOS bundle exports. The remaining braces/node-forge advisories are unrelated to this adapter.
