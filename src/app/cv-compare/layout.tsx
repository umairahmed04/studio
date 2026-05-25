import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Compare & Match - Side-by-Side Resume Analysis',
  description: 'Upload two resumes to identify critical keyword gaps and competitive advantages. Perfect for tailoring your CV to specific job descriptions.',
  keywords: ['CV comparison', 'resume matching', 'keyword gap analysis', 'job description matcher'],
};

export default function CvCompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
