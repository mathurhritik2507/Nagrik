# Nagrik Web 2.0 — Upgrade Notes

This feature branch adds a **web-specific** product experience while leaving the existing Android/iOS screens untouched. A GitHub PR and web-export CI are used to validate the change before publishing.

## What changes
- Responsive dark-navy/orange UI, improved navigation, clear mobile/desktop layouts.
- User-specific browser storage keyed by the authenticated Firebase UID.
- Working action and issue submit forms with validation, visible success/error messages, records, and optional browser-photo thumbnails.
- Challenge selection, photo-based proof submissions labeled **unverified**.
- Profile edit, logout, recent activity, personal KPI summaries, and category analytics.
- Civic AI chat with authenticated server-side requests; requires a server-side AI API key and abuse safeguards before public use.
- Password reset through Firebase for both browser and Android.
- Ten civic missions and a once-per-week digital reward crate after three distinct unverified proofs.

## IMPORTANT: What is not implemented yet
- These records are **local to this browser**. Clearing browser data or switching devices loses access to them. Firebase is used for sign-in, **not** for cloud storage of these new records.
- Records are NOT shared publicly, verified, or forwarded to municipality or emergency services.
- Challenge proofs remain unverified. Weekly crate awards are virtual collectibles, not verified achievements, cash or redeemable vouchers.
- No verified map coordinates, actual incident statistics, or municipal integrations. Live AI replies require the server-side API key to be configured.
- Prior native AsyncStorage records are not imported into the new web-only store. The old native code is not changed.

See [WEB_V2_REWARDS_AI.md](WEB_V2_REWARDS_AI.md) for the detailed AI configuration and weekly reward criteria.

## QA checklist before merging
- [ ] Web export builds: `npm ci && npm run export:web`
- [ ] Register/login; confirm Firebase auth
- [ ] Add an action; see count and recent activity increase
- [ ] Save a report; see report list and personal insights update
- [ ] Submit proof with photo and description; see unverified record
- [ ] Edit profile, refresh browser, verify fields persist
- [ ] Log out and sign back in; confirm account separation on shared browser
- [ ] Validate layout on laptop and phone screen sizes
- [ ] Verify uploaded photos are small enough for browser storage
- [ ] Confirm other Android/iOS screens remain unchanged

## Deployment
Vercel builds from `main` by default. A feature branch PR should be deployed to a Vercel preview URL if GitHub/Vercel integration allows it. Test the preview before merging; merging triggers a production redeploy.

Firebase/Firestore migrations are intentionally out of scope until server-side security rules, privacy and moderation have been designed.
