
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview High-Performance Dynamic Content Hub.
 * Fetches and renders dynamic CMS pages by their unique SEO-friendly slugs.
 */
export default function DynamicCmsPage() {
  const { slug } = useParams();
  const db = useFirestore();
  const [isNotFound, setIsNotFound] = useState(false);

  const pageQuery = useMemo(() => {
    if (!db || !slug) return null;
    return query(
      collection(db, 'pages'), 
      where('slug', '==', slug), 
      where('status', '==', 'published'),
      limit(1)
    );
  }, [db, slug]);

  const { data: pages, loading } = useCollection(pageQuery);
  const page = pages?.[0] as any;

  useEffect(() => {
    if (!loading && (!pages || pages.length === 0)) {
      // Small delay to prevent layout flicker on fast loads
      const timer = setTimeout(() => setIsNotFound(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, pages]);

  useEffect(() => {
    if (page?.seo?.title || page?.title) {
      document.title = `${page.seo?.title || page.title} | ATSResumeScan`;
      
      // Update basic meta tags client-side for immediate feedback
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.seo?.description || '');
    }
  }, [page]);

  if (isNotFound) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Site Architecture...</p>
      </div>
    );
  }

  if (!page) return null;

  return (
    <main className="min-h-screen animate-in fade-in duration-700">
      <PageRenderer pageId={page.id} />
    </main>
  );
}
