# Aponar Nihon — Native Android Play Store Release Checklist

## Prepared in the repository
- Real Expo/React Native Android + iOS source under `mobile/`
- Android package ID: `com.aponarnihon.app`
- iOS bundle ID: `com.aponarnihon.app`
- Existing legacy TWA project remains under `android/` only as historical/previous Android implementation; it is **not** the target native app source.
- Native Android project generation is validated by the `Native Mobile Quality` workflow.
- Native app privacy policy: `app-privacy-policy.html`
- Account deletion page/backend
- Updated Google Play listing copy
- Updated Data Safety draft
- Native app icon asset available under `play-store/assets/`

## Owner/Play Console steps required before production release
1. Verify Google Play Console developer-account access and the existing/new app record for package ID `com.aponarnihon.app`.
2. Confirm whether the package has already been published. If it has, the native replacement must be signed with an upload key accepted by the same Play app; a different package/app identity cannot replace it.
3. Link the Expo/EAS project to the owner's Expo account, or generate/sign the Android App Bundle through another controlled native build pipeline.
4. Configure the production Android signing/upload key securely. Never commit the keystore or passwords to the repository.
5. Produce a release `.aab` from `mobile/` and upload it first to Internal/Closed testing.
6. Test login/register/email verification/password reset, AI Tutor, Daily News, Halal Scanner camera/barcode flow, CV photo/PDF share, notifications and all major learning sections on a real Android device.
7. Fill Play Console App content: native app privacy URL, Data Safety, Ads declaration, Target audience, Content rating and App access.
8. Replace old wrapper screenshots with screenshots from the actual native app UI when they differ.
9. Review app icon, feature graphic, short/full descriptions and support URLs.
10. If the developer account is subject to Google testing requirements, complete the currently required testing period/tester conditions before applying for Production access.

## Native auth configuration
Before release, Supabase Auth must allow:
- `aponarnihon://auth/callback`
- `aponarnihon://auth/reset`

Confirmation/recovery emails must return to the supplied mobile redirect destination.

## Versioning
- Expo config: `mobile/app.json`
- Android `versionCode` starts at `1` and must increase for every Play release.
- User-facing `version` can follow semantic versions such as `1.0.1`.
- `mobile/eas.json` production profile uses automatic build-number/version-code incrementing when EAS is configured.

## Important legacy note
Digital Asset Links (`assetlinks.json`) were required by the old TWA wrapper for trusted full-screen web launch. The real React Native app does not depend on TWA Digital Asset Links for its core native UI. Keep any existing assetlinks configuration only if the old published wrapper or website app-link behavior still needs it during migration.
