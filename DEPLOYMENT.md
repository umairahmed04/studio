# ATS Resume Scan - Production Deployment Guide

This document outlines the steps required to deploy the platform to a production environment (Scala Hosting, VPS, or Firebase).

## 1. Environment Configuration

Copy the `.env.example` file to `.env` and fill in the required credentials.

```bash
cp .env.example .env
```

### Required Keys:
- **GOOGLE_API_KEY**: Obtain from Google AI Studio.
- **Firebase Keys**: Found in your Firebase Project Settings.

## 2. Scala Hosting / Standalone Node.js Setup

This project is optimized for Scala Hosting using the included `server.js` entry point.

1. **Upload Files**: Upload the entire project directory to your server.
2. **Install Dependencies**:
   ```bash
   npm install --production
   ```
3. **Build the Project**:
   ```bash
   npm run build
   ```
4. **Start the Production Server**:
   The server is configured for cPanel/Passenger environments. Ensure your "Application Startup File" is set to `server.js`.
   ```bash
   npm run server
   ```

## 3. Firebase Deployment

If you are using Firebase App Hosting or standard Firebase Hosting:

1. **Firebase CLI**: Install the CLI and login.
2. **Deploy Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. **App Hosting**: Link your GitHub repository in the Firebase Console under the "App Hosting" tab.

## 4. Troubleshooting

- **Server Component Errors**: Ensure all `NEXT_PUBLIC_` variables are set in the hosting provider's environment settings panel.
- **AI Scanning Failures**: Check that `GOOGLE_API_KEY` is present in the server-side environment.
- **Direct URL Refresh (404)**: The `server.js` file handles routing. If using Apache, ensure `.htaccess` routes all traffic to the Node.js process.
