
"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { optimizeResume, type ResumeOptimizerOutput } from '@/ai/flows/resume-optimizer';
import { Sparkles, Loader2, Copy, CheckCircle2, Wand2, FileText, X, FileEdit, FileDown, Download, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from '@/components/tools/FileUploadZone';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResumeOptimizer() {
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ResumeOptimizerOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const handleOptimize = async () => {
    if (!resumeContent.trim()) return;
    setLoading(true);
    try {
      const output = await optimizeResume({ 
        resumeContent,
        jobDescription: jobDescription.trim() || undefined
      });
      setResult(output);

      // Log activity
      if (user && db) {
        addDoc(collection(db, 'users', user.uid, 'activityLog'), {
          type: 'optimize',
          timestamp: serverTimestamp(),
          details: { 
            tool: 'Resume Optimizer',
            title: 'AI content rewrite'
          }
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: "An error occurred while optimizing your resume. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The optimized content is ready to be pasted."
    });
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([result.optimizedResumeContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "optimized-resume.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleExportToBuilder = async () => {
    if (!user || !db || !result) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your optimized resume to the builder.",
        variant: "destructive"
      });
      return;
    }

    setExporting(true);
    try {
      const resumeRef = collection(db, 'users', user.uid, 'resumes');
      const docRef = await addDoc(resumeRef, {
        userId: user.uid,
        title: `Optimized Resume (${new Date().toLocaleDateString()})`,
        templateId: 'professional',
        content: {
          personalInfo: { 
            fullName: user.displayName || '', 
            email: user.email || '', 
            phone: '', 
            location: '', 
            summary: result.optimizedResumeContent 
          },
          experience: [],
          education: [],
          skills: { technical: [], soft: [], tools: [] },
          projects: []
        },
        settings: { dateFormat: 'MM/YYYY', colorAccent: '#3b82f6' },
        updatedAt: serverTimestamp()
      });
      
      addDoc(collection(db, 'users', user.uid, 'activityLog'), {
        type: 'create',
        cvId: docRef.id,
        timestamp: serverTimestamp(),
        details: { title: 'Imported from AI Optimizer' }
      });

      toast({
        title: "Exported successfully",
        description: "Taking you to the CV Builder to choose a template."
      });
      
      router.push(`/cv-builder/${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not create a resume entry. Please try again."
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ToolLayout 
      title="AI Resume Optimizer" 
      description="Transform weak bullet points into high-impact achievement statements instantly."
      badge="AI Rewrite"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Input Resume
              </CardTitle>
              <CardDescription>Drag and drop your PDF/Word file or paste your bullet points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!resumeContent && (
                <FileUploadZone onTextExtracted={(text) => setResumeContent(text)} />
              )}
              
              {resumeContent && (
                <div className="relative animate-in fade-in duration-300">
                  <Textarea 
                    placeholder="Paste details to optimize..." 
                    className="min-h-[300px] text-sm resize-none"
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                    onClick={() => setResumeContent('')}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="glass opacity-80 hover:opacity-100 transition-opacity">
            <CardHeader className="py-4">
              <CardTitle className="text-base">
                Optional: Tailor to Job
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste job description to tailor keywords..." 
                className="min-h-[100px] text-sm resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!result ? (
            <Card className="h-full border-dashed flex items-center justify-center p-12 text-center bg-muted/10">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                  <Sparkles size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to Rewrite</h3>
                  <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                    Provide your resume content to transform it with professional action verbs.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleOptimize} 
                  disabled={loading || !resumeContent.trim()}
                  className="px-10 h-14 text-lg font-bold w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      AI Optimizing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Optimize Resume
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full">
              <Card className="glass border-primary/30 h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary" size={20} />
                    Optimized Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.optimizedResumeContent)} title="Copy to clipboard">
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDownloadTxt} title="Download as TXT">
                      <Download size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="p-6 bg-muted/20 border-b">
                    <h4 className="font-bold text-primary uppercase text-[10px] tracking-widest mb-2">Improvements Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.improvementsSummary}</p>
                  </div>
                  <div className="p-6 flex-1 bg-background/50 overflow-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[350px]">
                      {result.optimizedResumeContent}
                    </pre>
                  </div>
                  <div className="p-4 bg-muted/10 border-t flex flex-col gap-3">
                    {!user ? (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center space-y-3">
                        <p className="text-xs text-muted-foreground">Sign in to unlock CV Builder and PDF export.</p>
                        <Button className="w-full font-bold" asChild>
                          <Link href="/login"><LogIn size={16} className="mr-2" /> Sign In to Export</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full font-bold" 
                          onClick={handleExportToBuilder}
                          disabled={exporting}
                        >
                          {exporting ? <Loader2 className="animate-spin mr-2" /> : <FileEdit className="mr-2" size={16} />}
                          Edit in CV Builder
                        </Button>
                        <Button 
                          className="w-full font-bold"
                          onClick={handleExportToBuilder}
                          disabled={exporting}
                        >
                          <FileDown className="mr-2" size={16} />
                          Download as PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {result && (
        <div className="flex justify-center pt-8">
           <Button variant="ghost" size="lg" onClick={() => setResult(null)} className="text-muted-foreground">
            Start New Optimization
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
