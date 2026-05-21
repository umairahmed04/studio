
"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { atsCompatibilityAnalysis, type AtsCompatibilityAnalysisOutput } from '@/ai/flows/ats-compatibility-analysis-flow';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  ListFilter, 
  LayoutPanelLeft, 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  FileSearch, 
  Search, 
  ArrowRight, 
  Wand2, 
  LogIn,
  Target,
  Trophy,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FileUploadZone } from '@/components/tools/FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';

export default function ATSResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsCompatibilityAnalysisOutput | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const output = await atsCompatibilityAnalysis({ 
        resumeContent: resumeText,
        mode: 'same_industry' 
      });
      
      setResult(output);

      // System Upgrade: Sync to Session & Firestore
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_extracted_cv', resumeText);
      }

      if (user && db) {
        setSyncing(true);
        const scanRef = collection(db, 'users', user.uid, 'scans');
        addDoc(scanRef, {
          title: resumeText.slice(0, 30) + '...',
          score: output.score,
          feedback: output.recommendations.join('. '),
          missingKeywords: output.missing_keywords,
          timestamp: serverTimestamp(),
          isComparison: false
        }).catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: scanRef.path,
            operation: 'create',
            requestResourceData: output,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

        // Auto-provision a "Draft" CV for seamless Builder transition
        const cvRef = collection(db, 'users', user.uid, 'cvs');
        const docRef = await addDoc(cvRef, {
          title: `Scanned CV (${new Date().toLocaleDateString()})`,
          templateId: 'professional',
          content: {
            personalInfo: { 
              fullName: user.displayName || '', 
              email: user.email || '', 
              phone: '', 
              location: '', 
              summary: resumeText 
            },
            experience: [],
            education: [],
            skills: { technical: output.found_keywords, soft: [], tools: [] },
            projects: []
          },
          settings: { dateFormat: 'MM/YYYY', colorAccent: '#3b82f6' },
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          status: 'draft'
        });
        
        sessionStorage.setItem('active_cv_id', docRef.id);

        addDoc(collection(db, 'users', user.uid, 'activityLog'), {
          type: 'optimize',
          timestamp: serverTimestamp(),
          details: { 
            tool: 'ATS Resume Checker',
            title: `ATS Audit (Score: ${output.score})`
          }
        });
        setSyncing(false);
      }
      
      toast({
        title: "Scan Complete",
        description: "Your ATS audit has been generated and synced."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Scanning Failed",
        description: error.message || "An unexpected error occurred. Please check your API configuration."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRedirect = () => {
    if (!user) {
      router.push('/login?redirect=/resume-optimizer');
      return;
    }
    const cvId = sessionStorage.getItem('active_cv_id');
    router.push(`/resume-optimizer${cvId ? `?cvId=${cvId}` : ''}`);
  };

  return (
    <ToolLayout 
      title="ATS Resume Scan" 
      description="Professional AI-driven resume audit using our high-performance analysis engine. Beat the bots and land more interviews."
      badge="v2.0 Analysis Engine"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Resume Audit</CardTitle>
              <CardDescription>Upload your document for a deep structural scan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Resume Content</Label>
                {!resumeText ? (
                  <FileUploadZone onTextExtracted={(text) => setResumeText(text)} className="p-6" />
                ) : (
                  <div className="relative animate-in fade-in duration-300">
                    <Textarea 
                      placeholder="Paste your resume..." 
                      className="min-h-[300px] font-mono text-xs resize-none"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 h-6 rounded-full bg-background/80" onClick={() => setResumeText('')}>
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !resumeText.trim()}
                className="w-full h-12 text-lg font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Perform Deep Scan'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="h-full flex flex-col gap-6">
              <Card className="flex-1 border-dashed flex items-center justify-center p-12 text-center bg-muted/10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Target size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Waiting for Audit</h3>
                    <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                      Our model is ready to scan your document. Upload your CV to begin.
                    </p>
                  </div>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 glass text-xs flex gap-3 items-center"><Zap className="text-primary w-4 h-4" /> Structured Logic</Card>
                <Card className="p-4 glass text-xs flex gap-3 items-center"><ShieldCheck className="text-green-500 w-4 h-4" /> Recruiter Approved</Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="glass border-primary/20 bg-primary/5">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                        <circle
                          cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={440} strokeDashoffset={440 - (440 * result.score) / 100}
                          strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-headline font-bold">{result.score}</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase">Match Score</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                         <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-widest">
                           ATS Audit
                         </Badge>
                         {result.score >= 70 ? (
                          <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Strong Candidate</Badge>
                        ) : (
                          <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Optimization Required</Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold">Analysis Results</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {result.strengths.slice(0, 2).join(' ')} {result.recommendations[0]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ACTION CTA */}
              <Card className="border-primary/30 shadow-xl shadow-primary/5 bg-gradient-to-br from-primary to-accent text-white overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                        <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                        <h4 className="font-bold text-lg">Fix These Issues with AI</h4>
                      </div>
                      <p className="text-xs text-white/80 max-w-sm">
                        Automatically rewrite your CV to address these {result.weaknesses.length} weaknesses and boost your score.
                      </p>
                    </div>
                    <Button onClick={handleOptimizeRedirect} size="lg" variant="secondary" className="font-bold px-8 shadow-2xl group-hover:scale-105 transition-transform">
                      {syncing ? <Loader2 className="animate-spin mr-2" /> : user ? <><Wand2 size={18} className="mr-2" /> Optimize My CV</> : <><LogIn size={18} className="mr-2" /> Sign In to Optimize</>}
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="audit" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 p-1">
                  <TabsTrigger value="audit" className="h-full"><FileSearch size={16} className="mr-2" /> Audit</TabsTrigger>
                  <TabsTrigger value="breakdown" className="h-full"><BarChart3 size={16} className="mr-2" /> Breakdown</TabsTrigger>
                  <TabsTrigger value="keywords" className="h-full"><ListFilter size={16} className="mr-2" /> Keywords</TabsTrigger>
                  <TabsTrigger value="plan" className="h-full"><LayoutPanelLeft size={16} className="mr-2" /> Strategy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="audit" className="pt-4">
                   <Card className="glass">
                    <CardHeader className="py-4 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Search size={14} className="text-primary" />
                        Industry Keywords Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="bg-muted/30 rounded-xl p-6 border border-white/5 max-h-[400px] overflow-y-auto">
                        <KeywordHighlightedText text={resumeText} foundKeywords={result.found_keywords} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="breakdown" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass border-green-500/20">
                      <CardHeader className="py-4 bg-green-500/5 border-b"><CardTitle className="text-xs font-bold text-green-600 flex items-center gap-2 uppercase tracking-widest"><Trophy size={14} /> Your Strengths</CardTitle></CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {result.strengths.map((s, i) => (
                          <div key={i} className="text-xs flex gap-2"><CheckCircle2 size={12} className="text-green-500 shrink-0" /> {s}</div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="glass border-red-500/20">
                      <CardHeader className="py-4 bg-red-500/5 border-b"><CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2 uppercase tracking-widest"><Activity size={14} /> Gaps to Close</CardTitle></CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {result.weaknesses.map((w, i) => (
                          <div key={i} className="text-xs flex gap-2"><AlertCircle size={12} className="text-red-500 shrink-0" /> {w}</div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="keywords" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass border-green-500/20">
                      <CardHeader className="py-4 bg-green-500/5 border-b border-green-500/10"><CardTitle className="text-xs font-bold text-green-600 flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 size={14} /> Keywords Found</CardTitle></CardHeader>
                      <CardContent className="p-4"><div className="flex flex-wrap gap-1.5">{result.found_keywords.map((kw, i) => (<Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 border-none text-[10px]">{kw}</Badge>))}</div></CardContent>
                    </Card>
                    <Card className="glass border-red-500/20">
                      <CardHeader className="py-4 bg-red-500/5 border-b border-green-500/10"><CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={14} /> Missing Keywords</CardTitle></CardHeader>
                      <CardContent className="p-4"><div className="flex flex-wrap gap-1.5">{result.missing_keywords.map((kw, i) => (<Badge key={i} variant="secondary" className="bg-red-500/10 text-red-600 border-none text-[10px]">{kw}</Badge>))}</div></CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="pt-4 space-y-4">
                  <Card className="glass">
                    <CardContent className="p-6">
                      <h4 className="font-bold mb-4">Final Optimization Strategy</h4>
                      <div className="space-y-4">
                        {result.final_action_plan.map((step, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/50 border flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

function KeywordHighlightedText({ text, foundKeywords }: { text: string; foundKeywords: string[] }) {
  if (!foundKeywords.length) return <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>;
  const escapedKeywords = foundKeywords.filter(kw => kw.trim().length > 0).sort((a, b) => b.length - a.length).map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <p className="whitespace-pre-wrap text-[13px] font-mono leading-relaxed text-muted-foreground">
      {parts.map((part, i) => {
        const isMatch = foundKeywords.some(kw => kw.toLowerCase() === part.toLowerCase());
        return isMatch ? <span key={i} className="bg-green-500/20 text-green-700 px-0.5 rounded font-bold border-b-2 border-green-500/40">{part}</span> : part;
      })}
    </p>
  );
}
