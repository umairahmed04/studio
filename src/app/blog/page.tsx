'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, User, ArrowRight, TrendingUp, Target, ShieldCheck, Loader2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Categories Collection
  const catQuery = useMemo(() => db ? query(collection(db, 'blog_categories'), orderBy('name', 'asc')) : null, [db]);
  const { data: categoriesData } = useCollection(catQuery);

  const categories = useMemo(() => {
    const list = categoriesData?.map(c => c.name) || [
      'ATS Resume Tips',
      'Resume Examples',
      'Career Advice',
      'Interview Tips',
      'LinkedIn Optimization'
    ];
    return ['All', ...list];
  }, [categoriesData]);

  const blogQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'blog_posts'), 
      where('status', '==', 'published')
    );
  }, [db]);

  const { data: posts, loading } = useCollection(blogQuery);

  const filteredAndSortedPosts = useMemo(() => {
    if (!posts) return [];
    
    const sorted = [...posts].sort((a: any, b: any) => {
      const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
      return dateB - dateA;
    });

    return sorted.filter(post => {
      const matchCat = selectedCategory === 'All' || post.category === selectedCategory;
      const titleMatch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const excerptMatch = (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && (titleMatch || excerptMatch);
    });
  }, [posts, selectedCategory, searchTerm]);

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Expert Career Insights
          </Badge>
          <h1 className="text-3xl md:text-6xl font-headline font-bold mb-6 tracking-tight text-foreground leading-tight">
            Career Resources & <span className="text-primary">ATS Strategy</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Master the science of recruitment software and land your dream job with our expert-written guides.
          </p>
          
          <div className="max-w-md mx-auto relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              className="pl-10 h-12 bg-background/50 backdrop-blur border-white/10 w-full" 
              placeholder="Search for ATS tips, keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <Badge 
              key={cat} 
              variant={selectedCategory === cat ? 'default' : 'outline'} 
              className={cn(
                "px-3 md:px-4 py-1.5 cursor-pointer transition-all uppercase text-[9px] md:text-[10px] font-black tracking-widest h-8",
                selectedCategory === cat ? "bg-primary text-white" : "hover:bg-primary/10 border-white/10"
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-primary h-12" />
          </div>
        ) : !filteredAndSortedPosts || filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground italic space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
              <Search size={32} />
            </div>
            <p>No articles found. Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {filteredAndSortedPosts.map((post: any) => (
              <Card key={post.id} className="glass group overflow-hidden border-white/5 hover:border-primary/20 transition-all shadow-xl hover:shadow-primary/5">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={post.image || 'https://picsum.photos/seed/blog/800/600'} 
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur text-[10px] uppercase font-black">
                    {post.category || 'Career'}
                  </Badge>
                </div>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-4 text-[10px] md:text-xs text-muted-foreground mb-4 font-bold uppercase tracking-tighter">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-primary" /> 
                      {post.updatedAt?.toDate ? format(post.updatedAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-primary" /> 
                      ATS Expert
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Button variant="link" className="p-0 h-auto font-bold group flex items-center gap-1" asChild>
                    <Link href={`/blog/${post.slug || post.id}`}>
                      Read Full Article 
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10 backdrop-blur shadow-inner">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <h4 className="font-bold">Latest Trends</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stay updated with 2026 recruitment trends, AI-driven hiring, and modern interview techniques.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <Target size={20} />
              </div>
              <h4 className="font-bold">Keyword Strategy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deep dives into industry-specific keywords for tech, finance, marketing, and more.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold">Expert Audits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Regular resume teardowns and success stories from job seekers who beat the ATS.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
