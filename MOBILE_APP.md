# Aponar Nihon — Android & iOS Native App Plan

## Non-negotiable product rule

The mobile app is the full Aponar Nihon service, not a lite edition and not a WebView/TWA wrapper. Website feature/content parity is a release requirement.

## Architecture

- **UI:** React Native on Expo SDK 57; native Android/iOS components.
- **Navigation:** React Navigation native stack + bottom tabs.
- **Identity:** Android `com.aponarnihon.app`; iOS `com.aponarnihon.app`.
- **Auth/Data:** the same Supabase project as the website. Only a publishable client key is permitted in the app.
- **Secure session:** Expo SecureStore.
- **Backend:** existing Cloudflare Worker `/api/*`; AI Tutor uses `/api/tutor`.
- **Content parity:** `tools/build_mobile_content.py` converts the verified static HTML output to native JSON blocks after every website build. The app's **সব সেকশন** screen reads the generated index.
- **No WebView:** learning/guide HTML is converted to data and rendered with native React Native components.

## Dedicated native screens already scaffolded

- Home / education-first dashboard
- N5/N4/N3 and all learning sections
- AI Tutor: learn, correct, conversation, interview, quiz, translate; N5/N4/N3; quick/standard/deep
- Halal Scanner: device camera barcode scan, Open Food Facts lookup, manual ingredient analysis, scan history, explicit certificate verification status
- Japan Daily News: Furigana toggle, Japanese text, Bangla explanation, vocabulary, image field support and source link
- CV Builder: photo picker, Japanese 履歴書 form, PDF generation, native share sheet
- Profile: Supabase login/register/session/progress count
- Local daily study reminder
- Explore / career / Japan-life resources
- সব সেকশন: automatic website content index

## Halal certificate integrity rule

`assets/data/halal-certificates.json` starts empty by design. A product may be labelled **Verified Halal Certificate** only when a record contains an independently verifiable official/certifier source. Ingredient screening is never displayed as a certificate.

## Daily News image rule

The native reader supports `image_url` and `image_alt_bn`. News publishing should only populate images that Aponar Nihon is allowed to display (owned, licensed, public-domain/compatible, or otherwise permissioned). A source article's image must not be copied merely because its article URL is public.

## Release gate

Before replacing the existing Android wrapper or submitting iOS:

1. Native Mobile Quality workflow is green.
2. Supabase redirect allow-list includes `aponarnihon://auth/callback`.
3. Expo/EAS project is linked to the owner's Expo account.
4. Android signing key/store ownership for `com.aponarnihon.app` is confirmed.
5. Apple Developer/App Store Connect account and bundle ID ownership are configured.
6. Privacy policy declares camera, photo picker, notifications, account data, AI Tutor requests and third-party product lookup.
7. Real-device tests pass on at least one supported Android phone and one supported iPhone.
8. Store screenshots, app descriptions, age/content ratings, privacy disclosures and support URL are reviewed.
9. Feature-parity checklist confirms no current user-facing website section is missing.
