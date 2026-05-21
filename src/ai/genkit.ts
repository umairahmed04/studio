import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Production Genkit initialization.
 * Uses ONLY the provided environment variable for authentication.
 * No dependency on internal Studio session tokens.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z } from 'genkit';
