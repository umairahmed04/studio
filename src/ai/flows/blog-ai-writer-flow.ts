'use server';
/**
 * @fileOverview AI Blog Writer Flow.
 * Generates unique, high-quality, and AdSense-safe career content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BlogAiWriterInputSchema = z.object({
  keyword: z.string().describe('The primary SEO keyword.'),
  topic: z.string().describe('The main topic or title idea.'),
  targetAudience: z.string().optional().default('Job seekers and career professionals'),
});
export type BlogAiWriterInput = z.infer<typeof BlogAiWriterInputSchema>;

const BlogAiWriterOutputSchema = z.object({
  title: z.string().describe('SEO optimized headline.'),
  metaDescription: z.string().describe('150-160 character meta description.'),
  content: z.string().describe('Full blog post content in HTML format. Use h2, h3, p, and ul tags.'),
  tags: z.array(z.string()),
});
export type BlogAiWriterOutput = z.infer<typeof BlogAiWriterOutputSchema>;

export async function generateBlogArticle(input: BlogAiWriterInput): Promise<BlogAiWriterOutput> {
  return blogAiWriterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'blogAiWriterPrompt',
  input: {schema: BlogAiWriterInputSchema},
  output: {schema: BlogAiWriterOutputSchema},
  prompt: `You are an expert SEO Content Strategist and Career Blogger.
Generate a high-quality, human-like blog post for the topic: "{{{topic}}}".

SEO KEYWORD: {{{keyword}}}
AUDIENCE: {{{targetAudience}}}

RULES:
1. QUALITY: Content must be original, helpful, and insightful. Avoid generic fluff.
2. ADSENSE SAFE: Ensure the content is professional and safe for advertising.
3. STRUCTURE: Use HTML tags for structure (<h2>, <h3>, <p>, <ul>, <li>).
4. HUMAN-LIKE: Use an engaging, authoritative yet conversational tone.
5. LENGTH: Aim for at least 800 words of rich content.
6. SEO: Naturally weave the keyword "{{{keyword}}}" into the headline and first 100 words.

Return a structured JSON object.`,
});

const blogAiWriterFlow = ai.defineFlow(
  {
    name: 'blogAiWriterFlow',
    inputSchema: BlogAiWriterInputSchema,
    outputSchema: BlogAiWriterOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI Engine failed to generate article.');
      return output;
    } catch (error: any) {
      console.error("AI Blog Gen Error:", error);
      throw new Error(error.message || "Failed to generate blog content.");
    }
  }
);
