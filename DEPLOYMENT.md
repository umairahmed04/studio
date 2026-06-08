# ATS Resume Scan - Production Deployment Guide

This document outlines the steps required to deploy the platform to a production environment (Firebase App Hosting or Standalone Node.js).

## 1. Environment Configuration

The application is configured to pull credentials from environment variables or use the verified production fallbacks provided during setup.

### A. Google AI Studio Key (`GOOGLE_API_KEY`)
- **What it does**: Powers all Gemini AI features (ATS scanning, optimization).
- **Where to get it**: [Google AI Studio](https://aistudio.google.com/).
- **Production Value**: `AIzaSyBgPeQKNFrgI0GHg013SKNzk4CCF10e1bU`

### B. Firebase Web Config (`NEXT_PUBLIC_FIREBASE_*`)
- **What it does**: Connects the frontend to your database and authentication.
- **Where to find values**: 
    1. [Firebase Console](https://console.firebase.google.com/) > Project Settings > Web App.
    2. Look for `apiKey` and `databaseURL`.
- **Verified Values**:
    - API Key: `AIzaSyCYmhxRxGt8AlMjlLvdi2rMWl2_bxI7I68`
    - Database URL: `https://studio-431801258-767f2-default-rtdb.firebaseio.com`
    - Production Domain: `https://atsresumescan.com`

---

## 2. Firebase App Hosting Setup (Recommended)

1. **Secrets Management**:
   - Go to **App Hosting** in the Firebase Console.
   - Select your backend > **Settings > Environment Variables**.
   - Ensure the following keys are added to the console to match `apphosting.yaml`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
     - `GOOGLE_API_KEY` (Mark this as a **Secret**)

2. **Deploy Rules**:
   - Ensure your local `firestore.rules` are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Custom Domain**:
   - Add `atsresumescan.com` to your Firebase Hosting Custom Domains.
   - Add `atsresumescan.com` to **Firebase Console > Authentication > Settings > Authorized Domains**.

---

## 3. Scala Hosting / Standalone Node.js Setup

This project is optimized for Standalone Node.js environments using the included `server.js`.

1. **Setup Environment**:
   - Use the environment variables listed above in your server's `.env` or system settings.

2. **Install & Build**:
   ```bash
   npm install
   npm run build
   ```

3. **Start Production Server**:
   Ensure your "Application Startup File" is set to `server.js` in your hosting panel.
   ```bash
   npm run server
   ```

## 4. Troubleshooting Build Failures

- **Resource Already Exists**: This is a transient Firebase rollout error. Push a new commit to trigger a fresh build ID.
- **Build Timeout**: If the build fails during "Static Generation," ensure your `NEXT_PUBLIC_FIREBASE_*` variables are mapped to `BUILD` in `apphosting.yaml`.
- **Hydration Errors**: This platform uses `suppressHydrationWarning` on the body tag to handle browser extensions. Do not remove this.
