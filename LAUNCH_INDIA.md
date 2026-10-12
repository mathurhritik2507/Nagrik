# Nagrik — India Launch Checklist

> Current phase: installable **web beta**. This is not a government app, a verified municipal complaint platform or a Google Play release. Do not claim otherwise.

## What we can ship from GitHub

- Installable PWA manifest, branded 192/512 PNG icons built with Node at web-export time, Safari home-screen metadata and clear install instructions.
- `/install` page linked from login, guest demo and signed-in Home.
- Browser and CI checks for manifest, icon pixel dimensions, direct asset serving, sign-in and guest routes.
- Public `robots.txt` and `sitemap.xml` for the demo/install pages.
- No service worker and **no cache of private records** in this initial PWA release. Network required for most functionality.
- Keep changes on `feature/nagrik-pwa` and review Vercel Preview before merging to `main`.

## Owner-required steps (do not share passwords, API keys or identity documents in GitHub)

| Requirement | Owner action |
|---|---|
| Preview acceptance | Open Vercel branch Preview in an incognito browser, test Chrome Android install / Safari Add to Home Screen. Verify Free Guide, login, logout, and navigation. |
| Real-world signed-in testing | Use **two** real, separate test accounts to verify Firestore posts, comments, delete permissions, and leaderboard after refresh. |
| Privacy and data processing | Confirm what Nagrik collects, where Firebase/Vercel process and store it, retention, consent, contact method, and user rights. Have a qualified local professional review India-specific legal obligations before national launch. |
| User control | Implement and verify account deletion, personal-record deletion/export and related Firebase/Firestore cleanup; do not promise these until tested. |
| Moderation & abuse | Designate a moderator and escalation inbox; protect against spam, harassment and fake evidence. Rate-limit writes on the server, not just the browser. |
| Security | Audit Firebase rules on the **named** Firestore database `default`, uploads, network headers, private browser storage, backups and recovery procedures. |
| Google Play | Create/verify Google Play Console developer account, pay the registration fee, upload Android AAB built via EAS, complete data-safety/privacy and account-deletion declarations, invite required testers, apply for production, and approve release. |
| Languages and accessibility | Review English, Hindi and Marathi translations with native speakers; accessibility and low-end Android testing. |
| Rewards | Keep crates and badges **virtual only** until real offers are funded and contractually backed by partners. |
| Local authority relationships | Obtain explicit approval for any claims of official affiliation or municipal service integration. |

## Manual release testing (must do)

1. Open the PWA Preview from a **signed-out** Android Chrome browser. Open `/manifest.json`, `/icon-192.png`, and `/icon-512.png` and confirm the server returns JSON/PNG, not the app HTML.
2. Open `/install`, choose Install if prompted, or Chrome ⋮ → Install app / Add to Home screen. Launch from the installed icon.
3. In iPhone Safari, Share → Add to Home Screen; launch and check scroll, bottom navigation, text fields and visibility.
4. Close and reopen the app; confirm it launches to the guest demo and is **online-first**.
5. Test sign-up / email verification / password recovery (including spam mailbox), logout, one genuine Firestore post, comments, likes, refresh and another user account.
6. Verify local-only reports/challenge proofs stay private and do not appear as official government filings or shared public activity.
7. Confirm the Free Civic Guide works with **zero paid API credit**, labels prepared reference content honestly, and the optional Live AI may be unavailable.
8. Check any exposed API endpoint's rate limits and costs before inviting hundreds of people.
9. Only then merge to production and repeat all smoke checks on `https://nagrik-eight.vercel.app/install`.

## Google Play planning

Expo config already includes Android package ID `com.hritikm07.nagrik` and EAS project settings. A working web app is **not** proof of a working Android build.

On your Mac, after you have Expo and Play Console access:

```bash
npm ci
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
# Review and test preview build on real Android devices.
npx eas-cli@latest build --platform android --profile production
```

Do not upload/submit a production bundle until permissions (including microphone and camera), privacy pages, data safety declarations, account deletion and Android sign-in flow have been checked. New personal Play Console accounts may require a closed-test cohort and duration before production eligibility; confirm requirements inside your own Play Console.

## Suggested first pilot: Pune

- 20–50 invited testers, using their own phones and no sensitive personal information.
- Choose 1–2 limited civic activities for safe and lawful participation.
- Measure: guests reaching guide, successful signups, form completion, verified Firebase saves, 7-day retention, support issues, errors and operating costs.
- Share accurate outcomes; avoid claims that every citizen has joined or that municipal officials are monitoring posts.
- When stable, test local language support and expand to additional cities. Promotion follows successful retention, not vice versa.

## Operating principle

An installable site, a store listing, and a trusted public civic network are **three different milestones**. The first can be built now. The others require verified security, support procedures, store access and user feedback.
