'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, Trash2, Sparkles, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeProfilePhoto, type AnalyzePhotoOutput } from '@/ai/flows/analyze-photo-flow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhotoUploadProps {
  cvId: string;
  currentPhotoUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemove: () => void;
}

export function PhotoUpload({ cvId, currentPhotoUrl, onUploadComplete, onRemove }: PhotoUploadProps) {
  const { user } = useUser();
  const storage = useStorage();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<AnalyzePhotoOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(currentPhotoUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local URL input in sync with external updates (like removal)
  useEffect(() => {
    setUrlInput(currentPhotoUrl || '');
  }, [currentPhotoUrl]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUrlSync = () => {
    if (urlInput.trim() && urlInput !== currentPhotoUrl) {
      onUploadComplete(urlInput.trim());
      toast({ title: 'URL Applied', description: 'Linked image set as profile photo.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload an image file.' });
      return;
    }

    setUploading(true);
    try {
      const storagePath = `users/${user.uid}/cv_photos/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Trigger update in parent
      onUploadComplete(url);
      setUploading(false);
      
      // Perform AI Analysis in background
      try {
        setAnalyzing(true);
        const base64 = await fileToBase64(file);
        const report = await analyzeProfilePhoto({ photoDataUri: base64 });
        setAiReport(report);
        setIsReportOpen(true);
      } catch (aiErr) {
        console.warn("AI photo analysis skipped", aiErr);
      } finally {
        setAnalyzing(false);
      }
      
      toast({ title: 'Photo Synced', description: 'Your identity image is live.' });
    } catch (error: any) {
      console.error("Photo Upload Error:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not save photo to storage.' });
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-2 border-primary/20 shadow-xl ring-offset-2 ring-2 ring-primary/5 transition-all">
          <AvatarImage src={currentPhotoUrl} className="object-cover" />
          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
            {user?.displayName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div 
          className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={24} />
          <span className="text-[8px] font-black uppercase mt-1">Change</span>
        </div>
        {(uploading || analyzing) && (
          <div className="absolute inset-0 bg-background/60 rounded-full flex flex-col items-center justify-center gap-1">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">
              {uploading ? 'Uploading' : 'AI Scoring'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="flex gap-2 justify-center">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading || analyzing} className="h-8 font-bold">
            {currentPhotoUrl ? 'Replace with File' : 'Upload Photo'}
          </Button>
          {currentPhotoUrl && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive h-8 w-8" 
              onClick={() => {
                onRemove();
                setUrlInput('');
              }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <LinkIcon size={12} className="text-primary" />
              Direct Image URL
            </Label>
            <div className="flex gap-2">
              <Input 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlSync}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSync()}
                placeholder="Paste link (LinkedIn, FB, etc.)"
                className="h-9 text-xs bg-muted/20"
              />
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
               <p className="text-[9px] text-muted-foreground leading-relaxed font-medium">
                <Sparkles size={10} className="inline mr-1 text-primary" />
                <strong>Pro Tip:</strong> You can paste an image URL directly from platforms like <strong>LinkedIn or Facebook</strong>.
               </p>
               <p className="text-[9px] text-muted-foreground leading-relaxed">
                Simply right-click your profile picture on any network and select <strong>"Copy Image Address"</strong> to use it here.
               </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-md glass border-white/10 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={18} />
              </div>
              <DialogTitle className="text-xl font-headline font-bold">AI Photo Audit</DialogTitle>
            </div>
            <DialogDescription className="text-xs">Evaluating identity presentation standards.</DialogDescription>
          </DialogHeader>
          {aiReport && (
            <div className="space-y-6 py-4 text-center">
              <div className="text-5xl font-headline font-bold text-primary">
                {aiReport.score}
                <span className="text-sm opacity-40 text-foreground font-sans">/100</span>
              </div>
              <Badge className={aiReport.score >= 80 ? "bg-green-500" : aiReport.score >= 60 ? "bg-amber-500" : "bg-destructive"}>
                {aiReport.label}
              </Badge>
              <Progress value={aiReport.score} className="h-2 mt-4" />
              <div className="text-left space-y-4 pt-4">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Recommendations</h4>
                {aiReport.suggestions.map((s, i) => (
                  <div key={i} className="text-xs bg-muted/30 border border-white/5 p-3 rounded-xl flex gap-3">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                    <p className="opacity-80">{s}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setIsReportOpen(false)} className="w-full font-bold h-12 shadow-lg shadow-primary/10">Proceed</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
