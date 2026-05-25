'use server';
/**
 * @fileOverview AI CV Generator Flow.
 * Generates high-impact, ATS-optimized professional CV content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCvGeneratorInputSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  yearsOfExperience: z.number(),
  jobTitle: z.string(),
  skills: z.string().optional(),
  country: z.string().optional(),
  linkedinUrl: z.string().optional(),
});
export type AiCvGeneratorInput = z.infer<typeof AiCvGeneratorInputSchema>;

const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
});

const AiCvGeneratorOutputSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    summary: z.string(),
  }),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  certifications: z.array(z.string()).describe('List of relevant professional certifications or achievements.'),
});
export type AiCvGeneratorOutput = z.infer<typeof AiCvGeneratorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiCvGeneratorPrompt',
  input: {schema: AiCvGeneratorInputSchema},
  output: {schema: AiCvGeneratorOutputSchema},
  prompt: `You are an elite Executive Career Coach and ATS Specialist.
Your task is to generate a market-ready, professional CV for a candidate applying for the role of "{{{jobTitle}}}".

CONTEXT:
- Candidate Name: {{{fullName}}}
- Years of Experience: {{{yearsOfExperience}}}
- Target Industry: {{{jobTitle}}}
- Key Keywords to Include: {{{skills}}}
- Location: {{{country}}}

CORE RULES:
1. ATS OPTIMIZATION: Use high-frequency industry keywords found in top job descriptions for this role.
2. ACHIEVEMENT-ORIENTED: Every experience bullet point must follow the Google "X-Y-Z" formula (Accomplished [X] as measured by [Y], by doing [Z]).
3. SUMMARY: Write a high-impact, 3-4 sentence elevator pitch. Use "results-driven", "strategic", etc.
4. EXPERIENCE: Generate 3 realistic professional entries.
5. SKILLS: Provide 10 technical skills, 5 soft skills, and 5 industry tools.

Return a structured JSON matching the output schema.`,
});

const aiCvGeneratorFlow = ai.defineFlow(
  {
    name: 'aiCvGeneratorFlow',
    inputSchema: AiCvGeneratorInputSchema,
    outputSchema: AiCvGeneratorOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI CV engine failed to generate content.');
      
      output.personalInfo.fullName = input.fullName;
      output.personalInfo.email = input.email;
      output.personalInfo.phone = input.phone;
      output.personalInfo.location = input.country || output.personalInfo.location;

      return output;
    } catch (error: any) {
      console.error("AI CV Gen Error:", error);
      throw new Error(error.message || "Failed to generate AI CV.");
    }
  }
);

/**
 * PRODUCTION WRAPPER: Returns safe result object for Next.js 15 compatibility.
 */
export async function generateAiCv(input: AiCvGeneratorInput) {
  try {
    const data = await aiCvGeneratorFlow(input);
    return { success: true, data };
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return { success: false, error: error.message || "CV Generator encountered a server-side error." };
  }
}
