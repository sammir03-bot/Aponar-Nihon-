# Aponar Nihon — Android & iOS Native App

## Non-negotiable product rule

The mobile app is the full Aponar Nihon service, not a lite edition and not a WebView/TWA wrapper. Website feature/content parity is a release requirement.

## Architecture

- **UI:** React Native on Expo SDK 57; native Android/iOS components.
- **Navigation:** React Navigation native stack + bottom tabs.
- **Identity:** Android `com.aponarnihon.app`; iOS `com.aponarnihon.app`.
- **Auth/Data:** the same Supabase project as the website. Only the production publishable client key is permitted in the app.
- **Secure session:** Expo SecureStore with persistent Supabase session and PKCE support.
- **Auth deep links:** `aponarnihon://auth/callback` and `aponarnihon://auth/reset`.
- **Backend:** existing Cloudflare Worker `/api/*`; AI Tutor uses `/api/tutor`.
- **Content parity:** `tools/build_mobile_content.py` converts the verified static HTML output to native JSON blocks after every website build. The root `npm run build` generates `_site/assets/data/mobile-content`, which Cloudflare deploys with the website.
- **No WebView:** learning/guide HTML is converted to data and rendered with native React Native components.

## Dedicated native screens

- Home / education-first dashboard
- N5/N4/N3 and all learning sections
- AI Tutor: learn, correct, conversation, interview, quiz, translate; N5/N4/N3; quick/standard/deep
- Halal Scanner: device camera barcode scan, product-data lookup, manual ingredient analysis, scan history, explicit certificate verification status
- Japan Daily News: Furigana toggle, Japanese text, Bangla explanation, vocabulary, image-field support and source link
- CV Builder: photo picker, Japanese 履歴書 form, PDF generation, native share sheet
- Profile: Supabase login/register/email verification/password recovery/session/progress count
- Local daily study reminder
- Explore / career / Japan-life resources
- সব সেকশন: automatic website content index

## Halal certificate integrity rule

`assets/data/halal-certificates.json` starts empty by design. A product may be labelled **Verified Halal Certificate** only when a record contains an independently verifiable official/certifier source. Ingredient screening is never displayed as a certificate.

## Daily News image rule

The native reader supports `image_url` and `image_alt_bn`. News publishing should only populate images that Aponar Nihon is allowed to display (owned, licensed, public-domain/compatible, or otherwise permissioned). A source article's image must not be copied merely because its article URL is public.

## Automated release gate — current status

The `Native Mobile Quality` workflow validates:

- Website → native content parity extraction ✅
- TypeScript strict check ✅
- Expo Doctor ✅
- Android native project prebuild ✅
- iOS native project prebuild ✅

Latest validated branch: `native-mobile-app-v1`.

## Production configuration still required before store submission

1. In Supabase Auth → URL Configuration, allow the exact production app redirects:
   - `aponarnihon://auth/callback`
   - `aponarnihon://auth/reset`
2. Confirm Supabase confirmation/recovery email templates respect the supplied redirect destination (`RedirectTo`) so mobile verification returns to the app.
3. Link `mobile/` to the owner's Expo/EAS account/project before cloud store builds.
4. Confirm Android signing/store ownership for `com.aponarnihon.app` before replacing the existing Android wrapper.
5. Configure Apple Developer/App Store Connect ownership for bundle ID `com.aponarnihon.app`.
6. Run real-device acceptance tests on at least one supported Android phone and one supported iPhone.

These steps require the owner's Supabase dashboard auth configuration and/or external store/developer credentials; they are not application source-code secrets and must not be hard-coded into the repository.

## Store/privacy material

- Public policy: `privacy-policy.html` includes native permissions, AI Tutor, product lookup and mobile data handling.
- Google Play disclosure guide: `play-store/data-safety.md`.
- App Store privacy guide: `app-store/privacy-details.md`.
- App Store listing draft: `app-store/store-listing.md`.
- Existing Play assets/listing/release files remain under `play-store/`.

## Final store submission gate

Before public release:

1. Automated native quality checks remain green.
2. Mobile auth redirects are confirmed on a real device.
3. Android/iOS signing credentials are controlled by the owner.
4. Privacy/data-safety forms match the actual production network behavior.
5. Store screenshots and descriptions use the native app UI, not old wrapper screenshots if the UI differs.
6. Account deletion flow is tested from a signed-in production account.
7. Camera, photo picker, notification, AI Tutor, Daily News, CV PDF and Halal Scanner flows are tested on real devices.
8. Feature-parity checklist confirms no current user-facing website section is missing.
