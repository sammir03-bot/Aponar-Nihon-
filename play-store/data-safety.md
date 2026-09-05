# Google Play Data Safety — Aponar Nihon

This document is a conservative completion guide for Play Console. Re-check it against the production backend and Google Play's current definitions immediately before submission.

## Data collected by the account and learning system

### Personal info
- **Name** — optional/required during account/profile setup depending on sign-up path; used for profile and personalization.
- **Email address** — collected for authentication, verification, account access and password recovery.
- **Phone number** — optional profile field; not required to use core learning content.
- **Other profile information** — optional school/institution, nationality, city, JLPT target, preferred language, study goal and bio.

### App activity
- Page/section visits and learning interactions for signed-in users.
- Learning progress and scores where a feature saves progress.
- Timestamps such as last activity.

### User-generated content / AI Tutor
- Text the user intentionally sends to AI Tutor is transmitted off-device to Aponar Nihon's API and configured AI service provider to generate the requested response.
- Treat AI Tutor prompt/conversation text conservatively as collected user-generated content for app functionality unless the final Play Console definition/provider setup clearly qualifies for a narrower declaration.
- Users should not put unnecessary sensitive identifiers or credentials into AI Tutor prompts.

### Halal Scanner / product lookup
- Camera permission is used to detect a product barcode. Camera frames/images are not intentionally uploaded by Aponar Nihon for barcode scanning.
- A scanned barcode/product lookup request may be transmitted to Open Food Facts or another configured product-data provider to retrieve product information.
- Scan/product lookup data is used for the requested scanner functionality and is not used for advertising profiling.

### Local-only device features
- A CV photo selected from the photo library is used for CV/PDF generation. The native app does not intentionally upload the resulting CV PDF merely because it was generated; the user chooses whether to share it through the OS share sheet.
- Local study notification scheduling uses notification permission. The notification permission itself does not mean notification content is uploaded to Aponar Nihon.
- Student Toolkit/local form data should be treated as device-local unless a future sync/save feature explicitly transmits it.

## Purposes
- App functionality
- Account management and authentication
- Learning progress and product-usage analytics
- Personalization of the learning experience
- Security and support
- AI-generated educational responses requested by the user
- Product/barcode lookup requested by the user

## Service providers / sharing review
Aponar Nihon does not sell user data. Production processing may involve Supabase (authentication/database), Cloudflare (hosting/API), the configured AI provider (AI Tutor), and Open Food Facts or a configured product-data source (barcode lookup). Determine the final Play Console **collected vs shared** answers using Google's current service-provider exceptions and the actual production contracts/configuration; do not mark a category as "not collected" merely because processing is brief.

## Security practices
- HTTPS in transit for network requests
- Supabase authentication
- SecureStore for native session persistence
- Database Row Level Security for student-owned records
- Only a Supabase publishable client key in the app; no service-role/secret key in the client
- Admin access separated from normal student accounts

## Account deletion
- External deletion URL: `https://app.aponar-nihon.workers.dev/delete-account.html`
- Native app privacy policy: `https://app.aponar-nihon.workers.dev/app-privacy-policy.html`
- Deletion flow should remove the Auth user and app-owned profile/activity/progress records through the authenticated backend flow, subject to any legally required retention.

## Play Console answers to verify at submission
1. Does the app collect user data? **Yes.**
2. Is all network-transmitted user data encrypted in transit? **Yes, production endpoints must remain HTTPS.**
3. Can users request account/data deletion? **Yes.**
4. Account deletion URL: `https://app.aponar-nihon.workers.dev/delete-account.html`
5. Camera: used for barcode scanning; camera images are not intentionally collected by the scanner.
6. Photos/media: selected CV photo is local-use unless a future upload/sync feature is enabled.
7. AI Tutor: disclose user-provided prompt/conversation processing for app functionality.
8. Product lookup: disclose barcode/product query processing as required by the current Play definition.

Do not declare advertising, financial information, health information, precise location, contacts, SMS/call logs, browsing history, or device files/media as collected unless a production feature actually begins transmitting that category off-device.
