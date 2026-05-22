'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export default function BlogPostPage() {
  const { id } = useParams(); // 'id' here is the slug from the URL
  const db = useFirestore();

  // Functional Logic Upgrade: Fetch by Slug for SEO-friendly URLs
  const postQuery = useMemo(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'blog_posts'), 
      where('slug', '==', id), 
      limit(1)
    );
  }, [db, id]);

  const { data: posts, loading } = useCollection(postQuery);
  const post = posts?.[0] as any;

  const relatedQuery = useMemo(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'blog_posts'), 
      where('status', '==', 'published'), 
      limit(3)
    );
  }, [db, id]);

  const { data: relatedPosts } = useCollection(relatedQuery);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Securing Content...</p>
      </div>
    );
  }

  if (!post || post.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Career Blog
        </Link>

        <article className="max-w-4xl mx-auto space-y-12">
          <header className="space-y-6">
            <Badge className="px-3 py-1">{post.category || 'Career Insights'}</Badge>
            <h1 className="text-3xl md:text-6xl font-headline font-bold leading-tight tracking-tight text-foreground">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
                <span className="font-bold text-foreground">ATS Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} /> 
                {post.updatedAt?.toDate ? format(post.updatedAt.toDate(), 'MMM d, yyyy') : 'Recently'}
              </div>
              <div className="flex items-center gap-2"><Clock size={14} /> 6 min Read</div>
            </div>
          </header>

          <div className="aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-muted/20 border border-white/10">
            <img 
              src={post.image || 'https://picsum.photos/seed/article/1200/600'} 
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-8 space-y-8 overflow-hidden">
              <div 
                className="prose dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-xl break-words"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="pt-12 border-t flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm"><Share2 size={16} className="mr-2" /> Share</Button>
                  <Button variant="outline" size="sm"><Bookmark size={16} className="mr-2" /> Save</Button>
                </div>
                <p className="text-xs text-muted-foreground italic">Powered by ATSResumeScan AI</p>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <Card className="glass border-primary/20 lg:sticky lg:top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-primary mx-auto" />
                    <h4 className="font-bold">Ready to pass the ATS?</h4>
                    <p className="text-xs text-muted-foreground">Get your instant compatibility score now.</p>
                  </div>
                  <Button asChild className="w-full font-bold shadow-lg shadow-primary/20">
                    <Link href="/ats-resume-checker">Start Free Scan</Link>
                  </Button>
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-green-500" /> 100% Recruiter Approved
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </article>

        <section className="max-w-4xl mx-auto pt-20 border-t mt-20">
          <h3 className="text-2xl font-bold mb-8">Related Reading</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts?.filter((p: any) => p.id !== post.id).slice(0, 2).map((p: any) => (
              <Card key={p.id} className="glass group overflow-hidden border-white/5 hover:border-primary/20 transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <img src={p.image || 'https://picsum.photos/seed/rel/400/200'} alt={p.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <CardContent className="p-6 space-y-4">
                  <Badge variant="outline" className="text-[10px]">{p.category || 'Career'}</Badge>
                  <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-2">{p.title}</h4>
                  <Link href={`/blog/${p.slug || p.id}`} className="text-xs font-bold text-primary flex items-center gap-1 group/link">
                    Read Article <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}