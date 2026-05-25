import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Description Matcher - Optimize CV for Specific Roles',
  description: 'Compare your resume against any job posting. Identify missing skills and keywords to ensure you rank at the top of the ATS for your dream job.',
  keywords: ['job matcher', 'keyword alignment', 'tailor resume to job', 'ATS ranking'],
};

export default function JobMatcherLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
