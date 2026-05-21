'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Search, Edit3, Trash2, Loader2, FileCode, Globe, Eye, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Page Management Dashboard.
 * Handles dynamic content creation and auto-provisions core pages (Home, About).
 */
export default function PageManagement() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const pagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'pages'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: pages, loading } = useCollection(pagesQuery);

  // Functional Logic: Auto-provision core pages if they are missing from CMS
  useEffect(() => {
    if (!loading && pages && db) {
      const coreSlugs = ['about', 'home'];
      coreSlugs.forEach(async (slug) => {
        const exists = pages.some((p: any) => p.slug === slug);
        if (!exists) {
          try {
            await addDoc(collection(db, 'pages'), {
              title: slug === 'about' ? 'About Us' : 'Home Page',
              slug: slug,
              status: 'draft',
              seo: { title: '', description: '', ogImage: '' },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (e) {
            console.warn(`Failed to auto-provision ${slug} page`);
          }
        }
      });
    }
  }, [loading, pages, db]);

  const filteredPages = pages?.filter((p: any) => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = async () => {
    if (!db) return;
    try {
      const docRef = await addDoc(collection(db, 'pages'), {
        title: 'New Page',
        slug: 'new-page-' + Date.now(),
        status: 'draft',
        seo: { title: '', description: '', ogImage: '' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Created", description: "Taking you to the editor..." });
      router.push(`/admin/pages/${docRef.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create page." });
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (slug === 'home' || slug === 'about') {
      toast({ variant: "destructive", title: "Protected Page", description: "Core system pages cannot be deleted, only edited." });
      return;
    }
    if (!db || !confirm('Delete this page permanently? All sections will be lost.')) return;
    await deleteDoc(doc(db, 'pages', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Page Management</h1>
          <p className="text-muted-foreground">Manage dynamic website content, core pages, and publication status.</p>
        </div>
        <Button onClick={handleCreatePage} className="font-bold h-12 px-6 shadow-lg shadow-primary/20">
          <Plus size={18} className="mr-2" /> Create New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              className="pl-10 h-12 bg-card/50" 
              placeholder="Search pages by title or slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredPages?.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 bg-muted/5">
                <FileCode size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No pages found. Start by creating your first dynamic page.</p>
              </Card>
            ) : filteredPages?.map((page: any) => (
              <Card key={page.id} className="hover:border-primary/20 transition-all bg-card/50 backdrop-blur">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FileCode size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg truncate">{page.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Globe size={12} className="text-primary" /> /{page.slug}</span>
                        <Badge variant={page.status === 'published' ? 'default' : 'outline'} className="text-[10px] uppercase tracking-widest h-5">
                          {page.status}
                        </Badge>
                        <span>Updated {page.updatedAt?.toDate ? format(page.updatedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-bold" onClick={() => router.push(`/admin/pages/${page.id}`)}>
                      <Edit3 size={16} className="mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="View Live Page">
                      <a href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank"><Eye size={16} /></a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 disabled:opacity-30" 
                      onClick={() => handleDelete(page.id, page.slug)}
                      disabled={page.slug === 'home' || page.slug === 'about'}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold">Dynamic Management</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We have automatically identified your core pages (**About Us** and **Home**).
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Editing these pages here and setting them to **"Published"** will instantly override the default static content on the site.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}