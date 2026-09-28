# Full website → App parity

The website is the source of truth for user-facing content and interactive sections.

## Rules

- Website-backed features open inside the native App shell with JavaScript, DOM storage, cookies, media, forms, links and the site's own CSS/JS intact.
- Native features stay native where the phone adds value: camera barcode scanning, native CV/PDF flows, notifications and account integrations.
- `tools/check_mobile_routes.py` fails CI when a registered `webPath` no longer exists in the website source.
- `tools/build_mobile_content.py` publishes the complete user-facing HTML route index, including interactive/redirect pages that may have no extractable text blocks.
- `AllSectionsScreen` opens every indexed website route by path instead of trying to reconstruct interactive pages from extracted text.

This means a normal website content/feature update can be deployed from the same repository and immediately be available inside website-backed App sections without duplicating that feature implementation in React Native.
