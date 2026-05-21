# ATS Resume Scan - Ultimate Master Development Blueprint (v27.0)

**Pasting this document into a new AI session will recreate the entire project with 100% accuracy, including all design, logic, security rules, and standalone AI features.**

---

## 1. Core Mission & Technical Stack
- **Objective:** Build a premium SaaS platform for AI-powered resume optimization, ATS compliance auditing, and LinkedIn branding.
- **Framework:** Next.js 15 (App Router, TypeScript).
- **Backend:** Firebase (Authentication, Firestore).
- **AI Engine:** Standalone Genkit v1.x using Gemini 2.5 Flash.
- **Theme:** Forced Light Mode (Professional Indigo/White).

## 2. Design System: "Silicon Valley Executive"
- **Colors:** Primary Indigo (#3b82f6), Accent Purple (#a855f7), Clean White (#ffffff).
- **Aesthetics:** Glassmorphism (`backdrop-blur-xl`), Indigo-to-Purple text gradients. High-contrast professional typography.
- **Favicon:** Dynamic indigo rounded square with a white scan frame (generated via `icon.tsx`).

## 3. Database & Security
- **Firestore Schema:** 
  - `/users/{userId}`: Profiles with `role`.
  - `/users/{userId}/resumes/{resumeId}`: Full resume objects.
  - `/users/{userId}/scans/{scanId}`: Historical ATS results.
- **Security Rules:** 
  - Nested security: Users read/write ONLY their own resumes and scans.
  - Helper functions: `isSignedIn()`, `isOwner(userId)`, `isAdmin()`.

## 4. Implementation Logic
- **Genkit 1.x:** Standard production initialization using `GOOGLE_API_KEY`.
- **AI Model:** Exclusively uses `gemini-2.5-flash` for high-speed, cost-effective analysis.
- **Authentication:** Must provide a valid `GOOGLE_API_KEY` for AI features and `NEXT_PUBLIC_FIREBASE_API_KEY` for auth features.
- **Forced Light Theme:** Set `ThemeProvider` to `defaultTheme="light"` and `enableSystem={false}` in `src/app/layout.tsx`.
- **Zero Session Dependency:** The system is fully standalone and does not rely on specific IDE session tokens or hard-refresh logic.

## 5. Deployment
- **API Keys:** Ensure all Firebase credentials and `GOOGLE_API_KEY` are set in the hosting provider's environment settings.
- **Firebase:** Standard Firebase Client SDK usage with optimized Firestore queries and real-time listeners.

---
**END OF MASTER BLUEPRINT**
