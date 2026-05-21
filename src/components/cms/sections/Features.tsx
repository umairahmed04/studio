'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Zap, Target, Sparkles, ShieldCheck, Search } from 'lucide-react';

interface FeatureItem {
  title: string;
  desc: string;
  icon?: string;
}

interface FeaturesProps {
  content: {
    title?: string;
    description?: string;
    items?: FeatureItem[];
  };
}

const ICON_MAP: Record<string, any> = {
  zap: Zap,
  target: Target,
  sparkles: Sparkles,
  shield: ShieldCheck,
  search: Search,
  check: CheckCircle2,
};

export function CmsFeatures({ content }: FeaturesProps) {
  const items = content.items || [
    { title: 'AI Analysis', desc: 'Deep structural scan of your professional documents.', icon: 'zap' },
    { title: 'Keyword Match', desc: 'Identify critical gaps in your target industry keywords.', icon: 'target' },
    { title: 'Auto-Rewrite', desc: 'Transform bullet points into high-impact statements.', icon: 'sparkles' },
  ];

  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">{content.title || 'Powerful AI Toolkit'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{content.description || 'Everything you need to optimize your job search and stand out.'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon || 'check'] || CheckCircle2;
            return (
              <Card key={i} className="hover:shadow-xl transition-all duration-300 border-white/5 hover:-translate-y-1 group bg-card/50 backdrop-blur">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
