import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';

export const metadata: Metadata = {
  title: 'ATSResumeScan | Free AI ATS Resume Checker & CV Optimizer',
  description: 'Instantly check your ATS resume score, optimize with AI, and beat recruitment bots. The #1 free tool for ATS-friendly resume building and keyword optimization.',
  keywords: 'ATS resume checker, resume score, AI resume builder, beat ATS, resume optimization, CV builder, free resume scan',
  metadataBase: new URL('https://atsresumescan.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ATSResumeScan | Beat the Recruitment Bots with AI',
    description: 'Optimize your resume for ATS systems in seconds. Free score breakdown and AI-powered improvements.',
    type: 'website',
    url: 'https://atsresumescan.com',
    siteName: 'ATSResumeScan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATSResumeScan | AI Resume Optimization',
    description: 'Stop getting rejected by bots. Check your ATS score now.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ATSResumeScan",
    "url": "https://atsresumescan.com",
    "logo": "https://atsresumescan.com/icon.png",
    "description": "Professional AI-powered ATS resume checker and CV optimization platform.",
    "sameAs": [
      "https://twitter.com/atsresumescan",
      "https://linkedin.com/company/atsresumescan"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <AnalyticsTracker />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
