'use server';
/**
 * @fileOverview A Genkit flow to generate a professional and keyword-rich LinkedIn summary based on a user's resume.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const LinkedInSummaryGeneratorInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the user\'s resume.'),
});
export type LinkedInSummaryGeneratorInput = z.infer<typeof LinkedInSummaryGeneratorInputSchema>;

// Output Schema
const LinkedInSummaryGeneratorOutputSchema = z.object({
  linkedInSummary: z.string().describe('The generated professional and keyword-rich LinkedIn summary.'),
});
export type LinkedInSummaryGeneratorOutput = z.infer<typeof LinkedInSummaryGeneratorOutputSchema>;

// Prompt definition
const linkedInSummaryPrompt = ai.definePrompt({
  name: 'linkedInSummaryPrompt',
  input: {schema: LinkedInSummaryGeneratorInputSchema},
  output: {schema: LinkedInSummaryGeneratorOutputSchema},
  prompt: `You are an expert career coach and LinkedIn profile optimizer. Your task is to generate a professional and keyword-rich LinkedIn summary based on the provided resume text.

The summary should:
- Be concise (around 150-250 words).
- Highlight key skills, experience, and achievements.
- Include relevant industry keywords to attract recruiters.
- Be written in the first person.
- Conclude with a strong call to action or statement of career goals.

Resume Text:
{{{resumeText}}}

Generate the LinkedIn summary in a JSON object with a single key 'linkedInSummary'.`,
});

// Flow definition
const linkedInSummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'linkedInSummaryGeneratorFlow',
    inputSchema: LinkedInSummaryGeneratorInputSchema,
    outputSchema: LinkedInSummaryGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await linkedInSummaryPrompt(input);
      if (!output) {
        throw new Error('Failed to generate LinkedIn summary.');
      }
      return output;
    } catch (error: any) {
      console.error("LinkedIn Summary Error:", error);
      throw new Error(error.message || "Failed to generate LinkedIn summary. Check your API configuration.");
    }
  }
);

// Wrapper function
export async function generateLinkedInSummary(
  input: LinkedInSummaryGeneratorInput
): Promise<LinkedInSummaryGeneratorOutput> {
  return linkedInSummaryGeneratorFlow(input);
}
