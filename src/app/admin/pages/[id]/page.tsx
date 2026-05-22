
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useStorage } from '@/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Layout, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Layers,
  Globe,
  ImageIcon,
  Type,
  Eye,
  Search,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Edit3,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { cn, cleanForFirestore } from '@/lib/utils';

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
});

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['code-block', 'clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'align',
  'link', 'image', 'video', 'code-block'
];

/**
 * @fileOverview High-Performance Page Architect.
 * WordPress-level management system for dynamic site pages.
 * Optimized to load existing data and prevent duplicate creation.
 */
export default function PageEditor() {
  const { id } = useParams();
  const db = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();

  const pageRef = useMemo(() => db ? doc(db, 'pages', id as string) : null, [db, id]);
  const { data: page, loading: pageLoading } = useDoc(pageRef);

  const sectionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'pages', id as string, 'sections'), orderBy('order', 'asc'));
  }, [db, id]);

  const { data: sections, loading: sectionsLoading } = useCollection(sectionsQuery);

  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoaded = useRef(false);

  // CRITICAL FIX: Ensure formData is synced correctly when existing page loads
  useEffect(() => {
    if (page && !hasLoaded.current) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        status: page.status || 'draft',
        featuredImage: page.featuredImage || '',
        seo: page.seo || { title: '', description: '', ogImage: '' }
      });
      hasLoaded.current = true;
    }
  }, [page]);

  const handleSavePage = async () => {
    if (!pageRef || !formData) return;
    setSaving(true);
    try {
      const sanitizedData = cleanForFirestore({
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      // Use updateDoc to ensure we ONLY update the existing record
      await updateDoc(pageRef, sanitizedData);
      
      toast({ 
        title: formData.status === 'published' ? "Page Updated & Live" : "Draft Progress Saved", 
        description: `CMS configuration for "${formData.title}" is synchronized.` 
      });
    } catch (error) {
      console.error("Save Error:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not sync data to Firestore." });
    } finally {
      setSaving(false);
    }
  };

  const addSection = async (type: string) => {
    if (!db) return;
    const newOrder = (sections?.length || 0) + 1;
    await addDoc(collection(db, 'pages', id as string, 'sections'), {
      type,
      order: newOrder,
      content: getInitialContent(type),
      style: { backgroundColor: 'transparent', padding: 'py-20' }
    });
    toast({ title: "Section Added" });
  };

  const deleteSection = async (sectionId: string) => {
    if (!db || !confirm('Permanently remove this section?')) return;
    await deleteDoc(doc(db, 'pages', id as string, 'sections', sectionId));
  };

  const updateSection = async (sectionId: string, data: any) => {
    if (!db) return;
    const sanitizedData = cleanForFirestore(data);
    await updateDoc(doc(db, 'pages', id as string, 'sections', sectionId), sanitizedData);
  };

  const moveSection = async (section: any, direction: 'up' | 'down') => {
    if (!sections || !db) return;
    const idx = sections.findIndex(s => s.id === section.id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const targetSection = sections[targetIdx];
    
    await updateDoc(doc(db, 'pages', id as string, 'sections', section.id), { order: targetSection.order });
    await updateDoc(doc(db, 'pages', id as string, 'sections', targetSection.id), { order: section.order });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !formData) return;

    setUploading(true);
    try {
      const path = `cms/pages/${id}/featured-${Date.now()}`;
      const sRef = ref(storage, path);
      const snap = await uploadBytes(sRef, file);
      const url = await getDownloadURL(snap.ref);
      
      setFormData({ ...formData, featuredImage: url });
      toast({ title: "Featured Image Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  if (pageLoading || !formData) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Sticky Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur sticky top-0 z-50 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/pages')} className="rounded-xl"><ArrowLeft size={20} /></Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">{formData.title || 'Untitled'}</h1>
              <Badge variant="outline" className={cn(
                "text-[9px] uppercase tracking-widest h-5",
                formData.status === 'published' ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}>
                {formData.status}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              Page Editor <span className="opacity-30">/</span> {formData.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="font-bold rounded-xl hidden sm:flex">
            <a href={`/${formData.slug === 'home' ? '' : formData.slug}`} target="_blank"><Eye size={16} className="mr-2" /> Live Preview</a>
          </Button>
          <Button size="sm" onClick={handleSavePage} disabled={saving} className="font-bold shadow-lg shadow-primary/20 rounded-xl px-6">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
            {formData.status === 'published' ? 'Update Live Page' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-3 max-w-xl h-14 bg-muted/50 p-1 rounded-2xl border border-white/5">
          <TabsTrigger value="sections" className="font-bold text-xs uppercase rounded-xl transition-all">
            <Layout size={16} className="mr-2" /> Sections
          </TabsTrigger>
          <TabsTrigger value="seo" className="font-bold text-xs uppercase rounded-xl transition-all">
            <Globe size={16} className="mr-2" /> SEO & Status
          </TabsTrigger>
          <TabsTrigger value="media" className="font-bold text-xs uppercase rounded-xl transition-all">
            <ImageIcon size={16} className="mr-2" /> Visuals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="pt-8 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {sectionsLoading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="animate-spin text-primary" />
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Compiling Sections...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections?.map((section: any, idx: number) => (
                  <SectionEditor 
                    key={section.id} 
                    section={section} 
                    isFirst={idx === 0}
                    isLast={idx === (sections?.length || 0) - 1}
                    onUpdate={(data: any) => updateSection(section.id, data)}
                    onDelete={() => deleteSection(section.id)}
                    onMove={(dir: 'up' | 'down') => moveSection(section, dir)}
                  />
                ))}
              </div>
            )}
            
            <Card className="border-dashed border-2 bg-muted/5 rounded-[2rem] hover:bg-muted/10 transition-all group border-white/10">
              <CardContent className="p-12 text-center space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-headline font-bold">Inject New Section</h4>
                  <p className="text-sm text-muted-foreground">Extend this page with a new structural content block.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <AddSectionButton icon={<Sparkles size={14} />} label="Hero" onClick={() => addSection('hero')} />
                  <AddSectionButton icon={<HelpCircle size={14} />} label="About" onClick={() => addSection('about')} />
                  <AddSectionButton icon={<Layers size={14} />} label="Features" onClick={() => addSection('features')} />
                  <AddSectionButton icon={<Activity size={14} />} label="FAQ" onClick={() => addSection('faq')} />
                  <AddSectionButton icon={<Plus size={14} />} label="CTA" onClick={() => addSection('cta')} />
                  <AddSectionButton icon={<Type size={14} />} label="Rich Text" onClick={() => addSection('custom')} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="pt-8 space-y-8">
          <Card className="border-white/5 bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/5 p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Search size={24} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">SEO & Publication</CardTitle>
                  <CardDescription>Control how this page appears in search results and its visibility status.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">URL Handle (Slug)</Label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold font-mono">/</span>
                    <Input 
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                      className="pl-8 h-14 font-mono text-sm bg-background/50 border-white/10" 
                      placeholder="page-slug"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Publication Status</Label>
                  <StatusSelect 
                    value={formData.status} 
                    onChange={(v: string) => setFormData({...formData, status: v})} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Page Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="h-14 font-bold bg-background/50 border-white/10"
                  placeholder="Main Heading..."
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Meta Description</Label>
                <Textarea 
                  rows={4} 
                  value={formData.seo?.description || ''} 
                  onChange={(e) => setFormData({...formData, seo: { ...formData.seo, description: e.target.value }})} 
                  placeholder="Compelling search summary..."
                  className="bg-background/50 border-white/10 text-sm leading-relaxed resize-none p-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="pt-8 space-y-8">
          <Card className="border-white/5 bg-card/50 rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/5 p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Featured Visuals</CardTitle>
                  <CardDescription>Social sharing and hero asset management.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Featured Image URL</Label>
                       <div className="flex gap-2">
                         <div className="relative flex-1">
                           <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                           <Input 
                             value={formData.featuredImage || ''} 
                             onChange={(e) => setFormData({...formData, featuredImage: e.target.value})} 
                             className="pl-10 h-12 bg-background/50 font-mono text-[10px]" 
                             placeholder="https://..."
                           />
                         </div>
                         <input type="file" ref={fileInputRef} onChange={handleFeaturedImageUpload} className="hidden" accept="image/*" />
                         <Button 
                           variant="outline" 
                           className="h-12 w-12 rounded-xl shrink-0" 
                           onClick={() => fileInputRef.current?.click()}
                           disabled={uploading}
                         >
                           {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                         </Button>
                       </div>
                    </div>
                  </div>

                  <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white/5 bg-muted/20 shadow-2xl group">
                     {formData.featuredImage ? (
                       <>
                         <img src={formData.featuredImage} alt="Featured" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => setFormData({...formData, featuredImage: ''})}>
                              <Trash2 size={14} className="mr-2" /> Remove Image
                            </Button>
                         </div>
                       </>
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                          <ImageIcon size={48} className="opacity-10" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Asset Assigned</p>
                       </div>
                     )}
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .quill-editor .ql-container {
          border-bottom-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
          min-height: 350px;
          font-family: inherit;
          font-size: 0.95rem;
          background: hsl(var(--background) / 0.3);
          border-color: hsl(var(--border) / 0.1);
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          background: hsl(var(--muted)/0.5);
          border-color: hsl(var(--border) / 0.1);
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}

function SectionEditor({ section, onUpdate, onDelete, onMove, isFirst, isLast }: any) {
  const [expanded, setExpanded] = useState(false);

  const handleHeadingChange = (value: string) => {
    onUpdate({ content: { ...section.content, heading: value } });
  };

  const handleImageUrlChange = (value: string) => {
    onUpdate({ content: { ...section.content, imageUrl: value } });
  };

  const handleRichContentUpdate = (value: string) => {
    const key = section.content?.subheading ? 'subheading' : section.content?.body ? 'body' : 'description';
    onUpdate({ content: { ...section.content, [key]: value } });
  };

  const showImageField = ['hero', 'about'].includes(section.type);

  return (
    <Card className={cn(
      "overflow-hidden border-white/5 bg-card/50 transition-all hover:border-primary/20 rounded-3xl shadow-xl",
      expanded && "ring-2 ring-primary/10 border-primary/20"
    )}>
      <div className="bg-muted/30 px-8 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground disabled:opacity-10" onClick={() => onMove('up')} disabled={isFirst}><ChevronUp size={14} /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground disabled:opacity-10" onClick={() => onMove('down')} disabled={isLast}><ChevronDown size={14} /></Button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
             {getSectionIcon(section.type)}
          </div>
          <div>
            <h4 className="font-bold text-sm capitalize">{section.type} Block</h4>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px] font-mono italic">
              {section.content?.heading || section.content?.title || 'No Heading'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 px-4 font-bold rounded-xl border-white/10" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Collapse" : "Edit"}
            {expanded ? <ChevronUp size={16} className="ml-2" /> : <Edit3 size={16} className="ml-2" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={onDelete}><Trash2 size={18} /></Button>
        </div>
      </div>
      
      {expanded && (
        <CardContent className="p-10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Block Heading</Label>
              <Input 
                value={section.content?.heading || section.content?.title || ''} 
                onChange={(e) => handleHeadingChange(e.target.value)} 
                className="h-12 font-bold bg-background/50 border-white/5 rounded-xl text-lg" 
              />
            </div>

            {showImageField && (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Visual URL</Label>
                <div className="relative group">
                  <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input 
                    value={section.content?.imageUrl || ''} 
                    onChange={(e) => handleImageUrlChange(e.target.value)} 
                    placeholder="https://..."
                    className="pl-8 h-12 font-mono text-[10px] bg-background/50 border-white/5 rounded-xl" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Main Content (Rich Text)</Label>
            <div className="bg-background rounded-[1.5rem] border border-white/5 shadow-2xl">
              <DebouncedRichEditor 
                initialValue={section.content?.description || section.content?.subheading || section.content?.body || ''}
                onSync={handleRichContentUpdate}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function DebouncedRichEditor({ initialValue, onSync }: { initialValue: string, onSync: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(initialValue);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (val: string) => {
    setLocalValue(val);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      onSync(val);
    }, 800);
  };

  return (
    <ReactQuill 
      theme="snow"
      value={localValue}
      onChange={handleChange}
      modules={quillModules}
      formats={quillFormats}
      placeholder="Start writing content..."
      className="quill-editor"
    />
  );
}

function getSectionIcon(type: string) {
  switch(type) {
    case 'hero': return <Sparkles size={20} />;
    case 'about': return <HelpCircle size={20} />;
    case 'features': return <Layers size={20} />;
    case 'faq': return <Activity size={20} />;
    case 'cta': return <CheckCircle2 size={20} />;
    default: return <Type size={20} />;
  }
}

function StatusSelect({ value, onChange }: any) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-14 w-full font-bold rounded-2xl bg-background border-white/10">
        <SelectValue placeholder="Select Visibility" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="draft" className="rounded-lg p-3">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="flex flex-col text-left">
                 <span className="font-bold">Draft / Staging</span>
                 <span className="text-[9px] opacity-60 italic">Only visible to administrators</span>
              </div>
           </div>
        </SelectItem>
        <SelectItem value="published" className="rounded-lg p-3">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex flex-col text-left">
                 <span className="font-bold">Published Live</span>
                 <span className="text-[9px] opacity-60 italic">Visible to all site visitors</span>
              </div>
           </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function AddSectionButton({ icon, label, onClick }: any) {
  return (
    <Button variant="outline" onClick={onClick} className="h-12 px-6 rounded-xl font-bold border-white/10 hover:bg-primary hover:text-white transition-all">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
    </Button>
  );
}

function getInitialContent(type: string) {
  switch(type) {
    case 'hero': return { heading: 'Enter Your Visionary Headline', subheading: '<p>A professional sub-headline describing your mission.</p>', badge: 'SYSTEM ACTIVE', primaryButtonText: 'Get Started', primaryButtonUrl: '/signup', showPremiumMockups: true };
    case 'features': return { title: 'High-Impact Capabilities', description: 'Everything your search needs to succeed.', items: [{ title: 'AI Logic', desc: 'Deep data mapping.', icon: 'zap' }] };
    case 'faq': return { title: 'Intelligence FAQ', items: [{ question: 'How is this powered?', answer: 'Gemini 2.5 Flash architecture.' }] };
    case 'about': return { title: 'Our Narrative', description: '<p>Tell your high-performance career story here.</p>', imageUrl: 'https://picsum.photos/seed/about/800/800' };
    case 'cta': return { title: 'Secure Your Future', description: '<p>Join 50,000+ elite professionals.</p>', buttonText: 'Claim Your Account', buttonUrl: '/signup' };
    case 'custom': return { title: 'Custom Block', body: '<h2>New Dynamic Section</h2><p>Start composing your story here...</p>' };
    default: return {};
  }
}
