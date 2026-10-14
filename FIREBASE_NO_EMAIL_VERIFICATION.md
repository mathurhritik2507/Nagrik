# Nagrik public beta — remove mandatory email verification

Status: Source code on `fix/remove-mandatory-email-verification` is prepared for signed-in beta users. This file **does not** change live Firebase Security Rules when committed to GitHub.

## What changes and what stays protected
- Email/password signup signs a user in immediately; Nagrik does not send a verification email at signup.
- No email-verified condition on community post creation, likes, comments and author-owned deletion.
- Users still require Firebase Authentication. Public posting requires explicit opt-in, documented length limits, and Firestore-enforced author UID/ownership restrictions.
- Changing an account email is a sensitive operation and still requires the Firebase-issued confirmation for the **new** email. Password reset may also use email delivery. Those flows are intentionally preserved.
- Lack of verified email **increases spam and fake-account risk**. Do not promote the community widely until rate-limits, abuse-report review, moderation ownership and privacy terms are in place.

## REQUIRED owner action: Update the LIVE Firestore rules

Firebase project: `nagrik-5ef31`
Firestore database: **named** `default` (NOT `(default)`).

1. Open https://console.firebase.google.com/project/nagrik-5ef31/firestore
2. Choose the named `default` database and open **Rules**.
3. Copy and safely back up the existing rules before editing.
4. Find the existing `communityPosts`, nested `likes` and `comments` rules.
5. Remove **only** the email-verification precondition; preserve sign-in, UID ownership, field validation and read restrictions:
   - For a shared helper `function verified() { return signedIn() && request.auth.token.email_verified == true; }`, switch the helper to `function verified() { return signedIn(); }` if its uses are limited to the intended community operations.
   - Or replace the community checks `verified()` with `signedIn()` where appropriate, preserving every other condition.
   - If you use direct `request.auth.token.email_verified == true` expressions, remove only that clause from the relevant community match blocks.
6. Compare changes against this repo's `firestore.community.rules`. **Do not paste the whole file** over your existing Firebase rules — other collections might need existing policies. Do **not** use `allow read, write: if true` or `allow write: if request.auth != null` globally.
7. Click **Publish** in Firebase Console.
8. Test in Firestore Rules Playground / Emulator:
   - Guest with no Firebase Authentication: cannot create, like or comment.
   - Signed-in account with `email_verified: false`: can create a validated post using its own `authorUid`.
   - Signed-in member can like/comment using only its own user ID; cannot impersonate or delete other users' posts.
   - Moderator flag records remain unreadable to users.
9. After the matching web build reaches Vercel Production, test two different accounts (one with `email_verified: false`) posting and reacting. Verify server confirmation and cross-account visibility.
10. Keep an operational moderator for inappropriate/spam posts, add durable rate limits and abuse protection before large public promotion.

## Deployment coordination

A Firestore Rule file changed on GitHub is **not** an automatic Firestore deployment. The live rules and new web build should be released together: until both are updated, one side can still block unverified users. If Vercel reports a rate limit, wait until deployment is Ready and re-test rather than assuming a GitHub merge deployed anything.

## Note for beta testers

Accounts created under the old signup flow still exist. They should sign in using their original email and password; they do **not** need to create another account. If they cannot sign in, use the password-reset or account help flow.
