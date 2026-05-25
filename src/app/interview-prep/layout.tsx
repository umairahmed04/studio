import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Interview Preparation - Real-Time Voice Practice',
  description: 'Practice high-stakes interviews with our AI coach. Get real-time feedback on your answers using the STAR method to boost your confidence.',
  keywords: ['interview prep', 'AI career coach', 'STAR method practice', 'behavioral interview'],
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
