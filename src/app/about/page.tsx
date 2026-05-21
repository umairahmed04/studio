'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, ShieldCheck, Heart, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview About Us Page with dynamic CMS prioritization.
 * If a CMS page with slug "about" exists and is published, it overrides the static layout.
 */
export default function AboutPage() {
  const db = useFirestore();

  const aboutQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'pages'), 
      where('slug', '==', 'about'), 
      where('status', '==', 'published'),
      limit(1)
    );
  }, [db]);

  const { data: cmsPages, loading } = useCollection(aboutQuery);
  const cmsPage = cmsPages?.[0];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // 1. If CMS Content exists, prioritize it
  if (cmsPage) {
    return <PageRenderer pageId={cmsPage.id} />;
  }

  // 2. Fallback to the High-Tier Professional Static Layout
  return (
    <ToolLayout 
      title="Leveling the Recruitment Playing Field" 
      description="We're on a mission to empower every job seeker with the same high-tier AI technology used by Fortune 500 recruiters."
      badge="Our Mission"
    >
      <div className="space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-headline font-bold">The Problem with Modern Hiring</h2>
            <p className="text-muted-foreground leading-relaxed">
              Today, over 95% of major companies use <strong className="text-foreground">Applicant Tracking Systems (ATS)</strong> to filter candidates. Unfortunately, even the most qualified candidates are often rejected because their resumes aren't formatted for these bots.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At <strong className="text-foreground">ATSResumeScan</strong>, we believe that your career shouldn't be limited by a software algorithm. We've built an AI-first platform that audits your resume exactly like a bot would, providing the transparency you need to succeed.
            </p>
            <div className="pt-4">
              <Link href="/ats-resume-checker" className="text-primary font-bold inline-flex items-center gap-2 group">
                Try our free ATS Scanner <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="aspect-square relative rounded-3xl overflow-hidden glass border-white/5">
            <img 
              src="https://picsum.photos/seed/team/800/800" 
              alt="ATSResumeScan Team Collaboration"
              className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
              data-ai-hint="Collaboration team"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <AboutStat icon={<Users />} title="50k+" subtitle="Successful Users" />
          <AboutStat icon={<Target />} title="92%" subtitle="Higher Match Rate" />
          <AboutStat icon={<ShieldCheck />} title="100%" subtitle="ATS Compatibility" />
          <AboutStat icon={<Heart />} title="Free" subtitle="Mission-Led Scanning" />
        </div>

        <section className="text-center space-y-12 bg-primary/5 py-16 rounded-3xl border border-primary/10">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-headline font-bold">Rooted in Core Values</h2>
            <p className="text-sm text-muted-foreground">Transparency, Accessibility, and Innovation are at the heart of everything we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto px-8">
            <div className="space-y-3">
              <h4 className="font-bold">100% Transparency</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">We show you exactly what's wrong with your resume—no secrets, just actionable data.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold">Global Accessibility</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">High-tier career tools should be accessible to everyone, regardless of their budget or location.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold">Continuous Innovation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">We constantly update our AI models to match the latest recruitment software updates.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}

function AboutStat({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <Card className="glass text-center p-8 border-white/5">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-headline font-bold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{subtitle}</p>
    </Card>
  );
}
