'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { CmsHero } from './sections/Hero';
import { CmsAbout } from './sections/About';
import { CmsFeatures } from './sections/Features';
import { CmsFAQ } from './sections/FAQ';
import { CmsCTA } from './sections/CTA';
import { Loader2 } from 'lucide-react';

const SECTION_COMPONENTS: Record<string, any> = {
  hero: CmsHero,
  about: CmsAbout,
  features: CmsFeatures,
  faq: CmsFAQ,
  cta: CmsCTA,
  custom: ({ content }: any) => (
    <div className="py-20 container mx-auto px-4 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.body }} />
  ),
};

export function PageRenderer({ pageId }: { pageId: string }) {
  const db = useFirestore();

  const sectionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'pages', pageId, 'sections'), orderBy('order', 'asc'));
  }, [db, pageId]);

  const { data: sections, loading } = useCollection(sectionsQuery);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Dynamic Content...</p>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {sections.map((section: any) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content || {}} style={section.style || {}} />;
      })}
    </div>
  );
}
