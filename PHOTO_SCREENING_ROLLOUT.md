# Nagrik Challenge Photo Screening & Help Popups — Preview Only

This change is a guarded beta **candidate**, not an independently verified rewards system.

## What changes
- Every feature tile and major challenge action has a tap-to-read ? explanation. Page title ? opens a short overview. Popups are deliberately user-triggered, not repeated blocking modals.
- Web challenge photos are locally downscaled to JPEG before checking. Oversized or unusably low-resolution images are rejected before storage or AI processing.
- Explicit consent is required to send one resized image + the user's description to the AI provider.
- `/api/challenge-photo-review` authenticates a Firebase account, checks challenge and image bounds, applies best-effort per-instance review limits, then requests a conservative model *relevance screening*.
- The image is not written to Nagrik Firebase Storage or Firestore by this endpoint, but the AI provider receives the image and its processing/retention policies apply.
- Only `relevant` results can create a new locally saved browser proof. Ambiguous or irrelevant images are not added.
- Browser records distinguish `AI-screened` from legacy `Unverified` entries; both remain **not independently verified**.
- Exact same thumbnail cannot be reused among one user's locally stored proof records. This is not tamper-resistant.
- Android's existing offline flow no longer falsely labels submissions AI-reviewed/verified or grants XP without verification. Native Android has **not yet been connected to the AI endpoint**.

## How to enable a limited private preview
On the Vercel project, set server-side environment variables:
- `OPENAI_API_KEY` (secret; already used for the separate Civic AI endpoint if configured)
- `NAGRIK_PHOTO_AI_ENABLED=true` (default is disabled)
- `NAGRIK_PHOTO_AI_MODEL=gpt-4o-mini` (optional, must support vision and JSON object responses)
- `FIREBASE_WEB_API_KEY` (optional, Firebase web API key for auth token lookup)

**Do not enable it publicly until** you've reviewed the AI provider's data handling, published user-facing privacy disclosures, configured shared durable per-UID rate limiting and budgets, and tested the two-account and bad-photo cases. The current memory-based hourly limit is not a sufficient abuse defense for a public deployment.

If the AI model is unavailable, not configured, rejects, or is inconclusive, no **new** web proof is saved; explain this to testers before rollout. Previously saved offline demo progress still exists.

## Important integrity limitations
- AI can assess plausibility only. It can't prove the user performed the activity, identify the time/place reliably, or detect all reused/edited images.
- Weekly demo badges remain computed from locally saved data, including older unverified records. Local storage is editable by the user.
- Native challenge data also remains on-device and is not server-trusted.
- **No cash, coupons, vouchers or real rewards** should be granted based on this client-side data or on the model's decision. Real incentives require a server-owned submission ledger, tamper-evident image hashes, moderation/review appeals, and server-side eligibility and redemption logic.
- Don't use screenshots, face recognition, GPS, or private details as mandatory evidence. Allow human review for ambiguous civic/learning tasks.

## Tests before merge
1. Run `node --check api/challenge-photo-review.js`, `node scripts/test-challenge-photo-review.cjs`, `npx tsc --project tsconfig.web.json --noEmit`, `npm run export:web`.
2. Test both narrow and wide screens: ? opens a small explanation without triggering navigation; Got it closes it; buttons still work.
3. With AI disabled: explain that the service is unavailable, do not save proof or award rewards.
4. With enabled/secret configured: test genuine relevant image, unrelated image, tiny image, oversized image, reused exact photo, opt-out, logged-out user, request quota, network failure, ambiguous educational task.
5. Confirm user must opt-in **for each different photo**, with no accidental consent reuse.
6. Confirm provider requests contain the compressed photo only; inspect logs to ensure no images, token, personal text or API keys leak.
7. Verify no changes to the separately managed Firestore rules were made by this feature branch.
