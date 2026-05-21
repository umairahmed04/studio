'use server';
/**
 * @fileOverview AI agent that compares a user's resume with a job description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const JobDescriptionMatcherInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the user's resume."),
  jobDescriptionText: z.string().describe('The full text content of the job description.'),
});
export type JobDescriptionMatcherInput = z.infer<typeof JobDescriptionMatcherInputSchema>;

const JobDescriptionMatcherOutputSchema = z.object({
  matchPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('A percentage score (0-100) indicating compatibility.'),
  matchedKeywords: z
    .array(z.string())
    .describe('Keywords found in both.'),
  missingKeywords: z
    .array(z.string())
    .describe('Keywords from job description missing from resume.'),
  missingSkills: z
    .array(z.string())
    .describe('Skills mentioned in job description missing from resume.'),
  optimizationSuggestions: z
    .array(z.string())
    .describe('Actionable suggestions to improve matching.'),
});
export type JobDescriptionMatcherOutput = z.infer<typeof JobDescriptionMatcherOutputSchema>;

const prompt = ai.definePrompt({
  name: 'jobDescriptionMatcherPrompt',
  input: { schema: JobDescriptionMatcherInputSchema },
  output: { schema: JobDescriptionMatcherOutputSchema },
  prompt: `You are an expert ATS advisor. Compare the provided resume and job description.

Resume:
---
{{{resumeText}}}
---

Job Description:
---
{{{jobDescriptionText}}}
---`,
});

const jobDescriptionMatcherFlow = ai.defineFlow(
  {
    name: 'jobDescriptionMatcherFlow',
    inputSchema: JobDescriptionMatcherInputSchema,
    outputSchema: JobDescriptionMatcherOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('Failed to generate matching analysis.');
      return output;
    } catch (error: any) {
      console.error("Job Matcher Flow Error:", error);
      throw new Error(error.message || "Matching analysis failed. Check your API key configuration.");
    }
  }
);

export async function jobDescriptionMatcher(
  input: JobDescriptionMatcherInput
): Promise<JobDescriptionMatcherOutput> {
  return jobDescriptionMatcherFlow(input);
}
