# Aponar Nihon Architecture

Aponar Nihon is intentionally a fast static-first learning platform. The goal is not to force GitHub language percentages; each language is used where it is strongest while preserving every existing piece of educational content.

## Responsibilities

### HTML — content and semantic structure

HTML remains the source of truth for the existing pages, lessons, guides, headings, examples and educational text. Existing URLs stay compatible so bookmarks and search-engine links do not break.

### JavaScript — browser interaction

JavaScript owns browser-side behavior such as quizzes, mock tests, timers, search UI, account/auth flows, PWA behavior, CV tools and other interactions that need to respond immediately on the user's device.

### Python — build, validation and content tooling

Python runs before deployment. It copies the static site, injects shared professional assets, validates that visible text has not changed, generates a lightweight search index, and reports broken internal page links. Future content generators and corpus-processing tools should also live here.

### Android

The Android wrapper/app remains isolated under `android/`. Website code should not be rewritten in Java just to increase a language percentage.

## Zero-content-loss rule

`tools/build_site.py` computes a SHA-256 digest of the human-visible text of every HTML page before and after build-time enhancement. Script and style bodies are excluded from that digest. If an enhancement changes visible page text, the build stops instead of deploying.

This makes the existing educational content the protected asset, while allowing the codebase and presentation layer to evolve safely.

## Deployment

GitHub Actions runs the Python build into `_site`, verifies content integrity, creates the local search index, injects the runtime Google Maps configuration, and only then uploads the Pages artifact.

## Design principles

- Preserve all existing user-facing content and URLs.
- Static-first for speed, SEO and low hosting cost.
- Progressive enhancement: the site remains readable even if JavaScript fails.
- Mobile-first touch targets and accessibility-friendly focus states.
- Shared CSS/JS for consistency instead of repeatedly adding page-specific overrides.
- Python for repeatable build and quality automation, not artificial language statistics.
