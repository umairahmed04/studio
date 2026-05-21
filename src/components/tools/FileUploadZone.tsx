"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { logAnalyticsEvent } from '@/lib/analytics';

interface FileUploadZoneProps {
  onTextExtracted: (text: string) => void;
  className?: string;
}

export function FileUploadZone({ onTextExtracted, className }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const processFile = async (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    setIsLoading(true);

    // Analytics: Track File Upload
    if (db) {
      logAnalyticsEvent(db, {
        type: 'tool_use',
        path: window.location.pathname,
        sessionId: 'anonymous',
        userId: user?.uid,
        label: `Upload: ${fileType}`
      });
    }

    try {
      if (fileType === 'txt') {
        const text = await file.text();
        onTextExtracted(text);
      } else if (fileType === 'pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }

        if (!fullText.trim()) throw new Error("No readable text found.");
        onTextExtracted(fullText);
      } else if (fileType === 'docx') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onTextExtracted(result.value);
      } else {
        toast({ title: "Unsupported File", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      toast({ title: "File Processed" });
    } catch (error: any) {
      toast({ title: "Extraction Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
        isLoading && "pointer-events-none opacity-60",
        className
      )}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.txt" className="hidden" />
      <div className="space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
        </div>
        <div>
          <h4 className="font-bold text-lg">Drag & drop your resume</h4>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? "Parsing document..." : "or click to browse"}</p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="px-3 py-1 rounded bg-background border text-[10px] font-bold">PDF</div>
          <div className="px-3 py-1 rounded bg-background border text-[10px] font-bold">DOCX</div>
        </div>
      </div>
    </div>
  );
}
