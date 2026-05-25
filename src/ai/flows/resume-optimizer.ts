'use server';
/**
 * @fileOverview AI Resume Content Optimizer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeOptimizerInputSchema = z.object({
  resumeContent: z
    .string()
    .describe('The current text content of the resume to be optimized.'),
  jobDescription: z
    .string()
    .optional()
    .describe('Optional: The job description to tailor towards.'),
});
export type ResumeOptimizerInput = z.infer<typeof ResumeOptimizerInputSchema>;

const ResumeOptimizerOutputSchema = z.object({
  optimizedResumeContent: z
    .string()
    .describe('The AI-improved and optimized resume content.'),
  improvementsSummary: z
    .string()
    .describe('A summary explaining the key improvements.'),
});
export type ResumeOptimizerOutput = z.infer<typeof ResumeOptimizerOutputSchema>;

const resumeOptimizerPrompt = ai.definePrompt({
  name: 'resumeOptimizerPrompt',
  input: {schema: ResumeOptimizerInputSchema},
  output: {schema: ResumeOptimizerOutputSchema},
  prompt: `You are an expert resume optimizer. 
Rewrite bullet points for high impact and quantify achievements.

---START OF RESUME CONTENT---
{{{resumeContent}}}
---END OF RESUME CONTENT---

{{#if jobDescription}}
---START OF JOB DESCRIPTION---
{{{jobDescription}}}
---END OF JOB DESCRIPTION---
{{/if}}

Focus on quantifiable results and action verbs.`,
});

const resumeOptimizerFlow = ai.defineFlow(
  {
    name: 'resumeOptimizerFlow',
    inputSchema: ResumeOptimizerInputSchema,
    outputSchema: ResumeOptimizerOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await resumeOptimizerPrompt(input);
      if (!output) throw new Error('AI engine returned empty response.');
      return output;
    } catch (error: any) {
      console.error("Resume Optimizer Flow Error:", error);
      throw new Error(error.message || "Resume optimization failed.");
    }
  }
);

/**
 * PRODUCTION WRAPPER: Returns safe result object for Next.js 15 compatibility on private hosting.
 */
export async function optimizeResume(input: ResumeOptimizerInput) {
  try {
    const data = await resumeOptimizerFlow(input);
    return { success: true, data };
  } catch (error: any) {
    console.error("Optimize Flow Error:", error);
    return { success: false, error: error.message || "AI Optimization engine encountered a server error." };
  }
}
