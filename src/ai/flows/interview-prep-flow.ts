'use server';
/**
 * @fileOverview AI Interview Preparation Flow.
 * Handles question generation and real-time answer analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  jobTitle: z.string(),
  experienceLevel: z.string(),
  resumeContent: z.string().optional(),
  jobDescription: z.string().optional(),
  type: z.string().default('HR'),
});

const QuestionSchema = z.object({
  question: z.string(),
  category: z.string().describe('e.g. Technical, Behavioral, Situational'),
  context: z.string().describe('Why this question is being asked.'),
  modelAnswer: z.string().describe('A high-quality sample answer.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).length(5),
});

export async function generateInterviewQuestions(input: z.infer<typeof GenerateQuestionsInputSchema>) {
  const {output} = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    input: input,
    output: {schema: GenerateQuestionsOutputSchema},
    prompt: `You are an expert recruiter and technical interviewer.
Generate 5 high-quality interview questions for the role of "{{{jobTitle}}}" at "{{{experienceLevel}}}" level.

INTERVIEW TYPE: {{{type}}}

CONTEXTUAL DATA:
{{#if resumeContent}}RESUME: {{{resumeContent}}}{{/if}}
{{#if jobDescription}}JOB DESCRIPTION: {{{jobDescription}}}{{/if}}

CORE RULES:
1. If type is TECHNICAL: Focus on deep domain knowledge and problem-solving.
2. If type is BEHAVIORAL: Use situational prompts requiring the STAR method.
3. Every question must include a sample MODEL ANSWER that is ATS-friendly and professional.
4. Ensure questions are challenging yet realistic for the seniority level.`,
  });
  return output!;
}

const AnalyzeAnswerInputSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  category: z.string(),
});

const AnalyzeAnswerOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().describe('Specific coaching feedback.'),
  improvement: z.string().describe('How to make this answer 10x better.'),
  starMethodCompliance: z.boolean(),
});

export async function analyzeInterviewAnswer(input: z.infer<typeof AnalyzeAnswerInputSchema>) {
  const {output} = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    input: input,
    output: {schema: AnalyzeAnswerOutputSchema},
    prompt: `You are an AI Career Coach. Analyze the user's answer to this interview question.

QUESTION: {{{question}}} (Category: {{{category}}})
USER ANSWER: {{{userAnswer}}}

REQUIREMENTS:
1. Be critical yet encouraging.
2. Check for the STAR method (Situation, Task, Action, Result).
3. Provide a score from 0-100 based on impact, clarity, and professionalism.
4. Suggest exact phrases to improve communication.`,
  });
  return output!;
}

const FinalReportInputSchema = z.object({
  jobTitle: z.string(),
  sessionData: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    analysis: AnalyzeAnswerOutputSchema
  }))
});

const FinalReportOutputSchema = z.object({
  overallScore: z.number(),
  communicationScore: z.number(),
  technicalScore: z.number(),
  hrReadinessScore: z.number(),
  summary: z.string(),
  topStrengths: z.array(z.string()),
  criticalFixes: z.array(z.string()),
});

export async function generateInterviewReport(input: z.infer<typeof FinalReportInputSchema>) {
  const {output} = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    input: input,
    output: {schema: FinalReportOutputSchema},
    prompt: `You are an Executive Branding Coach. Review the entire interview session for "{{{jobTitle}}}".

SESSION SUMMARY:
{{#each sessionData}}
Q: {{{this.question}}}
A: {{{this.answer}}}
Score: {{{this.analysis.score}}}
{{/each}}

Generate a final high-performance report with quantified scores and a roadmap for improvement.`,
  });
  return output!;
}