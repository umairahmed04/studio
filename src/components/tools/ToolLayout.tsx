import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, badge, children }: ToolLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 md:py-20 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {badge && (
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              {badge}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
