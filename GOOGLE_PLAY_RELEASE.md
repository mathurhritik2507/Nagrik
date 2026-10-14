# Nagrik — Google Play release preparation (October 2026)

**Status: PREPARATION ONLY — not submitted to Google Play.** This is not a signed Android App Bundle or a Google Play listing.

## Existing Android application
- Expo SDK 54 / React Native, Android package ID `com.hritikm07.nagrik`; the package ID must be checked for availability and retained once registered.
- Existing `eas.json` has a `production` profile and remote build-version management.
- Expo SDK 54 targets Android API 36 by default in standard managed builds, meeting the Google Play new-app target requirement effective August 31, 2026. Verify the generated Android manifest and final AAB.
- The file named `App APK` in this repository is **not a usable APK** (it is only a 96-byte file).

## Blocks before a public Android release
- [ ] Google Play Console developer account exists, is verified and authorized to publish; developer registers and pays the one-time registration fee, currently US$25.
- [ ] An Android device has tested the **native** signup/login, password reset, camera/photo picker, private action/issue records, notifications, profile, logout, session restoration, and accessible navigation. Web browser tests do not validate native Android.
- [ ] Decide whether to bring the functioning web Community Feed to Android. **The native `app/(tabs)/community.tsx` is a placeholder**, not the shared web feed. Do not advertise web-only functionality as native.
- [ ] Replace any hard-coded demo activity, rankings, or fabricated civic results with clearly labeled demo data or real user content only.
- [ ] Add a discoverable **in-app account deletion request and external account-deletion webpage**, implementing deletion of Firebase Auth account, associated Firestore data and client-local data as applicable; handle security-sensitive reauthentication and any disclosed retention. No fake deletion link.
- [ ] Publish a **real privacy policy URL** accessible without signing in, linked within the Android app, detailing email authentication, Firebase processing, locally saved photos/reports, user-submitted public data, AI usage, retention/deletion and contact information. Developer must approve actual factual policy text.
- [ ] Complete Google Play **Data safety**, target audience/content rating, advertising declaration, government affiliation declarations where applicable, and Play Console **App access** steps for reviewers. Never put reviewer passwords or Google service-account keys in this repository.
- [ ] Establish enforceable **UGC terms, report/block controls and ongoing moderation** for any shared Android community feature, or keep that feature disabled for the launch. Web moderation is not a substitute for Android moderation.
- [ ] Audit camera, notification, image-picker and SDK permissions in the **final AAB merged AndroidManifest.xml**. This preparation branch removes Android microphone and broad media-library requests; Android photo picker should work with user-selected photos. Test on Android devices.
- [ ] Confirm the app's civic issue notes are described as **private records**, not government filings; badges and XP are virtual; claims about verification and awards are not misleading.
- [ ] Prepare a 512x512 store icon, 1024x500 feature graphic and **actual Android device screenshots** of the final build; do not use browser screenshots as evidence of Android behavior.
- [ ] Build and test the Android App Bundle (.aab), verify signing and Play App Signing enrollment, scan package metadata, and test an internal Play Store release.
- [ ] If a new personal Play developer account was created after November 13, 2023, plan for a closed test with **12 testers opted in continuously for at least 14 days** before applying for production access. Google may review the application and ask for more testing.

## Proposed store listing — accurate to current native features
**Title:** Nagrik

**Short description (80 characters max):** Track civic actions, save issue notes and explore community challenges.

**Full description (draft):**
Nagrik helps you take small, meaningful steps toward a cleaner, more engaged community.

Record your civic activities, keep personal notes about local issues, explore challenges, and track your progress with virtual points and badges. Learn about civic participation through a free prepared Civic Guide.

**Important:** Nagrik is an independent civic-engagement project, not a government app. Saving an issue note **does not submit a complaint to government authorities**. Self-reported activities and points are not officially verified. Virtual badges are not monetary rewards. Some features available on Nagrik's website may not yet be available in the Android app.

The final listing must match the build actually submitted, and its category, contact and privacy links must be approved by the account owner.

## Build and submission — commands for the account owner
The Expo developer who controls the EAS project `c3bd157d-2115-4102-a12a-8637df1a69ce` should run from a verified source checkout:

```bash
npm ci
npx expo config --type public --json
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile production
```

EAS manages build credentials through the authorized account. **Do not paste signing credentials, service-account JSON, keystores, or `EXPO_TOKEN` into public GitHub or chat.** After a signed `.aab` exists, create the app in [Play Console](https://play.google.com/console/), finish required policy/listing sections, and submit to internal testing (via Play Console upload or authorized EAS Submit).

Google's review and the owner's Play Console permissions control publication; pushing to GitHub or deploying the web app to Vercel **does not** publish the Android app.

## Reference docs
- Play Console setup: https://support.google.com/googleplay/android-developer/answer/6112435
- API target requirement: https://support.google.com/googleplay/android-developer/answer/11926878
- Play account-testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- UGC moderation: https://support.google.com/googleplay/android-developer/answer/9876937
- Expo Android build: https://docs.expo.dev/tutorial/eas/android-production-build/
- Expo Google Play submission: https://docs.expo.dev/submit/android/
