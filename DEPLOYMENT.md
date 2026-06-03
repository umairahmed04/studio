# ATS Resume Scan - Production Deployment Guide

This document outlines the steps required to deploy the platform to a production environment (Scala Hosting, VPS, or Firebase).

## 1. Environment Configuration

The application requires two sets of keys to function:

### A. Google AI Studio Key (`GOOGLE_API_KEY`)
- **What it does**: Powers all Gemini AI features (ATS scanning, optimization).
- **Where to get it**: [Google AI Studio](https://aistudio.google.com/).
- **Note**: Keep this secret. Do not expose it in the frontend.

### B. Firebase Web Config (`NEXT_PUBLIC_FIREBASE_*`)
- **What it does**: Connects the frontend to your database and authentication.
- **Where to get it**: [Firebase Console](https://console.firebase.google.com/) > Project Settings > Web App.

---

## 2. Scala Hosting / Standalone Node.js Setup

This project is optimized for Standalone Node.js environments using the included `server.js`.

1. **Setup Environment**:
   - Copy `.env.example` to `.env` on your server.
   - Fill in your actual production keys.

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

## 3. Firebase App Hosting Rollout

If you are using Firebase App Hosting:

1. **Secrets Management**:
   - Go to **App Hosting** in the Firebase Console.
   - Select your backend > **Settings > Environment Variables**.
   - Add all keys from `.env.example`.
   - **Important**: Ensure `GOOGLE_API_KEY` is marked as a **Secret** if you are using Cloud Secret Manager.

2. **Deploy Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 4. Troubleshooting Build Failures

- **Build Timeout**: If the build fails during "Static Generation," ensure your `NEXT_PUBLIC_FIREBASE_*` variables are set in the `BUILD` environment of the App Hosting console.
- **Image Errors**: Ensure `atsresumescan.com` is verified in your Firebase project to allow optimized image serving.
