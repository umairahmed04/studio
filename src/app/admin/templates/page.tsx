'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useCollection, useStorage } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, Loader2, Save, Upload, Link as LinkIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import placeholderData from '@/app/lib/placeholder-images.json';

export default function TemplateManagement() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templatesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'cv_templates'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: templates, loading } = useCollection(templatesQuery);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageId: 'tpl-professional',
    customImageUrl: '',
    status: 'active',
    category: 'Corporate',
    features: ['ATS-Optimized', 'Recruiter-Approved']
  });

  const handleCreate = async () => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'cv_templates'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      resetForm();
      toast({ title: "Template Added", description: "Design is now live." });
    } catch (error) {
      console.error("Create Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!db) return;
    try {
      const { id: _id, ...updateData } = formData as any;
      await updateDoc(doc(db, 'cv_templates', id), updateData);
      setEditingId(null);
      resetForm();
      toast({ title: "Template Updated", description: "Changes saved." });
    } catch (error) {
      console.error("Update Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Update failed." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Delete this template?')) return;
    await deleteDoc(doc(db, 'cv_templates', id));
  };

  const startEdit = (tpl: any) => {
    setFormData({
      name: tpl.name,
      description: tpl.description,
      imageId: tpl.imageId,
      customImageUrl: tpl.customImageUrl || '',
      status: tpl.status,
      category: tpl.category || 'Corporate',
      features: tpl.features || []
    });
    setEditingId(tpl.id);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', imageId: 'tpl-professional', customImageUrl: '', status: 'active', category: 'Corporate', features: ['ATS-Optimized', 'Recruiter-Approved'] });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setUploading(true);
    try {
      const path = `templates/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData({ ...formData, customImageUrl: url });
      toast({ title: "Image Uploaded", description: "Preview image has been set." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">CV Templates</h1>
          <p className="text-muted-foreground">Manage visual styles for the interactive builder.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-12 px-6 font-bold" disabled={isAdding || !!editingId}>
          <Plus size={18} className="mr-2" /> Create Template
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Design' : 'Add New Design'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}><X size={18} /></Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Template Name</label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="The Executive" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                  <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Modern, Academic" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Fallback Image</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.imageId}
                      onChange={(e) => setFormData({...formData, imageId: e.target.value})}
                    >
                      <option value="tpl-professional">Executive</option>
                      <option value="tpl-modern">Silicon Valley</option>
                      <option value="tpl-hybrid">Creative Pro</option>
                      <option value="tpl-minimalist">Minimalist</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                    Featured Image
                    <span className="text-[10px] opacity-60">Upload or insert link</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon size={14} className="absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        className="pl-9" 
                        placeholder="https://..." 
                        value={formData.customImageUrl} 
                        onChange={(e) => setFormData({...formData, customImageUrl: e.target.value})}
                      />
                    </div>
                    <Input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                    <Button 
                      variant="outline" 
                      className="shrink-0" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </Button>
                  </div>
                </div>
                {formData.customImageUrl && (
                  <div className="aspect-[4/3] relative rounded-lg overflow-hidden border bg-muted/50">
                    <img src={formData.customImageUrl} alt="Preview" className="object-cover w-full h-full" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => setFormData({...formData, customImageUrl: ''})}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Classic serif design for high-end roles." />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} className="font-bold px-8 shadow-lg shadow-primary/20">
                <Save size={16} className="mr-2" /> Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((tpl: any) => (
          <Card key={tpl.id} className="group overflow-hidden border-white/5 bg-card/50 backdrop-blur hover:border-primary/20 transition-all">
            <div className="aspect-[3/4] relative bg-muted/20 overflow-hidden border-b">
               <img 
                 src={tpl.customImageUrl || placeholderData.placeholderImages.find(i => i.id === tpl.imageId)?.imageUrl || 'https://placehold.co/600x800'} 
                 alt={tpl.name}
                 className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-500"
               />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20" onClick={() => startEdit(tpl)}><Edit2 size={16} /></Button>
                 <Button variant="outline" size="sm" className="bg-red-50/20 text-red-500 border-red-500/20" onClick={() => handleDelete(tpl.id)}><Trash2 size={16} /></Button>
               </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold truncate pr-2">{tpl.name}</h3>
                <Badge variant={tpl.status === 'active' ? 'default' : 'outline'} className="text-[10px] uppercase font-black tracking-tighter h-5">
                  {tpl.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase">{tpl.category || 'Corporate'}</Badge>
                {tpl.customImageUrl && <Badge variant="outline" className="text-[9px] uppercase border-green-500/30 text-green-600">Dynamic Image</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
