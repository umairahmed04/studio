'use server';
/**
 * @fileOverview AI Profile Photo Analysis Flow.
 * Evaluates professional photo quality and provides scoring/feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoInput = z.infer<typeof AnalyzePhotoInputSchema>;

const AnalyzePhotoOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('Overall quality score for a professional CV.'),
  label: z.string().describe('Readable quality label (e.g., Excellent, Good, Fair, Poor).'),
  suggestions: z.array(z.string()).describe('Actionable improvements for the photo.'),
  details: z.object({
    lighting: z.string(),
    background: z.string(),
    framing: z.string(),
    clarity: z.string(),
  }),
});
export type AnalyzePhotoOutput = z.infer<typeof AnalyzePhotoOutputSchema>;

export async function analyzeProfilePhoto(input: AnalyzePhotoInput): Promise<AnalyzePhotoOutput> {
  return analyzePhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePhotoPrompt',
  input: {schema: AnalyzePhotoInputSchema},
  output: {schema: AnalyzePhotoOutputSchema},
  prompt: `You are an expert professional branding coach and photographer.
Analyze this profile photo for use on a professional CV or LinkedIn profile.

Evaluate based on:
1. Image clarity and focus.
2. Lighting quality (avoid shadows on face, overexposure).
3. Background cleanliness (prefer neutral, non-distracting).
4. Professional appearance (attire, expression).
5. Framing (face centered, proper headshot crop).

Photo: {{media url=photoDataUri}}

Provide a score from 0-100 and specific suggestions for improvement if needed.`,
});

const analyzePhotoFlow = ai.defineFlow(
  {
    name: 'analyzePhotoFlow',
    inputSchema: AnalyzePhotoInputSchema,
    outputSchema: AnalyzePhotoOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI engine failed to analyze photo.');
      return output;
    } catch (error: any) {
      console.error("Photo Analysis Error:", error);
      throw new Error(error.message || "Failed to analyze photo quality.");
    }
  }
);
