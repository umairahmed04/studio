
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview High-Performance Dynamic Content Hub.
 * Fetches and renders dynamic CMS pages by their unique SEO-friendly slugs.
 * Optimized with real-time listeners for instant synchronization.
 */
export default function DynamicCmsPage() {
  const { slug } = useParams();
  const db = useFirestore();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!db || !slug) return;

    // Use a real-time listener for instant CMS sync
    const q = query(
      collection(db, 'pages'), 
      where('slug', '==', slug), 
      where('status', '==', 'published'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setPage(null);
        setError(true);
      } else {
        setPage({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
        setError(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("CMS Fetch Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, slug]);

  useEffect(() => {
    if (page?.seo?.title || page?.title) {
      document.title = `${page.seo?.title || page.title} | ATSResumeScan`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.seo?.description || '');
    }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Site Architecture...</p>
      </div>
    );
  }

  if (error || !page) {
    notFound();
  }

  return (
    <main className="min-h-screen animate-in fade-in duration-700">
      <PageRenderer pageId={page.id} />
    </main>
  );
}
