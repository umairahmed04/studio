'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
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
  Check,
  Layout,
  Globe,
  Settings2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn, cleanForFirestore } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminBlogList() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catSaving, setCatSaving] = useState(false);

  // Fetch Posts
  const blogQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: posts, loading } = useCollection(blogQuery);

  // Fetch Categories Collection
  const catQuery = useMemo(() => db ? query(collection(db, 'blog_categories'), orderBy('name', 'asc')) : null, [db]);
  const { data: categories, loading: categoriesLoading } = useCollection(catQuery);

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
        category: categories?.[0]?.name || 'General',
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingCategory?.name) return;
    setCatSaving(true);
    try {
      const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const data = cleanForFirestore({
        ...editingCategory,
        slug,
        updatedAt: serverTimestamp()
      });

      if (editingCategory.id) {
        await setDoc(doc(db, 'blog_categories', editingCategory.id), data, { merge: true });
      } else {
        await addDoc(collection(db, 'blog_categories'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }

      toast({ title: "Category Saved" });
      setEditingCategory(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error Saving Category" });
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!db || !confirm('Delete this category? This will not delete posts, but they will become uncategorized.')) return;
    try {
      await deleteDoc(doc(db, 'blog_categories', id));
      toast({ title: "Category Removed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage articles and professional content taxonomies.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)} className="h-12 font-bold border-primary/20 text-primary">
            <Layout size={18} className="mr-2" /> Blog Categories
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
                  <a href={`/blog/${post.slug || post.id}`} target="_blank"><ExternalLink size={16} /></a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Category Manager Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-3xl glass border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Layout size={20} />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">Category Architecture</DialogTitle>
            </div>
            <DialogDescription>
              Manage your blog taxonomies, SEO slugs, and descriptions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
            {/* List Column */}
            <div className="md:col-span-5 space-y-4 border-r border-white/5 pr-4">
              <Button 
                variant="outline" 
                className="w-full justify-start font-bold h-11 mb-2 border-dashed"
                onClick={() => setEditingCategory({ name: '', slug: '', description: '', status: 'active' })}
              >
                <Plus size={16} className="mr-2" /> Create New
              </Button>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {categoriesLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : !categories || categories.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground italic py-8">No categories found.</p>
                ) : (
                  categories.map((cat: any) => (
                    <div 
                      key={cat.id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                        editingCategory?.id === cat.id ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-white/5 hover:bg-muted/30"
                      )}
                      onClick={() => setEditingCategory(cat)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{cat.name}</p>
                        <p className="text-[9px] text-muted-foreground font-mono truncate">/{cat.slug}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Editor Column */}
            <div className="md:col-span-7">
              {editingCategory ? (
                <form onSubmit={handleSaveCategory} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Category Name</Label>
                        <Input 
                          value={editingCategory.name} 
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} 
                          placeholder="e.g. Resume Tips"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">URL Handle (Slug)</Label>
                        <Input 
                          value={editingCategory.slug} 
                          onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                          placeholder="resume-tips"
                          className="h-10 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Description</Label>
                      <Textarea 
                        value={editingCategory.description || ''} 
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} 
                        placeholder="Brief overview of this category..."
                        className="h-24 text-sm"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                         <Globe size={14} className="text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">SEO Configuration</span>
                       </div>
                       <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold text-muted-foreground">Meta Title</Label>
                            <Input 
                              value={editingCategory.seo?.title || ''} 
                              onChange={(e) => setEditingCategory({ ...editingCategory, seo: { ...editingCategory.seo, title: e.target.value } })}
                              className="h-8 text-xs bg-background/50" 
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold text-muted-foreground">Meta Description</Label>
                            <Textarea 
                              value={editingCategory.seo?.description || ''} 
                              onChange={(e) => setEditingCategory({ ...editingCategory, seo: { ...editingCategory.seo, description: e.target.value } })}
                              className="h-16 text-xs bg-background/50" 
                            />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={catSaving} className="font-bold">
                      {catSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Check size={14} className="mr-2" />}
                      Save Configuration
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border-2 border-dashed rounded-2xl opacity-40">
                  <Settings2 size={48} />
                  <p className="text-sm font-medium">Select a category or create one to edit settings.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
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
