'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2, 
  FileText, 
  ExternalLink,
  Tag,
  X,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminBlogList() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategories, setSavingCategories] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch Posts
  const blogQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: posts, loading } = useCollection(blogQuery);

  // Fetch Global Blog Settings (Categories)
  const blogSettingsRef = useMemo(() => db ? doc(db, 'settings', 'blog') : null, [db]);
  const { data: blogSettings, loading: settingsLoading } = useDoc(blogSettingsRef);

  const filteredPosts = posts?.filter(p => 
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = async () => {
    if (!db) return;
    try {
      const res = await addDoc(collection(db, 'blog_posts'), {
        title: 'New Untitled Post',
        slug: 'new-post-' + Date.now(),
        content: '',
        excerpt: '',
        status: 'draft',
        category: blogSettings?.categories?.[0] || 'General',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        image: 'https://picsum.photos/seed/' + Date.now() + '/800/600',
        seo: { metaTitle: '', metaDescription: '', keywords: [] }
      });
      router.push(`/admin/blog/${res.id}`);
    } catch (error) {
      console.error("Create error", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this post?')) return;
    await deleteDoc(doc(db, 'blog_posts', id));
    toast({ title: "Post Deleted" });
  };

  const handleAddCategory = async () => {
    if (!db || !blogSettingsRef || !newCategoryName.trim()) return;
    setSavingCategories(true);
    try {
      const currentCategories = blogSettings?.categories || [];
      const trimmed = newCategoryName.trim();
      if (currentCategories.includes(trimmed)) {
        toast({ variant: "destructive", title: "Duplicate Category", description: "This category already exists." });
        return;
      }
      const updatedCategories = [...currentCategories, trimmed];
      await setDoc(blogSettingsRef, { categories: updatedCategories }, { merge: true });
      setNewCategoryName('');
      toast({ title: "Category Added", description: `${trimmed} is now live.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Error" });
    } finally {
      setSavingCategories(false);
    }
  };

  const handleUpdateCategory = async (index: number) => {
    if (!db || !blogSettingsRef || !editValue.trim()) return;
    setSavingCategories(true);
    try {
      const currentCategories = [...(blogSettings?.categories || [])];
      const trimmed = editValue.trim();
      
      // Check for duplicates elsewhere in the array
      if (currentCategories.some((c, i) => i !== index && c === trimmed)) {
        toast({ variant: "destructive", title: "Duplicate Category" });
        return;
      }

      currentCategories[index] = trimmed;
      await setDoc(blogSettingsRef, { categories: currentCategories }, { merge: true });
      setEditingIndex(null);
      setEditValue('');
      toast({ title: "Category Renamed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Error" });
    } finally {
      setSavingCategories(false);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (!db || !blogSettingsRef || !confirm(`Delete "${catToDelete}"? Posts in this category will need updating.`)) return;
    try {
      const updatedCategories = (blogSettings?.categories || []).filter((c: string) => c !== catToDelete);
      await setDoc(blogSettingsRef, { categories: updatedCategories }, { merge: true });
      toast({ title: "Category Removed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Error" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage articles and content taxonomies.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} className="h-12 font-bold border-primary/20 text-primary">
            <Tag size={18} className="mr-2" /> Manage Categories
          </Button>
          <Button onClick={handleCreateNew} className="h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus size={18} className="mr-2" /> Create New Post
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10 h-12 bg-background/50" 
          placeholder="Search articles..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
        ) : !filteredPosts || filteredPosts.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <FileText size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No blog posts found. Create your first article!</p>
          </Card>
        ) : filteredPosts.map((post: any) => (
          <Card key={post.id} className="shadow-sm border-white/5 bg-card/50 backdrop-blur hover:border-primary/20 transition-all">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg truncate">{post.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Tag size={10} className="text-primary" /> {post.category}</span>
                    <span>•</span>
                    <span className={cn(post.status === 'published' ? "text-green-500" : "text-amber-500")}>{post.status}</span>
                    {post.updatedAt?.toDate && (
                      <>
                        <span>•</span>
                        <span>{format(post.updatedAt.toDate(), 'MMM d, yyyy')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-bold" onClick={() => router.push(`/admin/blog/${post.id}`)}>
                  <Edit3 size={16} className="mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(post.id)}>
                  <Trash2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" asChild title="View Public Post">
                  <a href={`/blog/${post.id}`} target="_blank"><ExternalLink size={16} /></a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Manager Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={(open) => {
        setIsCategoryModalOpen(open);
        if (!open) { setEditingIndex(null); setEditValue(''); }
      }}>
        <DialogContent className="sm:max-w-md glass border-white/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Tag size={20} />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">Blog Categories</DialogTitle>
            </div>
            <DialogDescription>
              Add, edit, or remove categories to organize your career content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex gap-2">
              <Input 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="New category name..."
                className="h-11"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                disabled={savingCategories}
              />
              <Button onClick={handleAddCategory} disabled={savingCategories || !newCategoryName.trim()} className="font-bold h-11 shrink-0">
                {savingCategories && editingIndex === null ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              </Button>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {settingsLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
              ) : !blogSettings?.categories || blogSettings.categories.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground italic py-8">No categories found.</p>
              ) : (
                blogSettings.categories.map((cat: string, idx: number) => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-white/5 group transition-all hover:bg-muted/30">
                    {editingIndex === idx ? (
                      <div className="flex gap-2 flex-1 mr-2">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(idx);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleUpdateCategory(idx)}>
                          <Check size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingIndex(null)}>
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold truncate flex-1">{cat}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary" 
                            onClick={() => { setEditingIndex(idx); setEditValue(cat); }}
                            disabled={savingCategories}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={savingCategories}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="w-full font-bold" onClick={() => setIsCategoryModalOpen(false)}>Close Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted));
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}