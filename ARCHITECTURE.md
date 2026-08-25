# Aponar Nihon Architecture

Aponar Nihon is intentionally a fast static-first learning platform. The goal is not to force GitHub language percentages; each language is used where it is strongest while preserving every existing piece of educational content.

## Responsibilities

### HTML — content and semantic structure

HTML remains the source of truth for the existing pages, lessons, guides, headings, examples and educational text. Existing URLs stay compatible so bookmarks and search-engine links do not break.

### JavaScript — browser interaction

JavaScript owns browser-side behavior such as quizzes, mock tests, timers, search UI, account/auth flows, PWA behavior, CV tools and other interactions that need to respond immediately on the user's device.

### Node.js — web build orchestration and quality automation

Node.js is the web-engineering layer around the static site. It provides a standard `npm` workflow, runs the Python content-safe build, performs a post-build web audit, checks critical metadata and generated assets, produces a SHA-256 file manifest, and writes a machine-readable site-quality report. This gives the project a modern professional CI/deployment workflow without requiring a permanent Node server.

The current Node.js tooling deliberately uses only built-in Node APIs, so there is no dependency-install penalty and no unnecessary third-party supply-chain risk. Future tooling such as TypeScript, bundling, browser tests or Lighthouse budgets can be added here when they deliver a real benefit.

### Python — content build, validation and corpus tooling

Python runs before deployment. It copies the static site, injects shared professional assets, validates that visible text has not changed, generates a lightweight search index, and reports broken internal page links. Content generators and corpus-processing tools should also live here.

### Android / Java

The Android wrapper/app remains isolated under `android/`. Java is appropriate for native Android-specific code, but website code should not be rewritten in Java just to increase a language percentage.

## Zero-content-loss rule

`tools/build_site.py` computes a SHA-256 digest of the human-visible text of every HTML page before and after build-time enhancement. Script and style bodies are excluded from that digest. If an enhancement changes visible page text, the build stops instead of deploying.

This makes the existing educational content the protected asset, while allowing the codebase and presentation layer to evolve safely.

## Quality pipeline

`npm run verify` is the single professional verification command. It runs the Python build first, then the Node.js web audit. The Node audit checks the generated site, verifies critical home-page metadata and injected shared assets, records warnings such as duplicate IDs or missing image alt attributes, and writes `assets/data/site-audit.json` with file sizes and hashes.

## Deployment

GitHub Actions installs Node.js 22, runs `npm run verify`, injects the runtime Google Maps configuration, and only then uploads the Pages artifact. Pull requests use the same quality gate, so the preview/test path and the production path stay aligned.

## Design principles

- Preserve all existing user-facing content and URLs.
- Static-first for speed, SEO and low hosting cost.
- Progressive enhancement: the site remains readable even if JavaScript fails.
- Mobile-first touch targets and accessibility-friendly focus states.
- Shared CSS/JS for consistency instead of repeatedly adding page-specific overrides.
- Node.js for web tooling, CI and future TypeScript/browser-test workflows.
- Python for content integrity, generation and corpus processing.
- Java for Android-specific native code, not artificial language statistics.
