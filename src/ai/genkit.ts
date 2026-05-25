import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Production Genkit initialization.
 * Uses ONLY the provided environment variable for authentication.
 * 
 * Functional Logic: The app will initialize even if the key is missing
 * to prevent full-site crashes, but AI features will return descriptive errors.
 */
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey && typeof window === 'undefined') {
  console.error("CRITICAL CONFIG ERROR: GOOGLE_API_KEY is missing in the server environment. AI features (ATS Scan, Optimizer) will fail.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey || 'MISSING_KEY', // Prevents crash during registration
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z } from 'genkit';
