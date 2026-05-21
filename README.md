# 🛑 FIX: Disappearing GitHub Popup 🚀

**If the "Publish to GitHub" button opens a window that hides instantly, follow these steps exactly.**

## 1️⃣ STEP 1: Fix Browser Blocking
Look at the top right of your browser's address bar. 
- If you see a **red icon or "x"**, your browser is blocking GitHub.
- Click it and select **"Always allow popups from this site"**.
- **REFRESH THE PAGE** (Ctrl+R / Cmd+R) after doing this.

## 2️⃣ STEP 2: Clear Local Connection
Run this in your terminal to delete old cached tokens:
```bash
npm run repo:nuke
```

## 3️⃣ STEP 3: Reconnect
1. Click the **"Source Control"** icon in the left sidebar.
2. Click the blue **"Publish to GitHub"** button.
3. Because you allowed popups and nuked the old state, the login window will now stay open correctly.

---

# 🔑 FIX: Firebase Unauthorized Domain Error

If you see a `FirebaseError: auth/unauthorized-domain` error during Google Login:

1. Copy your current browser URL domain (e.g., `9002-....workstations.google.com`).
2. Go to [Firebase Console](https://console.firebase.google.com/).
3. Select your project.
4. Go to **Authentication** > **Settings** > **Authorized Domains**.
5. Click **Add Domain** and paste your workstation domain.
6. Save and try logging in again.

---

## 🌐 Deployment
Once published:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Link your **New GitHub Repository** in the App Hosting section.
