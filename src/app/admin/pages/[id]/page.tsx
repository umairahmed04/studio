'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
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
  GripVertical, 
  Settings, 
  Layout, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Activity,
  Layers,
  Globe,
  ImageIcon,
  Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-40 w-full bg-muted animate-pulse rounded-md" />
});

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

const quillFormats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'link'
];

export default function PageEditor() {
  const { id } = useParams();
  const db = useFirestore();
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

  useEffect(() => {
    if (page) setFormData(page);
  }, [page]);

  const handleSavePage = async () => {
    if (!pageRef || !formData) return;
    setSaving(true);
    try {
      const { id: _id, ...saveData } = formData;
      await updateDoc(pageRef, {
        ...saveData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Saved", description: "Metadata and status updated." });
    } catch (error) {
      console.error("Page Save Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
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
  };

  const deleteSection = async (sectionId: string) => {
    if (!db || !confirm('Remove this section?')) return;
    await deleteDoc(doc(db, 'pages', id as string, 'sections', sectionId));
  };

  const updateSection = async (sectionId: string, data: any) => {
    if (!db) return;
    const { id: _sid, ...saveData } = data;
    await updateDoc(doc(db, 'pages', id as string, 'sections', sectionId), saveData);
  };

  if (pageLoading || !formData) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-background sticky top-0 z-40 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/pages')}><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-xl font-bold">{formData.title}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">WordPress Style Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="font-bold">
            <a href={`/${formData.slug === 'home' ? '' : formData.slug}`} target="_blank">Preview Live</a>
          </Button>
          <Button size="sm" onClick={handleSavePage} disabled={saving} className="font-bold shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
            Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="sections" className="font-bold text-xs uppercase"><Layout size={16} className="mr-2" /> Content Builder</TabsTrigger>
          <TabsTrigger value="settings" className="font-bold text-xs uppercase"><Settings size={16} className="mr-2" /> Slugs & SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {sectionsLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {sections?.map((section: any) => (
                  <SectionEditor 
                    key={section.id} 
                    section={section} 
                    onUpdate={(data) => updateSection(section.id, data)}
                    onDelete={() => deleteSection(section.id)}
                  />
                ))}
              </div>
            )}
            
            <Card className="border-dashed border-2 bg-muted/5 rounded-2xl">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
                  <Plus size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold">Add Dynamic Section</h4>
                  <p className="text-xs text-muted-foreground">Select a section to add rich content to your page.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => addSection('hero')} className="font-bold"><Sparkles size={14} className="mr-2" /> Hero</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('about')} className="font-bold"><HelpCircle size={14} className="mr-2" /> About</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('features')} className="font-bold"><Layers size={14} className="mr-2" /> Features</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('faq')} className="font-bold"><Activity size={14} className="mr-2" /> FAQ</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('cta')} className="font-bold"><Plus size={14} className="mr-2" /> CTA</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="pt-6 space-y-6">
          <Card className="border-white/5 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary" size={20} />
                Indexing & Visibility
              </CardTitle>
              <CardDescription>Configure URLs and publication status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Internal Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-11 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">URL Slug (URL segment)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 font-bold">/</span>
                    <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="pl-6 h-11 font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Live Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Internal Only)</SelectItem>
                    <SelectItem value="published">Published (Live to Public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .quill-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 200px;
          font-family: inherit;
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: hsl(var(--muted)/0.3);
        }
      `}</style>
    </div>
  );
}

function SectionEditor({ section, onUpdate, onDelete }: { section: any, onUpdate: (data: any) => void, onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const handleContentUpdate = (key: string, value: any) => {
    onUpdate({ content: { ...section.content, [key]: value } });
  };

  const showImageField = ['hero', 'about'].includes(section.type);

  return (
    <Card className="overflow-hidden border-white/5 bg-card/50 transition-all hover:border-primary/20">
      <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <GripVertical size={16} className="text-muted-foreground cursor-grab opacity-40" />
          <Badge variant="secondary" className="uppercase text-[10px] font-black tracking-widest bg-primary/10 text-primary border-none">
            {section.type}
          </Badge>
          <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Order {section.order}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={onDelete}><Trash2 size={16} /></Button>
        </div>
      </div>
      
      {expanded && (
        <CardContent className="p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                  <Type size={12} className="text-primary" />
                  Heading / Section Title
                </label>
                <Input 
                  value={section.content?.heading || section.content?.title || ''} 
                  onChange={(e) => handleContentUpdate(section.content?.title ? 'title' : 'heading', e.target.value)} 
                  className="h-11 font-bold" 
                />
              </div>

              {showImageField && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon size={12} className="text-primary" />
                    Featured Visual (Image URL)
                  </label>
                  <Input 
                    value={section.content?.imageUrl || ''} 
                    onChange={(e) => handleContentUpdate('imageUrl', e.target.value)} 
                    placeholder="https://picsum.photos/seed/..."
                    className="h-11 font-mono text-xs" 
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Body Content (WordPress Editor)</label>
              <div className="bg-background rounded-lg border quill-editor">
                <ReactQuill 
                  theme="snow"
                  value={section.content?.description || section.content?.subheading || ''}
                  onChange={(val) => handleContentUpdate(section.content?.subheading ? 'subheading' : 'description', val)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter rich text description here..."
                />
              </div>
            </div>

            {section.content?.imageUrl && (
              <div className="pt-4">
                <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Visual Preview</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-muted/50 max-w-sm">
                  <img src={section.content.imageUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function getInitialContent(type: string) {
  switch(type) {
    case 'hero': return { heading: 'Enter Heading', subheading: '<p>Provide a compelling subheading.</p>', badge: 'New Feature', primaryButtonText: 'Get Started', primaryButtonUrl: '/signup', showPremiumMockups: true };
    case 'features': return { title: 'Core Features', items: [{ title: 'Feature 1', desc: 'Detail here', icon: 'zap' }] };
    case 'faq': return { title: 'Common Questions', items: [{ question: 'What is this?', answer: 'It is an AI platform.' }] };
    case 'about': return { title: 'Our Story', description: '<p>Tell your story here with rich formatting.</p>', imageUrl: 'https://picsum.photos/seed/about/800/800' };
    case 'cta': return { title: 'Ready to optimize?', description: '<p>Join today.</p>', buttonText: 'Sign Up Now', buttonUrl: '/signup' };
    default: return {};
  }
}
