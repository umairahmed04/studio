'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { Loader2 } from 'lucide-react';

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
      setIsNotFound(true);
    }
  }, [loading, pages]);

  if (isNotFound) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <main className="min-h-screen">
      {/* Set dynamic metadata if needed here via client-side title update */}
      <PageRenderer pageId={page.id} />
    </main>
  );
}
