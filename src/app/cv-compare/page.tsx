"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { atsCompatibilityAnalysis, type AtsCompatibilityAnalysisOutput } from '@/ai/flows/ats-compatibility-analysis-flow';
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
  ArrowRight, 
  Wand2, 
  LogIn,
  ArrowLeftRight,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CVCompareMatch() {
  const [resumeText, setResumeText] = useState('');
  const [comparisonText, setComparisonText] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'same_industry' | 'industry_switch'>('same_industry');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsCompatibilityAnalysisOutput | null>(null);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !comparisonText.trim()) return;
    setLoading(true);
    try {
      const output = await atsCompatibilityAnalysis({ 
        resumeContent: resumeText,
        comparisonContent: comparisonText,
        mode: analysisMode 
      });
      
      setResult(output);

      if (user && db) {
        const scanRef = collection(db, 'users', user.uid, 'scans');
        addDoc(scanRef, {
          title: resumeText.slice(0, 30) + '...',
          score: output.score,
          feedback: output.recommendations.join('. '),
          missingKeywords: output.missing_keywords,
          timestamp: serverTimestamp(),
          isComparison: true,
          analysisMode: analysisMode
        }).catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: scanRef.path,
            operation: 'create',
            requestResourceData: output,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      }
      
      toast({
        title: "Comparison Complete",
        description: "Your side-by-side match report is ready."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred. Please check your API configuration."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="CV Compare & Match" 
      description="Upload two resumes to see side-by-side advantages and find your winning edge against competitors or target job descriptions."
      badge="Comparison Engine"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Comparison Config</CardTitle>
              <CardDescription>Setup your analysis parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Analysis Logic</Label>
                <Select value={analysisMode} onValueChange={(v: any) => setAnalysisMode(v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same_industry">Same Industry Comparison</SelectItem>
                    <SelectItem value="industry_switch">Industry Switch (Pivot)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Your Target Resume (cvA)</Label>
                {!resumeText ? (
                  <FileUploadZone onTextExtracted={(text) => setResumeText(text)} className="p-6" />
                ) : (
                  <div className="relative animate-in fade-in duration-300">
                    <Textarea 
                      placeholder="Paste your resume..." 
                      className="min-h-[150px] font-mono text-xs resize-none"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80" onClick={() => setResumeText('')}>
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Competitor CV / Job Description (cvB)</Label>
                {!comparisonText ? (
                  <FileUploadZone onTextExtracted={(text) => setComparisonText(text)} className="p-6" />
                ) : (
                  <div className="relative animate-in fade-in duration-300">
                    <Textarea 
                      placeholder="Paste the comparison resume or target JD here..." 
                      className="min-h-[150px] font-mono text-xs resize-none"
                      value={comparisonText}
                      onChange={(e) => setComparisonText(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80" onClick={() => setComparisonText('')}>
                      <X size={14} />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  AI will analyze gaps and word choice advantages between A and B.
                </p>
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !resumeText.trim() || !comparisonText.trim()}
                className="w-full h-12 text-lg font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <><ArrowLeftRight className="mr-2 h-5 w-5" /> Compare & Audit</>
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
                    <ArrowLeftRight size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Waiting for Match</h3>
                    <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                      Provide both resumes to generate a side-by-side comparison report.
                    </p>
                  </div>
                </div>
              </Card>
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
                           Comparison Report
                         </Badge>
                         {result.score >= 70 ? (
                          <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Strong Candidate</Badge>
                        ) : (
                          <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Optimization Required</Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold">Match Analysis</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        We found {result.missing_keywords.length} critical gaps when comparing your CV against the target. {result.recommendations[0]}
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
                        <h4 className="font-bold text-lg">Fix Gaps with AI</h4>
                      </div>
                      <p className="text-xs text-white/80 max-w-sm">
                        Automatically rewrite your CV to close these comparison gaps and boost your matching edge.
                      </p>
                    </div>
                    <Button asChild size="lg" variant="secondary" className="font-bold px-8 shadow-2xl group-hover:scale-105 transition-transform">
                      <Link href={user ? "/resume-optimizer" : "/login?redirect=/resume-optimizer"}>
                        {user ? <><Wand2 size={18} className="mr-2" /> Optimize My CV</> : <><LogIn size={18} className="mr-2" /> Sign In to Optimize</>}
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="breakdown" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 p-1">
                  <TabsTrigger value="breakdown" className="h-full"><BarChart3 size={16} className="mr-2" /> Side-by-Side</TabsTrigger>
                  <TabsTrigger value="keywords" className="h-full"><ListFilter size={16} className="mr-2" /> Keyword Gaps</TabsTrigger>
                  <TabsTrigger value="plan" className="h-full"><LayoutPanelLeft size={16} className="mr-2" /> Roadmap</TabsTrigger>
                </TabsList>
                
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
                      <CardHeader className="py-4 bg-red-500/5 border-b"><CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2 uppercase tracking-widest"><Activity size={14} /> Comparison Gaps</CardTitle></CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {result.weaknesses.map((w, i) => (
                          <div key={i} className="text-xs flex gap-2"><AlertCircle size={12} className="text-red-500 shrink-0" /> {w}</div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  {Object.entries(result.section_feedback).map(([section, feedback], idx) => (
                    feedback && (
                      <Card key={idx} className="glass">
                        <CardContent className="p-6">
                          <h4 className="font-bold capitalize mb-2">{section} Review</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">"{feedback}"</p>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </TabsContent>

                <TabsContent value="keywords" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass border-green-500/20">
                      <CardHeader className="py-4 bg-green-500/5 border-b border-green-500/10"><CardTitle className="text-xs font-bold text-green-600 flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 size={14} /> Shared Keywords</CardTitle></CardHeader>
                      <CardContent className="p-4"><div className="flex flex-wrap gap-1.5">{result.found_keywords.map((kw, i) => (<Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600 border-none text-[10px]">{kw}</Badge>))}</div></CardContent>
                    </Card>
                    <Card className="glass border-red-500/20">
                      <CardHeader className="py-4 bg-red-500/5 border-b border-green-500/10"><CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={14} /> Missing from Comparison</CardTitle></CardHeader>
                      <CardContent className="p-4"><div className="flex flex-wrap gap-1.5">{result.missing_keywords.map((kw, i) => (<Badge key={i} variant="secondary" className="bg-red-500/10 text-red-600 border-none text-[10px]">{kw}</Badge>))}</div></CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="pt-4 space-y-4">
                  <Card className="glass">
                    <CardContent className="p-6">
                      <h4 className="font-bold mb-4">Improvement Roadmap</h4>
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