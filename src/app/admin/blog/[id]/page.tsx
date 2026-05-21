'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  Eye,
  Sparkles,
  Wand2,
  Tag,
  Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBlogArticle } from '@/ai/flows/blog-ai-writer-flow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import dynamic from 'next/dynamic';

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
});

const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list',
  'link'
];

export default function BlogEditor() {
  const { id } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const postRef = useMemo(() => db ? doc(db, 'blog_posts', id as string) : null, [db, id]);
  const blogSettingsRef = useMemo(() => db ? doc(db, 'settings', 'blog') : null, [db]);
  
  const { data: post, loading } = useDoc(postRef);
  const { data: blogSettings, loading: settingsLoading } = useDoc(blogSettingsRef);

  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  // AI Writer State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInputs, setAiInputs] = useState({
    topic: '',
    keyword: ''
  });

  const categories = useMemo(() => {
    return blogSettings?.categories || [
      'ATS Resume Tips',
      'Resume Examples',
      'Career Advice',
      'Interview Tips',
      'LinkedIn Optimization'
    ];
  }, [blogSettings]);

  useEffect(() => {
    if (post) setFormData(post);
  }, [post]);

  const handleSave = async () => {
    if (!postRef || !formData) return;
    setSaving(true);
    try {
      // Remove 'id' from data before update to prevent conflicts
      const { id: _id, ...saveData } = formData;
      await updateDoc(postRef, {
        ...saveData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Article Saved", description: "Content updated successfully." });
    } catch (error) {
      console.error("Save Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };

  const executeAiWrite = async () => {
    if (!aiInputs.topic || !aiInputs.keyword) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide both a topic and a keyword." });
      return;
    }

    setAiLoading(true);
    try {
      toast({ title: "AI Writer Active", description: "Generating unique, human-like content..." });
      
      const result = await generateBlogArticle({
        topic: aiInputs.topic,
        keyword: aiInputs.keyword,
        targetAudience: "Job seekers, recruiters, and career professionals"
      });
      
      setFormData({
        ...formData,
        title: result.title,
        content: result.content,
        excerpt: result.metaDescription,
        category: categories.includes(aiInputs.keyword) ? aiInputs.keyword : categories[0]
      });
      
      toast({ title: "Draft Generated", description: "Review and refine your AI-written article." });
      setIsAiDialogOpen(false);
    } catch (error: any) {
      console.error("AI Write Error:", error);
      toast({ variant: "destructive", title: "AI Error", description: error.message || "Failed to generate content." });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || settingsLoading || !formData) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-background sticky top-0 z-40 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/blog')}><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[300px]">{formData.title}</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Blog Post Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAiDialogOpen(true)} disabled={aiLoading || saving} className="font-bold border-primary/20 text-primary">
            <Sparkles size={16} className="mr-2" />
            AI Write
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/blog/${formData.id}`} target="_blank" className="font-bold"><Eye size={16} className="mr-2" /> Preview</a>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || aiLoading} className="font-bold">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
            Publish Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-white/5 bg-card/50">
            <CardHeader><CardTitle>Main Content</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Article Title</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="text-lg font-bold h-12"
                  placeholder="Enter a headline..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                  Body Content (WordPress Style Visual Editor)
                  <span className="text-[10px] opacity-40">Rich text enabled</span>
                </label>
                <div className="min-h-[400px] bg-background rounded-md border border-input">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content || ''}
                    onChange={(content) => setFormData({...formData, content})}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your amazing post..."
                    className="h-full quill-editor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-white/5">
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Featured Image URL</label>
                <Input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5">
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">URL Slug</label>
                <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="how-to-beat-ats" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Meta Description</label>
                <Textarea rows={4} value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} placeholder="Search engine snippet..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Writer Setup Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-md glass">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Wand2 size={20} />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">AI Blog Architect</DialogTitle>
            </div>
            <DialogDescription>
              Provide a seed topic and keyword. Our AI will generate a unique, SEO-optimized professional article.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Type size={14} className="text-primary" />
                Seed Topic / Concept
              </Label>
              <Input 
                value={aiInputs.topic} 
                onChange={(e) => setAiInputs({...aiInputs, topic: e.target.value})} 
                placeholder="e.g. 5 Secrets to Beat any ATS Scanner in 2026"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Tag size={14} className="text-accent" />
                Primary SEO Keyword
              </Label>
              <Input 
                value={aiInputs.keyword} 
                onChange={(e) => setAiInputs({...aiInputs, keyword: e.target.value})} 
                placeholder="e.g. ATS Resume Optimization"
                className="h-11"
              />
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Content Quality Standards</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                Generated content will be unique, structured with HTML tags, and optimized for Google AdSense compliance.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)} disabled={aiLoading}>Cancel</Button>
            <Button onClick={executeAiWrite} disabled={aiLoading} className="font-bold px-8 shadow-lg shadow-primary/20">
              {aiLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Writing Content...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate Article
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .quill-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          min-height: 350px;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: hsl(var(--input));
          background-color: hsl(var(--muted) / 0.1);
        }
        .quill-editor .ql-container.ql-snow {
          border-color: hsl(var(--input));
        }
        .dark .quill-editor .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .dark .quill-editor .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
        .dark .quill-editor .ql-snow .ql-picker {
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
}
