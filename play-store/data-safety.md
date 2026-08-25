# Google Play Data Safety — Aponar Nihon

This document is a completion guide for Play Console. Re-check it before submission if the backend changes.

## Data collected by the current account system

### Personal info
- **Name** — optional/required during account/profile setup depending on sign-up path; used for profile and personalization.
- **Email address** — collected for authentication, account access and password recovery.
- **Phone number** — optional profile field; not required to use core learning content.
- **Other profile information** — optional school/institution, nationality, city, JLPT target, preferred language, study goal and bio.

### App activity
- Page/section visits and learning interactions for signed-in users.
- Learning progress and scores where a feature saves progress.
- Timestamps such as last activity.

### User-generated content / local-only tools
- CV Builder form content and Student Toolkit time-manager data are designed to remain in browser local storage and are not intentionally uploaded as their detailed personal content by the learning activity logger.
- A page-use event may still indicate that a signed-in learner opened or interacted with the tool.

## Purpose
- App functionality
- Account management
- Analytics limited to learning/product usage
- Personalization of student learning experience
- Security and support

## Sharing
Aponar Nihon does not sell user data. Supabase acts as a service provider for authentication/database processing.

## Security practices
- HTTPS in transit
- Supabase authentication
- Database Row Level Security for student-owned records
- Admin access separated from normal student accounts

## Account deletion
- In-app/external URL: `https://app.aponar-nihon.workers.dev/delete-account.html`
- Privacy policy: `https://app.aponar-nihon.workers.dev/privacy-policy.html`
- Deletion removes the Auth user and app-owned profile/activity/progress records through the authenticated Supabase Edge Function.

## Play Console answers to review
1. Does the app collect or share required user data? **Yes — collect.**
2. Is all user data encrypted in transit? **Yes (HTTPS).**
3. Can users request deletion? **Yes.**
4. Account deletion URL: `https://app.aponar-nihon.workers.dev/delete-account.html`

Do not mark advertising, financial, health, precise location, contacts, SMS/call logs or files/media as collected unless a future feature actually adds them.
