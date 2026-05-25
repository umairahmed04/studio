import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Builder - Free Professional CV Maker 2026',
  description: 'Create a high-impact, recruiter-approved resume in minutes. Use our interactive AI builder and ATS-friendly templates to land more interviews.',
  keywords: ['AI resume builder', 'online CV maker', 'professional resume templates', 'ATS friendly CV'],
  openGraph: {
    title: 'AI Resume Builder | Create a Professional CV for Free',
    description: 'Choose from 20+ expert-designed templates and build your high-performance resume with real-time AI coaching.',
  }
};

export default function CvBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
