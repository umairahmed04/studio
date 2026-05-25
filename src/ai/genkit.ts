import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Production Genkit initialization.
 * Uses ONLY the provided environment variable for authentication.
 */
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey && typeof window === 'undefined') {
  console.warn("CRITICAL: GOOGLE_API_KEY is missing in the server environment. AI features will fail.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z } from 'genkit';
