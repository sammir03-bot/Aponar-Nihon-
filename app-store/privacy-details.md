# App Store Privacy Details — Aponar Nihon

Use this as a conservative App Store Connect privacy questionnaire guide. Re-check every answer against the production app and Apple's current definitions immediately before submission.

## Data linked to the user's identity

### Contact information
- Email address — account creation, verification, login and password recovery.
- Name and optional phone/profile details — only when the user supplies them to the profile.

### User content
- AI Tutor prompts/conversation text — sent when the user intentionally uses AI Tutor so the requested educational response can be generated.
- Profile fields supplied by the user.

### Usage data
- Learning-section activity, progress and related timestamps where the signed-in learning system records them.

## Data not intentionally collected as files/media by the native client

- Halal Scanner camera frames are used for barcode detection and are not intentionally uploaded as camera images by Aponar Nihon.
- A CV photo selected by the user is used for CV/PDF generation; the app does not intentionally upload the generated CV merely because it was created.
- Local scheduled study-reminder content is used for app functionality.

## External processing to disclose/review

- Supabase — authentication/database.
- Cloudflare — application hosting/API transport.
- Configured AI provider — AI Tutor response generation.
- Open Food Facts or configured product-data provider — barcode/product lookup.

A scanned barcode/product query may leave the device for the requested lookup. Do not describe it as on-device-only if the production lookup endpoint is enabled.

## Tracking

Aponar Nihon does not intentionally use collected data for cross-company advertising tracking. Do not enable App Tracking Transparency/IDFA-related declarations unless a future SDK or feature introduces tracking.

## Purposes

- App Functionality
- Account Management
- Personalization of learning features
- Product/learning analytics limited to operation and improvement
- Security and support

## Store URLs

- Native App Privacy Policy: `https://app.aponar-nihon.workers.dev/app-privacy-policy.html`
- Account deletion: `https://app.aponar-nihon.workers.dev/delete-account.html`

## Submission audit

Before answering App Store Connect, inspect the final dependency list and production network behavior. If analytics, crash reporting, ads, attribution, social login, location, contacts, microphone, cloud CV sync, or another SDK is added later, update both this file and the public app privacy policy before release.
