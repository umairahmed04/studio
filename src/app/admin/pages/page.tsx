'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Search, Edit3, Trash2, Loader2, FileCode, Globe, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Delete this page permanently? All sections will be lost.')) return;
    await deleteDoc(doc(db, 'pages', id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Website Pages</h1>
          <p className="text-muted-foreground">Manage dynamic website content and dynamic routing.</p>
        </div>
        <Button onClick={handleCreatePage} className="font-bold">
          <Plus size={18} className="mr-2" /> Create New Page
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10" 
          placeholder="Search pages by title or slug..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
        ) : filteredPages?.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <p className="text-muted-foreground">No pages found. Start by creating one!</p>
          </Card>
        ) : filteredPages?.map((page: any) => (
          <Card key={page.id} className="hover:border-primary/20 transition-all">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileCode size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg truncate">{page.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Globe size={12} /> /{page.slug}</span>
                    <Badge variant={page.status === 'published' ? 'default' : 'outline'} className="text-[10px] uppercase">
                      {page.status}
                    </Badge>
                    <span>Updated {page.updatedAt?.toDate ? format(page.updatedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/pages/${page.id}`)}>
                  <Edit3 size={16} className="mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank"><Eye size={16} /></a>
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(page.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
