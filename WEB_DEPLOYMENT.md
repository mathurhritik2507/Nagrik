# Nagrik — Web Deployment (Expo + Vercel)

The **original Android/iOS application remains unchanged**. Expo web uses `firebaseConfig.web.js` for browser authentication, while native platforms keep `firebaseConfig.js`.

## Check locally
Use Node.js 20 or 22.

```bash
npm ci
npm run web
```

Then build a static export:

```bash
npm run export:web
```

Output: `dist/`.

## Deploy to Vercel
1. Sign in at https://vercel.com with GitHub.
2. Import `mathurhritik2507/Nagrik`.
3. Framework preset: **Other**.
4. Install command: `npm ci`
5. Build command: `npm run export:web`
6. Output directory: `dist`
7. Deploy and verify login, civic challenges, reports, and navigation.

The included `vercel.json` provides SPA fallback routing.

## Firebase setup
In Firebase Console > Authentication > Settings > Authorized domains, add your final `*.vercel.app` domain, if using email/password or other authentication flows. Review Firestore security rules before enabling production traffic. Firebase client configuration values are public identifiers, not admin credentials, but your security rules must protect user data.

## Constraints / verification
- No successful Vercel deployment or Expo web production build has been verified yet.
- Mobile-specific camera, push notifications, haptics, and image picking may need browser fallbacks.
- The AI assistant currently uses local keyword-based responses in the source; do not describe it as an externally hosted generative AI model.
- If `npm ci` reports a lockfile mismatch, run `npm install` locally and commit the updated `package-lock.json`.
- Keep screenshots, live demo URLs, and deployment success badges out of the README until verified.
