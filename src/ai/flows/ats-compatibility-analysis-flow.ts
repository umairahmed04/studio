'use server';
/**
 * @fileOverview Optimized ATS Resume Compatibility Analysis Flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsCompatibilityAnalysisInputSchema = z.object({
  resumeContent: z.string().describe('The full text content of the resume (cvA).'),
  comparisonContent: z.string().optional().describe('Optional comparison CV, job description, or industry profile (cvB).'),
  mode: z.string().default('same_industry').describe('Analysis mode.'),
});
export type AtsCompatibilityAnalysisInput = z.infer<typeof AtsCompatibilityAnalysisInputSchema>;

const SectionFeedbackSchema = z.object({
  summary: z.string(),
  experience: z.string(),
  skills: z.string(),
  education: z.string(),
  projects: z.string(),
});

const AtsCompatibilityAnalysisOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('Overall Score (0-100) based on ATS compatibility, skills match, and clarity.'),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missing_skills: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  found_keywords: z.array(z.string()).describe('Keywords actually found in the resume for highlighting.'),
  section_feedback: SectionFeedbackSchema,
  recommendations: z.array(z.string()),
  final_action_plan: z.array(z.string()),
});
export type AtsCompatibilityAnalysisOutput = z.infer<typeof AtsCompatibilityAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'atsCompatibilityAnalysisPrompt',
  input: {schema: AtsCompatibilityAnalysisInputSchema},
  output: {schema: AtsCompatibilityAnalysisOutputSchema},
  prompt: `You are an expert AI CV/ATS analyst for a resume optimization platform.

Task:
Analyze the user CV (cvA) against the provided target or a high-tier industry standard and generate improvement insights.

Analysis Mode: {{{mode}}}

If comparison content is provided:
---
{{{comparisonContent}}}
---

Resume Content:
---
{{{resumeContent}}}
---

📥 MODE LOGIC:
- If mode is SAME_INDUSTRY: side-by-side match.
- If mode is INDUSTRY_SWITCH: focus on transferable skills.

🧠 REQUIREMENTS:
Return valid JSON with: score, strengths, weaknesses, missing_skills, missing_keywords, found_keywords, section_feedback, recommendations, final_action_plan.`,
});

const atsCompatibilityAnalysisFlow = ai.defineFlow(
  {
    name: 'atsCompatibilityAnalysisFlow',
    inputSchema: AtsCompatibilityAnalysisInputSchema,
    outputSchema: AtsCompatibilityAnalysisOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI engine returned empty response.');
      return output;
    } catch (error: any) {
      console.error("ATS Analysis Flow Error:", error);
      throw new Error(error.message || "AI Analysis failed.");
    }
  }
);

/**
 * PRODUCTION WRAPPER: Avoids Next.js 15 Server Components render error by returning a safe object.
 */
export async function atsCompatibilityAnalysis(input: AtsCompatibilityAnalysisInput) {
  try {
    const data = await atsCompatibilityAnalysisFlow(input);
    return { success: true, data };
  } catch (error: any) {
    console.error("Production Server Action Error:", error);
    return { success: false, error: error.message || "Internal AI Server Error" };
  }
}
