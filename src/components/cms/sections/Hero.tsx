'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface HeroProps {
  content: {
    heading?: string;
    subheading?: string;
    badge?: string;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    imageUrl?: string;
    showPremiumMockups?: boolean;
  };
}

export function CmsHero({ content }: HeroProps) {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden hero-gradient">
      <div className="container mx-auto px-4 relative z-10">
        <div className={content.showPremiumMockups ? "grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" : "text-center"}>
          <div className={content.showPremiumMockups ? "lg:col-span-5 text-center lg:text-left space-y-8" : "max-w-4xl mx-auto space-y-8"}>
            {content.badge && (
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                {content.badge}
              </Badge>
            )}
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 tracking-tight leading-[1.1]">
              {content.heading || 'Build ATS-Optimized CVs'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {content.subheading || 'Empowering your professional growth with AI-driven insights.'}
            </p>
            
            <div className={`flex flex-col sm:flex-row items-center gap-4 mb-16 ${!content.showPremiumMockups && 'justify-center'}`}>
              {content.primaryButtonText && (
                <Button size="lg" className="w-full sm:w-auto px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 group rounded-xl" asChild>
                  <Link href={content.primaryButtonUrl || '#'}>
                    {content.primaryButtonText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              {content.secondaryButtonText && (
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 h-14 text-lg font-bold rounded-xl bg-background/50 backdrop-blur" asChild>
                  <Link href={content.secondaryButtonUrl || '#'}>{content.secondaryButtonText}</Link>
                </Button>
              )}
            </div>
          </div>

          {content.showPremiumMockups ? (
            <div className="lg:col-span-7 relative flex items-center justify-center h-[500px] mt-12 lg:mt-0">
               {/* David Wilson (Center) */}
               <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-30 w-[300px] h-[440px] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-100 dark:border-white/5 overflow-hidden flex"
              >
                <div className="w-[35%] bg-[#0f172a] h-full p-4 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div className="h-1 w-full bg-zinc-800 rounded" />
                  <div className="h-1 w-2/3 bg-zinc-800 rounded" />
                  <div className="pt-4 space-y-2">
                    <div className="h-1 w-full bg-primary/40 rounded" />
                    <div className="h-1 w-full bg-primary/40 rounded" />
                  </div>
                </div>
                <div className="flex-1 p-5 space-y-4">
                   <div className="border-b pb-2">
                      <h4 className="text-sm font-black uppercase">David Wilson</h4>
                      <p className="text-[7px] text-primary font-bold uppercase">Software Engineer</p>
                   </div>
                   <div className="space-y-2">
                      <div className="h-1.5 w-full bg-muted rounded" />
                      <div className="h-1.5 w-3/4 bg-muted rounded" />
                   </div>
                </div>
              </motion.div>

              {/* Score Badge */}
              <div className="absolute top-0 right-0 z-40 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-200 dark:border-white/10">
                <div className="w-10 h-10 rounded-full border-4 border-green-500 flex items-center justify-center text-[10px] font-black">92%</div>
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-400">ATS Score</p>
                  <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} className="fill-green-600 text-white" /> Excellent
                  </p>
                </div>
              </div>
            </div>
          ) : content.imageUrl && (
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass overflow-hidden rounded-2xl border-white/10 shadow-2xl">
                <img src={content.imageUrl} alt="Hero Visual" className="w-full h-auto object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
