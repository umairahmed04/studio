import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker - Scan Your CV Score Now',
  description: 'Instantly scan your resume for ATS compatibility. Our AI identifies keyword gaps, structural errors, and provides a roadmap to help you beat recruitment bots.',
  keywords: ['ATS scan', 'resume score', 'CV checker', 'keyword optimization', 'beat the bots'],
  openGraph: {
    title: 'Free AI ATS Resume Checker | Scan Your CV Score',
    description: 'Find out why your resume is getting rejected. Get a detailed ATS audit and keyword analysis in seconds.',
  }
};

export default function AtsCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
