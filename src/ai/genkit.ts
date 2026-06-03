import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Build-Safe Genkit initialization.
 * 
 * Logic: The application must be able to initialize during the build phase
 * even if environment variables are not yet present in the App Hosting builder.
 */
const apiKey = process.env.GOOGLE_API_KEY;

// Use the provided production key as a fallback if the environment variable is missing during build.
const safeKey = apiKey || 'AIzaSyBgPeQKNFrgI0GHg013SKNzk4CCF10e1bU';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: safeKey,
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z } from 'genkit';
