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
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      // Stripping id to prevent Firestore conflict
      const { id: _id, ...saveData } = formData;
      await updateDoc(pageRef, {
        ...saveData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Saved", description: "Metadata updated successfully." });
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
    // Stripping id to prevent Firestore conflict
    const { id: _sid, ...saveData } = data;
    await updateDoc(doc(db, 'pages', id as string, 'sections', sectionId), saveData);
  };

  if (pageLoading || !formData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-background sticky top-0 z-40 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/pages')}><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-xl font-bold">{formData.title}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Editor Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/${formData.slug === 'home' ? '' : formData.slug}`} target="_blank" className="font-bold">Preview Page</a>
          </Button>
          <Button size="sm" onClick={handleSavePage} disabled={saving} className="font-bold">
            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="sections"><Layout size={16} className="mr-2" /> Content Builder</TabsTrigger>
          <TabsTrigger value="settings"><Settings size={16} className="mr-2" /> Page Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {sectionsLoading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : sections?.length === 0 ? (
              <div className="text-center p-20 border-2 border-dashed rounded-3xl bg-muted/20">
                <p className="text-muted-foreground mb-4">This page is using hardcoded content or has no dynamic sections.</p>
              </div>
            ) : sections?.map((section: any) => (
              <SectionEditor 
                key={section.id} 
                section={section} 
                onUpdate={(data) => updateSection(section.id, data)}
                onDelete={() => deleteSection(section.id)}
              />
            ))}
            
            <Card className="border-dashed border-2 bg-muted/5">
              <CardContent className="p-8 text-center space-y-4">
                <h4 className="font-bold">Add Dynamic Section</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => addSection('hero')}><Sparkles size={14} className="mr-1" /> Hero</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('about')}><HelpCircle size={14} className="mr-1" /> About</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('features')}><Layers size={14} className="mr-1" /> Features</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('faq')}><Activity size={14} className="mr-1" /> FAQ</Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('cta')}><Plus size={14} className="mr-1" /> CTA</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Metadata</CardTitle>
              <CardDescription>Configure URLs and indexing settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Display Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">URL Slug</label>
                  <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Publication Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                    <SelectItem value="published">Published (Public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionEditor({ section, onUpdate, onDelete }: { section: any, onUpdate: (data: any) => void, onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const handleContentUpdate = (key: string, value: any) => {
    onUpdate({ content: { ...section.content, [key]: value } });
  };

  return (
    <Card className="overflow-hidden border-primary/10">
      <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-muted-foreground cursor-grab" />
          <Badge variant="secondary" className="uppercase text-[10px] font-black">{section.type}</Badge>
          <span className="text-sm font-bold opacity-60">Order {section.order}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}><Trash2 size={16} /></Button>
        </div>
      </div>
      
      {expanded && (
        <CardContent className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Section Heading</label>
            <Input value={section.content?.heading || section.content?.title || ''} onChange={(e) => handleContentUpdate('heading', e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Section Body / Description</label>
            <Textarea value={section.content?.subheading || section.content?.description || ''} onChange={(e) => handleContentUpdate('description', e.target.value)} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function getInitialContent(type: string) {
  switch(type) {
    case 'hero': return { heading: 'Welcome to our site', subheading: 'Empowering your professional growth with AI.', badge: 'New Feature', primaryButtonText: 'Get Started', primaryButtonUrl: '/signup' };
    case 'features': return { title: 'Our Core Features', items: [{ title: 'Feature 1', desc: 'Detail here', icon: 'zap' }] };
    case 'faq': return { title: 'Common Questions', items: [{ question: 'What is this?', answer: 'It is an AI platform.' }] };
    case 'about': return { title: 'About Our Platform', description: '<p>Learn more about us here.</p>', imageUrl: 'https://picsum.photos/seed/about/800/800' };
    case 'cta': return { title: 'Ready to optimize?', description: 'Join 50k+ users today.', buttonText: 'Sign Up Now', buttonUrl: '/signup' };
    default: return {};
  }
}