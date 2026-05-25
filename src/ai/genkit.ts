import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Build-Safe Genkit initialization.
 * 
 * Logic: The application must be able to initialize during the build phase
 * even if environment variables are not yet present. 
 * AI features will perform a runtime check for the API key.
 */
const apiKey = process.env.GOOGLE_API_KEY;

// Use a placeholder if the key is missing to prevent build-time crashes.
// The runtime flows have internal error handling for invalid keys.
const safeKey = apiKey || 'BUILD_TIME_PLACEHOLDER';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: safeKey,
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z } from 'genkit';
