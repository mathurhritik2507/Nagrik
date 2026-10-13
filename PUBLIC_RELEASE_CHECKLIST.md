# Nagrik public-release gate — Web 2.2

This upgrade is a **single coordinated release candidate**. It is intentionally held off the production `main` branch until the items below are verified.

## Implemented in the development branch
- Web navigation: Home, Feed, Challenges, Reports, Profile; Actions, Civic AI and Leaderboard are accessible from Home or Feed.
- Firebase Auth: signup/login without mandatory email verification, password reset.
- Local civic action reporting, issue reporting, proof uploads and reward cabinet.
- Weekly badges after three distinct missions during a UTC week. **Not redeemable vouchers.**
- AI civic chat via authenticated Vercel function and OpenAI API. Requires a private API key and production rate limiting.
- Firestore shared **text-only** feed (opt-in) for signed-in members, author names, city, category and date.
- Live likes, comments, self-delete, and post reporting.
- Weekly Leaderboard from the latest **100 visible public posts**, clear sampling/unverified disclaimers.
- Homepage public contribution highlights from Firestore.
- Continuous integration: web export, targeted TypeScript, weekly reward tests, mock AI endpoint tests, ranking and baseline rule checks.

## REQUIRED: Firestore database / rules
The repo contains `firestore.community.rules`, **NOT applied automatically**.
1. Open Firebase Console → project `nagrik-5ef31` → Build → Firestore Database.
2. If Firestore isn't created, create it in **Production mode** and choose an appropriate region. Read Firestore pricing/quotas before public launch.
3. Back up the **existing rules**. Do not blindly overwrite them: the Android app and legacy features may depend on existing collections.
4. Merge the `communityPosts` and `communityFlags` match sections from `firestore.community.rules` into the existing `service cloud.firestore` rules block. Review the fallback rule to ensure you don't accidentally grant broad access or break unrelated data. Publish rules.
5. Test rules with the Firebase Rules Playground or Firestore Emulator:
   - unauthenticated post create denied
   - signed-in but unsigned-in self-authored post create allowed
   - verified self-authored post create allowed
   - editing another user's post denied
   - reading private user data across accounts denied
   - liking/commenting as another UID denied
   - public flag collection not readable by users
   - unrelated collections retain their previous intended access policy
6. After rules are deployed, open the Vercel **Preview**, sign in with **two different signed-in test accounts** (separate profiles/browsers):
   - A creates an opted-in text post, B sees it
   - B likes/comments, A sees it update live
   - B reports an inappropriate test post; the flag appears in the admin Firestore console
   - A deletes their own post, B no longer sees it
   - B cannot delete A's post
   - private issue reports, locally saved photos and challenge proofs do **not** appear in the public feed.
7. Confirm feed/leaderboard empty states are accurate when nobody has posted. Don't insert fabricated users or scores.

**Moderation:** This version can accept reported posts, but **does not automatically review or remove abusive content**. Before opening the feature to large public audiences, establish moderation response ownership, retention/deletion procedures, rate limits, reporting abuse handling, and a public privacy policy/terms of use. Public feed is therefore beta-only until these are in place.

## REQUIRED: AI / Vercel
- Put `OPENAI_API_KEY` in Vercel **Secret** environment variables. The preview environment is sufficient for testing; never publish keys to GitHub or `EXPO_PUBLIC_*`.
- Redeploy preview after changing environment variables.
- Test Civic AI with questions about sanitation, pollution, roads, accessibility, community action and local government services.
- Check 401 on unauthenticated requests; check 429 rate-limit behavior.
- The current serverless counter is **per-instance, not shared**. Configure a durable, shared rate limiter or a Vercel WAF rule and provider spend budget before inviting large public traffic.
- Confirm AI output does not claim Nagrik has sent official reports or issued real vouchers.

## Required web/browser acceptance tests
- [ ] Desktop Chrome + Safari responsive navigation
- [ ] Mobile browser bottom tab navigation, forms and upload picker
- [ ] Password reset email arrives, link works, new password signs in
- [ ] Login/logout; returning sessions and two separate users
- [ ] Local action/report save persists after refresh and is isolated by UID
- [ ] Weekly crate unlocks only after 3 different missions in one UTC week
- [ ] One digital crate claim per week; stored badge survives reload
- [ ] Opt-in public feed post visible across two test accounts
- [ ] Comments and likes visible cross-account; delete works
- [ ] Community leaderboard highlights actual contributor names (no placeholders)
- [ ] Flags can be reviewed by project owner and responded to promptly
- [ ] AI backend uses server-only credentials and returns live model output
- [ ] Firebase and AI quotas/budgets are monitored
- [ ] Existing Android app's main flows are regression-tested

## Release procedure
1. Run/verify the GitHub Actions checks on branch `feature/nagrik-web-v2-working-flows`.
2. Test the Vercel **Preview** deployment and the Firestore rules with two accounts.
3. Document the moderation contact, privacy policy, retention and limitations.
4. Merge PR #1 into `main` only after the above checks pass.
5. Vercel Production deployment should rebuild from `main`. Verify that its final commit matches the tested build.
6. Test the production URL `https://nagrik-eight.vercel.app`, then share with public users.

## Key limitations (must be clearly communicated)
- Nagrik is not an official government grievance service.
- Published feed posts are unverified; rankings measure self-reported activity and are sampled.
- Current local action/report/proof data is not synced across devices.
- Community text posts are shared across users only **after Firestore database security is configured**. The no-verification policy requires manually updating the LIVE Firestore Rules for the named database `default`; GitHub updates alone do not change them.
- Virtual crates have no cash/voucher value. Do not call them redeemable rewards.
- AI may be wrong; users should verify local laws/contact details on official sites.

**Do not call the release production-ready until security rules, moderation, two-account tests and the release checklist are complete.**
