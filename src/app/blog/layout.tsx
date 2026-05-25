import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career Resources & ATS Strategy Blog | Expert Advice 2026',
  description: 'Master the science of modern hiring with our expert guides on ATS resume formatting, LinkedIn strategy, and high-performance job searching.',
  keywords: ['career blog', 'resume tips 2026', 'ATS optimization guides', 'interview advice'],
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
