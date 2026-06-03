# ATS Resume Scan - Production Deployment Guide

This document outlines the steps required to deploy the platform to a production environment (Firebase App Hosting or Standalone Node.js).

## 1. Environment Configuration

The application requires two sets of keys to function:

### A. Google AI Studio Key (`GOOGLE_API_KEY`)
- **What it does**: Powers all Gemini AI features (ATS scanning, optimization).
- **Where to get it**: [Google AI Studio](https://aistudio.google.com/).
- **Note**: Keep this secret. Do not expose it in the frontend.

### B. Firebase Web Config (`NEXT_PUBLIC_FIREBASE_*`)
- **What it does**: Connects the frontend to your database and authentication.
- **Where to get it**: [Firebase Console](https://console.firebase.google.com/) > Project Settings > Web App.
- **Finding the Database URL**: Inside your Firebase Web App config snippet, look for `databaseURL`. It usually looks like `https://your-project-id-default-rtdb.firebaseio.com`.

---

## 2. Firebase App Hosting Setup (Recommended)

1. **Secrets Management**:
   - Go to **App Hosting** in the Firebase Console.
   - Select your backend > **Settings > Environment Variables**.
   - Add the following keys from your Firebase config and Google AI Studio:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
     - `GOOGLE_API_KEY` (Mark this as a **Secret**)

2. **Deploy Rules**:
   - Ensure your local `firestore.rules` are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 3. Scala Hosting / Standalone Node.js Setup

This project is optimized for Standalone Node.js environments using the included `server.js`.

1. **Setup Environment**:
   - Create a `.env` file on your server.
   - Fill in your actual production keys (refer to your Firebase Console).

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

- **Build Timeout**: If the build fails during "Static Generation," ensure your `NEXT_PUBLIC_FIREBASE_*` variables are set in the `BUILD` environment of the App Hosting console.
- **Hydration Errors**: This platform uses `suppressHydrationWarning` on the body tag to handle browser extensions. Do not remove this.
