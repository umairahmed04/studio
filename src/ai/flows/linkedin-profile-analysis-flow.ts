'use server';
/**
 * @fileOverview A Genkit flow for analyzing and optimizing LinkedIn profiles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LinkedInProfileAnalysisInputSchema = z.object({
  profileUrl: z.string().optional().describe('The URL of the LinkedIn profile.'),
  profileContent: z.string().describe('The text content of the LinkedIn profile (About, Experience, etc.).'),
});
export type LinkedInProfileAnalysisInput = z.infer<typeof LinkedInProfileAnalysisInputSchema>;

const AnalysisSectionSchema = z.object({
  category: z.string().describe('Section name (e.g., Headline, About, Experience).'),
  score: z.number().min(0).max(100),
  feedback: z.string().describe('Specific feedback for this section.'),
  suggestions: z.array(z.string()).describe('Actionable tips to improve this section.'),
});

const LinkedInProfileAnalysisOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().describe('A high-level summary of the profile quality.'),
  sections: z.array(AnalysisSectionSchema),
  topKeywords: z.array(z.string()).describe('Keywords found or recommended for the industry.'),
});
export type LinkedInProfileAnalysisOutput = z.infer<typeof LinkedInProfileAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'linkedinProfileAnalysisPrompt',
  input: {schema: LinkedInProfileAnalysisInputSchema},
  output: {schema: LinkedInProfileAnalysisOutputSchema},
  prompt: `You are an expert LinkedIn profile optimizer and executive branding coach. 
Analyze the following profile content and provide a report.

Input Profile Content:
---
{{{profileContent}}}
---
{{#if profileUrl}}Profile URL: {{{profileUrl}}}{{/if}}

Generate a detailed optimization report focusing on recruiters' perspectives.`,
});

const linkedinProfileAnalysisFlow = ai.defineFlow(
  {
    name: 'linkedinProfileAnalysisFlow',
    inputSchema: LinkedInProfileAnalysisInputSchema,
    outputSchema: LinkedInProfileAnalysisOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI engine returned empty response.');
      return output;
    } catch (error: any) {
      console.error("LinkedIn Analysis Error:", error);
      throw new Error(error.message || "Profile analysis failed. Please verify your GOOGLE_API_KEY environment variable.");
    }
  }
);

export async function analyzeLinkedInProfile(input: LinkedInProfileAnalysisInput): Promise<LinkedInProfileAnalysisOutput> {
  return linkedinProfileAnalysisFlow(input);
}
