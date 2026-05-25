import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Optimizer - Rewrite Bullet Points for Impact',
  description: 'Transform weak bullet points into powerful achievement statements. Our AI uses action verbs and quantifiable results to optimize your resume content.',
  keywords: ['resume optimizer', 'AI bullet point rewriter', 'CV optimization', 'achievement statements'],
};

export default function ResumeOptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
