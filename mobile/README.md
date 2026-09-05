# Aponar Nihon — Native Mobile App

This directory is the real Android + iOS client for Aponar Nihon. It is **not a WebView/TWA/PWA wrapper**.

## Product rule

**Website feature parity is mandatory.** Existing website content is exposed to the mobile app through a build-time native-content JSON index, while highly interactive features use dedicated React Native screens.

Dedicated native experiences:
- AI Tutor (`/api/tutor`)
- Halal Scanner (native camera + barcode scan)
- Japan Daily News
- CV Builder + PDF export
- Supabase Auth/Profile/Progress

Generic native content renderer:
- Every user-facing HTML page is converted during the website build into JSON blocks under `assets/data/mobile-content/`.
- The app renders those blocks with React Native `Text`, `Image`, `Pressable`, `ScrollView`, etc. No WebView is required.

## Local setup

```bash
cd mobile
cp .env.example .env
npm install
npm run typecheck
npx expo prebuild
npm run android
# macOS + Xcode is required for local iOS builds
npm run ios
```

Set `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the same browser-safe publishable key used by the website. Never put a service role or secret key in the app.

## Store identity

- Android package: `com.aponarnihon.app`
- iOS bundle identifier: `com.aponarnihon.app`
- Deep-link scheme: `aponarnihon://`

The Android package intentionally matches the existing Android shell so the native app can replace that wrapper under the same app identity when signing/store ownership is confirmed.
