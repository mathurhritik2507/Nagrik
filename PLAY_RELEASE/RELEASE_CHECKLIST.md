# Nagrik Google Play Android release readiness — 2026-10-14

**Release status: NOT READY FOR SUBMISSION.** The tested web app and the native Android app are different route implementations. Publishing only after real-device testing and the blocker checklist prevents misleading users and avoidable Play policy rejection.

## Observed repository facts
- Expo SDK 54 / React Native Android project; EAS project `c3bd157d-2115-4102-a12a-8637df1a69ce` linked in `app.json`.
- Android application ID `com.hritikm07.nagrik`, `versionCode: 2`, and production EAS build profile already exist.
- Google Play requires an **Android App Bundle (.aab)** and target Android 16 **API 36** for new submissions from 2026-08-31. Confirm the final bundle's `targetSdkVersion`, not only the Expo SDK version.
- `app/(tabs)/community.tsx` is a native placeholder; only `community.web.tsx` is a Firestore shared feed. **Do not advertise native shared-feed support yet.**
- Native `report.tsx` stores `reports` in AsyncStorage on that device. The success message says “Report submitted successfully!” although it is NOT filed with any public authority. Update all affected native copy before Play release to be explicit about local-only save.
- Native `profile.tsx` currently says “Verify email / account help”; email verification is no longer mandatory. Update copy.
- `app.json` requests CAMERA, READ_MEDIA_IMAGES, POST_NOTIFICATIONS and RECORD_AUDIO. Audit the real manifest and remove permissions not strictly needed. Be especially cautious with broad photo access; prefer Android system photo picker when available.
- No published Nagrik-specific public privacy-policy and account-deletion routes were found in the inspected repository.
- Shared UGC moderation, user/content report, user blocking, abuse response and effective server safeguards need an Android-specific review before enabling any public native feed.

## Release blockers (do not mark complete without evidence)
- [ ] Owner confirms Google Play Console developer account, account type, identity verification, and registration fee (if needed).
- [ ] Verify Expo account/project ownership and EAS build access without sharing passwords, service-account JSON or personal tokens in chat or a public repo.
- [ ] Review native Android core flows on a real Android phone: signup (no mandatory email verification), sign-in, password reset, civic actions, notes/photos, challenges, guide, profile, logout, errors/offline.
- [ ] Replace native Community placeholder with safe native implementation **or** intentionally remove/label it as web-only for Play release; avoid describing missing features on store page.
- [ ] Add **in-app account deletion request path** and **public HTTPS deletion-request web page**, including deletion of associated Firebase Auth and Firestore public content as applicable; verify procedure.
- [ ] Publish accurate public HTTPS privacy policy, linked both in Play Console and inside Android app. Cover account details/Firebase, cloud posts (when applicable), local data, photos, optional AI requests, SDK/hosting providers, retention, user rights, and contact information. Don't invent retention promises.
- [ ] Review Firestore Security Rules and abuse controls (users can create accounts without email verification); provide appropriate UGC report/block/moderation features if UGC is exposed in Android.
- [ ] Run a data collection audit including all Firebase, Expo and ancillary SDK processing; answer Data safety questionnaire accurately.
- [ ] Review permissions against features; test camera/media permissions on Android 13–16; remove unused sensitive permissions.
- [ ] Confirm build meets Google Play Android 16 / API 36 target requirement; resolve dependency and Expo build compatibility.
- [ ] Produce tested production-signed Android **.aab** from project `com.hritikm07.nagrik`; keep Android signing keys private.
- [ ] Prepare Play Console listing, **actual Android screenshots**, feature graphic, icon, support email, app access/reviewer test account instructions and content rating.
- [ ] For new personal developer accounts, arrange 12 opted-in testers for at least 14 continuous days of closed testing and obtain production access.
- [ ] Owner reviews pricing, target regions, developer identity disclosure, app content, government affiliation claims and final submission.

## Release workflow (after blockers are addressed)
1. Create/sign in to your Play Console developer account: https://play.google.com/console
2. Create the app entry under **Nagrik**; choose **App**, **Free**, appropriate audience/country.
3. Sign in to the **correct** Expo account (`eas whoami`), then check the linked EAS project (`eas project:info`).
4. On your own trusted computer: `npm ci`, `npx expo-doctor`, then `npx eas-cli@latest build --platform android --profile production` (Expo authentication/Android signing prompts will appear).
5. Download/check generated `.aab` file. Do not distribute an APK as the store production artifact; use it only for direct testing.
6. Upload first bundle to Play Console testing track manually, or configure EAS Submit and its Google service account through secure Expo/Google UI. Do not commit a service-account key to GitHub.
7. Fill in required Play Console declarations, account deletion, policy URLs, tester details and store assets, then submit the release for review.
8. After test/production review, confirm the public Play Store listing and installation on a real Android device.

## Primary references
- Android target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Play account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- User-generated content policy: https://support.google.com/googleplay/android-developer/answer/18258653
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Expo build: https://docs.expo.dev/build/setup/
- Expo Play submission: https://docs.expo.dev/submit/android/

**Note:** Google Play Store publishing isn't the same as deploying the web version on Vercel; publishing requires a reviewable native Android build and an authorized Play Console account. Nothing in this checklist claims an app or release has been submitted.
