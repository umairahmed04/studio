'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CTAProps {
  content: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export function CmsCTA({ content }: CTAProps) {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20 group">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
            {content.title || 'Land More Interviews Today'}
          </h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
            {content.description || 'Join 50,000+ job seekers who have successfully optimized their resumes with our AI tools.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-10 h-14 text-lg font-bold shadow-xl hover:scale-105 transition-transform" asChild>
              <Link href={content.buttonUrl || '/signup'}>{content.buttonText || 'Get Started Free'}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
