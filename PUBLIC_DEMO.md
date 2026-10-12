# Nagrik Public Demo — Free Mode (No API Billing)

## Try it

- **Guest, no signup:** `/demo`. Anyone can ask the locally processed, curated Civic Guide about supported topics. No OpenAI API request or paid credits.
- **Authenticated demo:** Sign up or sign in. Home, Actions, Reports, Challenges, Profile and Insights are available within the app.
- **Shared community:** Email verification is required to publish. The text-only Feed, comments, likes and leaderboard use the existing named Firestore database `default`; real cross-account submission and moderation remain release gates.
- **Optional Live AI:** Users may intentionally select Live AI inside Civic Assistant. If the owner has no API credits or the provider fails, the page automatically and **explicitly** displays a prepared Civic Guide response instead of claiming that generative AI answered.

## What actually persists

| Feature | Storage | Scope | Important limitation |
|---|---|---|---|
| Guest guide | React in-memory state | Current open session | Not AI; prepared topics, no live data |
| Signed-in Free Civic Guide | React in-memory state | Current open session | No API calls |
| Actions, personal reports, attached proof, practice XP | Browser localStorage, scoped to Firebase UID | Same browser/device | No cloud sync; storage may be erased by browser |
| Weekly crate | Browser localStorage | Same browser/device | Only digital badges, no real vouchers or rewards |
| Shared community text Feed, comments and likes | Firebase Firestore, named database `default` | Signed-in members under published Firestore rules | User-reported, not independently validated |
| Public Leaderboard | Recent Firestore shared posts | Signed-in members | Counts posts, not verified civic impact |
| Live AI | Nagrik Vercel function + API provider | Signed-in users | Optional, requires owner API credits; not guaranteed |

Nagrik does **not** file government complaints or issue paid vouchers. Uploaded action photos are local browser data unless the user separately and explicitly shares a text post. Do not enter private addresses, passwords, medical details or strangers' identifiable information.

## Local test on Mac

```bash
npm ci
node scripts/test-civic-guide.cjs
node scripts/test-weekly-rewards.cjs
node scripts/test-civic-api.cjs
node scripts/test-community.cjs
node scripts/test-firestore-database-target.cjs
npx tsc --project tsconfig.web.json --noEmit
npm run export:web
```

To run the interactive development site: `npm run web`. A browser smoke test runs in CI, opens `/demo`, clicks a supported question and checks that the guest flow did not call `/api/civic-assistant`.

## Public launch checklist (not yet all complete)

1. Confirm Vercel Preview is **Ready** for the latest feature-branch commit.
2. Open `/demo` in a **logged-out private browser** and ask both a known and an unknown civic question.
3. Create a user, log in, log out, reset password, and verify email.
4. Save a private action and report; refresh and confirm browser persistence. Verify they do not appear in shared Feed.
5. Complete three distinct challenge proofs during one UTC week; claim the **virtual badge**, reload and confirm persistence.
6. Have two verified users: publish exactly one opted-in text contribution, refresh and confirm server save, then test viewing, commenting, liking, flagging and deletion across accounts.
7. Verify Firestore rules, spam throttling, a trained moderator/contact path, privacy/terms, backup/recovery, quotas and Android regressions before large-scale public use.
8. Only after those tests, merge draft PR #1 and verify Vercel **Production** matches the exact tested commit.

**Do not describe the free guide as live AI, issue records as municipal filings, challenge uploads as independently verified, or weekly crates as real vouchers.** No live AI billing is needed for the free guide.
