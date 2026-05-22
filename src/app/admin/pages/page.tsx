
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, getDocs, where } from 'firebase/firestore';
import { Plus, Search, Edit3, Trash2, Loader2, FileCode, Globe, Eye, Sparkles, Copy, Filter, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PageManagement() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'pages'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: pages, loading } = useCollection(pagesQuery);

  // Auto-provision core pages if they are missing
  useEffect(() => {
    if (!loading && pages && db && user) {
      const provision = async () => {
        const coreSlugs = ['home', 'about'];
        for (const slug of coreSlugs) {
          const exists = pages.some((p: any) => p.slug === slug);
          if (!exists) {
            try {
              await addDoc(collection(db, 'pages'), {
                title: slug === 'about' ? 'About Us' : 'Home Page',
                slug: slug,
                status: 'draft',
                authorId: user.uid,
                seo: { title: '', description: '', ogImage: '' },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            } catch (e) {
              console.warn(`Failed to auto-provision ${slug} page`);
            }
          }
        }
      };
      provision();
    }
  }, [loading, pages, db, user]);

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    return pages.filter((p: any) => {
      const matchesSearch = 
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchTerm, statusFilter]);

  const handleCreatePage = async () => {
    if (!db || !user) return;
    try {
      const docRef = await addDoc(collection(db, 'pages'), {
        title: 'New Dynamic Page',
        slug: 'new-page-' + Date.now(),
        status: 'draft',
        authorId: user.uid,
        seo: { title: '', description: '', ogImage: '' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Drafted", description: "Opening visual builder..." });
      router.push(`/admin/pages/${docRef.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create page." });
    }
  };

  const handleDuplicate = async (original: any) => {
    if (!db || !user) return;
    try {
      const { id, ...data } = original;
      const docRef = await addDoc(collection(db, 'pages'), {
        ...data,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Clone sections
      const sectionsSnap = await getDocs(collection(db, 'pages', original.id, 'sections'));
      for (const sDoc of sectionsSnap.docs) {
        await addDoc(collection(db, 'pages', docRef.id, 'sections'), sDoc.data());
      }

      toast({ title: "Page Duplicated", description: "Sections cloned successfully." });
    } catch (e) {
      toast({ variant: "destructive", title: "Duplicate Failed" });
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (slug === 'home' || slug === 'about') {
      toast({ variant: "destructive", title: "System Protected", description: "Core pages cannot be deleted." });
      return;
    }
    if (!db || !confirm('Permanently delete this page and all its content?')) return;
    try {
      await deleteDoc(doc(db, 'pages', id));
      toast({ title: "Page Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Page Management</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            Manage site-wide dynamic content and core system pages.
          </p>
        </div>
        <Button onClick={handleCreatePage} className="font-bold h-12 px-6 shadow-lg shadow-primary/20">
          <Plus size={18} className="mr-2" /> New Dynamic Page
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            className="pl-10 h-11 bg-background/50 border-white/5" 
            placeholder="Search by title or /slug..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={16} className="text-muted-foreground hidden md:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full md:w-[160px] font-bold">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Database...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 bg-muted/5">
            <FileCode size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">No pages found. Start building your site content!</p>
          </Card>
        ) : (
          filteredPages.map((page: any) => (
            <Card key={page.id} className="hover:border-primary/20 transition-all bg-card/50 backdrop-blur group border-white/5">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <FileCode size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg truncate">{page.title}</h3>
                      <Badge variant={page.status === 'published' ? 'default' : 'outline'} className={cn(
                        "text-[9px] uppercase tracking-widest h-5",
                        page.status === 'published' ? "bg-green-600 hover:bg-green-700" : "text-amber-500 border-amber-500/20"
                      )}>
                        {page.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium uppercase tracking-tight">
                      <span className="flex items-center gap-1 text-primary lowercase font-mono">/{page.slug === 'home' ? '' : page.slug}</span>
                      <span className="flex items-center gap-1 opacity-60"><Clock size={12} /> {page.updatedAt?.toDate ? format(page.updatedAt.toDate(), 'MMM d, h:mm a') : 'Just now'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="font-bold h-10 border-white/5 hover:bg-primary/5 hover:text-primary transition-all" onClick={() => router.push(`/admin/pages/${page.id}`)}>
                    <Edit3 size={16} className="mr-2" /> Visual Edit
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted/50" onClick={() => handleDuplicate(page)} title="Duplicate Page">
                    <Copy size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-muted-foreground hover:text-primary" title="View Live">
                    <a href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank"><Eye size={16} /></a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 disabled:opacity-30" 
                    onClick={() => handleDelete(page.id, page.slug)}
                    disabled={page.slug === 'home' || page.slug === 'about'}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-primary/10 bg-primary/5 rounded-3xl p-8 border shadow-inner">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg">
            <Sparkles size={32} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xl font-bold font-headline">Enterprise Content Engine</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Published CMS pages automatically override the default static system pages. 
              The visual builder supports rich text, reorderable sections, and full SEO control.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
