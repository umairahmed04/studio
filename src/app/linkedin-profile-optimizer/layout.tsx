import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkedIn Profile Audit - Free Social Presence Scanner',
  description: 'Get a professional audit of your LinkedIn profile. Our AI analyzes your headline, summary, and experience to boost your search visibility for recruiters.',
  keywords: ['LinkedIn optimization', 'profile audit', 'attract recruiters', 'LinkedIn headline generator'],
};

export default function LinkedInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
