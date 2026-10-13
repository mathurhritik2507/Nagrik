# Nagrik 🇮🇳

> **Public beta / interactive demo:** The [free guest Civic Guide](https://nagrik-git-feature-nagrik-web-v2-working-flows-mathurhritik2507.vercel.app/demo) offers prepared civic guidance without signup or OpenAI API billing. Check that the latest Vercel Preview is **Ready** before sharing this link. The [signed-in beta](https://nagrik-eight.vercel.app/login) has personal local records, virtual weekly badges and optional Firebase community posting (no email verification required after the updated rules deploy); the upgraded beta features are **not yet merged into production**. Details: [Public Demo](PUBLIC_DEMO.md) · [Public release checklist](PUBLIC_RELEASE_CHECKLIST.md).

> **Transparency:** Demo challenge proofs are not independently verified, private issue records are not government filings, community rankings count self-reported text contributions, virtual crates are not redeemable vouchers, and the Free Civic Guide is **not** generative AI.

AI-powered civic engagement platform focused on real-world civic participation, gamification, and community-driven public impact.

---

## 🚀 Overview

Nagrik is a modern civic-tech mobile application designed to encourage citizens to actively participate in improving their communities through verified civic actions, civic issue reporting, gamified challenges, and AI-assisted engagement.

The platform transforms civic participation into an interactive experience by combining:
- AI assistance
- Civic gamification
- XP & reward systems
- Civic streaks
- Community engagement
- Real-world action verification

---

## ✨ Features

### 📸 Civic Action Uploads
Users can upload positive civic actions such as:
- Cleaning public spaces
- Plantation drives
- Community volunteering
- Traffic assistance
- Public awareness campaigns

---

### 🚨 Civic Issue Reporting
Users can report:
- Garbage issues
- Road damage
- Water leakage
- Traffic problems
- Public safety concerns

---

### 🎯 Proof-Based Civic Challenges
Daily and weekly civic missions requiring:
- Real participation
- Photo proof verification
- Challenge completion tracking

---

### 🤖 AI Civic Assistant
Integrated AI assistant provides:
- Civic awareness guidance
- Public participation suggestions
- Smart engagement recommendations
- Civic learning support

---

### 🏆 Gamification System
The application includes:
- XP system
- Civic levels
- Achievement badges
- Participation streaks
- Civic score calculation
- Community rankings

---

### 🔔 Engagement Notifications
Users receive:
- Streak reminders
- Challenge updates
- Civic participation notifications
- Engagement prompts

---

## 📱 Platforms

- Android ✅
- iOS ✅ (Expo Go / Preview)
- Cross-platform mobile architecture

---

## 🛠 Tech Stack

### Frontend
- React Native
- Expo Router
- JavaScript

### Backend & Cloud
- Firebase Authentication
- Firestore Architecture
- AsyncStorage

### Mobile Features
- Expo Notifications
- Expo Image Picker
- Camera Integration

---

## 🎨 UI/UX Focus

Nagrik was designed with:
- Modern mobile-first UI
- High engagement flow
- Orange civic branding
- Gamified interaction psychology
- Simple civic onboarding
- Community-driven design principles

---

## 📸 Application Screenshots

### Home Dashboard
Modern civic engagement dashboard with XP tracking and quick actions.

### Upload Actions
Users can upload civic contributions with image proof and descriptions.

### Challenges
Proof-based civic challenge system encouraging real-world participation.

### Civic Impact
City rankings, civic health insights, and participation analytics.

### Profile System
Civic score, achievements, level system, and engagement history.

---

## 🔮 Future Roadmap

- Real-time Firestore synchronization
- Civic heatmaps
- AI moderation system
- Real-time community feed
- Reward marketplace
- Smart civic analytics
- Public leaderboards
- Community volunteer groups
- Government integration support

---

## 👨‍💻 Author

### Hritik Mathur

MS in Data Science  
Pace University, New York

Former Network Engineer with 3+ years of experience transitioning into AI, Data Science, and full-stack product development.

---

## 📌 Project Vision

Nagrik aims to bridge the gap between citizens and civic responsibility by making public participation engaging, rewarding, and technology-driven.

The long-term vision is to create a scalable civic ecosystem that encourages measurable real-world community impact.

---

## ⭐ Status

Currently in active development and beta testing.

---

## 🌐 Web Deployment (Expo + Vercel)

Nagrik now includes a browser-specific Firebase configuration, Expo web scripts, and Vercel hosting configuration, while preserving the native Android/iOS source code.

To test locally:

```bash
npm ci
npm run web
npm run export:web
```

For deployment steps and limitations, see [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md). A working hosted web demo has **not yet been verified**. The civic assistant currently uses keyword-based responses, not a hosted generative AI model.

## 🌐 Live Web Preview

**[Open the Nagrik web app](https://nagrik-eight.vercel.app/login)** · [Deployment instructions](WEB_DEPLOYMENT.md)

The public web build is deployed through Vercel. Authentication and browser-specific mobile features still require end-to-end testing; availability of the login screen alone does not prove every feature works.
