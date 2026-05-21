'use server';
/**
 * @fileOverview A Genkit flow for generating personalized cover letters.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  resumeContent: z.string().describe('The full content of the applicant\'s resume.'),
  jobDescription: z.string().describe('The full content of the job description for the target role.'),
  roleTitle: z.string().describe('The title of the role the applicant is applying for.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated personalized cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

const prompt = ai.definePrompt({
  name: 'coverLetterGeneratorPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert career coach specializing in cover letters.
Highlight the applicant's relevant skills and experience from their resume that directly align with the job description.

Resume Content:
---
{{{resumeContent}}}
---

Job Description:
---
{{{jobDescription}}}
---

Role Title: {{{roleTitle}}}`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI engine returned empty response.');
      return output;
    } catch (error: any) {
      console.error("Cover Letter Generator Error:", error);
      throw new Error(error.message || "Failed to generate cover letter. Please check your API key.");
    }
  }
);

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}
