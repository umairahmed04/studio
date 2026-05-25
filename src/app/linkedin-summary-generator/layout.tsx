import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkedIn Summary Generator - AI Personal Bio Creator',
  description: 'Create a professional, keyword-rich LinkedIn "About" section in seconds. Designed to highlight your expertise and attract hiring managers.',
  keywords: ['LinkedIn summary AI', 'about section generator', 'personal branding', 'professional bio'],
};

export default function LinkedInSummaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
