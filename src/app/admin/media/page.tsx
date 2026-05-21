'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useStorage, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, Trash2, Loader2, Image as ImageIcon, Copy, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function MediaManager() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
  }, [db]);

  const { data: media, loading } = useCollection(mediaQuery);

  const filteredMedia = media?.filter((m: any) => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !db) return;

    setUploading(true);
    try {
      const storagePath = `uploads/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'media'), {
        name: file.name,
        url: url,
        path: storagePath,
        type: file.type,
        size: file.size,
        uploadedAt: serverTimestamp()
      });

      toast({ title: "Upload Successful", description: "Image added to library." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Check storage permissions." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!db || !storage || !confirm('Delete this file? This cannot be undone.')) return;
    
    try {
      await deleteObject(ref(storage, item.path));
      await deleteDoc(doc(db, 'media', item.id));
      toast({ title: "Deleted", description: "File removed from system." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete file." });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL Copied", description: "Ready to paste." });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage assets for your CMS pages.</p>
        </div>
        <div className="flex gap-2">
          <Input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload}
            accept="image/*"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
            Upload Image
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10" 
          placeholder="Search by filename..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-20"><Loader2 className="animate-spin" /></div>
        ) : filteredMedia?.length === 0 ? (
          <div className="col-span-full text-center p-20 border-2 border-dashed rounded-xl">
            <ImageIcon size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No media assets found.</p>
          </div>
        ) : filteredMedia?.map((item: any) => (
          <Card key={item.id} className="group overflow-hidden border-white/5 bg-card/50">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img src={item.url} alt={item.name} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="text-white" onClick={() => copyUrl(item.url)}><Copy size={16} /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item)}><Trash2 size={16} /></Button>
                <Button variant="ghost" size="icon" className="text-white" asChild><a href={item.url} target="_blank"><ExternalLink size={16} /></a></Button>
              </div>
            </div>
            <div className="p-2 text-[10px] truncate font-medium text-muted-foreground">
              {item.name}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
