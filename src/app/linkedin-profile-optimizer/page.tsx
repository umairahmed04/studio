"use client";

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { analyzeLinkedInProfile, type LinkedInProfileAnalysisOutput } from '@/ai/flows/linkedin-profile-analysis-flow';
import { Loader2, Linkedin, Search, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Target, Zap, Lock, LogIn } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { fetchLinkedInMetadata } from '@/app/actions/linkedin-fetch';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function LinkedInProfileOptimizer() {
  const [profileUrl, setProfileUrl] = useState('');
  const [profileContent, setProfileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<LinkedInProfileAnalysisOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  // Auto-fetch metadata when URL is entered
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (profileUrl.includes('linkedin.com/in/') && profileUrl.length > 25) {
        handleAutoFetch();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [profileUrl]);

  const handleAutoFetch = async () => {
    if (profileContent) return; // Don't overwrite if user already pasted
    setFetching(true);
    try {
      const response = await fetchLinkedInMetadata(profileUrl);
      if (response.success && response.data) {
        setProfileContent(response.data.fullText);
        toast({
          title: "Profile Metadata Found",
          description: "We've fetched your public headline. Please paste your full 'About' section for a better audit."
        });
      }
    } catch (error) {
      // Silent fail for auto-fetch
    } finally {
      setFetching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!profileContent.trim()) return;
    setLoading(true);
    try {
      const output = await analyzeLinkedInProfile({ profileUrl, profileContent });
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An error occurred. Please ensure you've pasted enough profile content."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="LinkedIn Profile Optimizer" 
      description="Get a comprehensive audit of your LinkedIn presence with a professional score and tips."
      badge="Profile Audit"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="text-blue-500" size={20} />
                Profile Details
              </CardTitle>
              <CardDescription>Enter your URL and paste your profile sections for analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Profile URL</label>
                  {fetching && <span className="text-[10px] text-blue-500 animate-pulse flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Fetching...</span>}
                </div>
                <Input 
                  placeholder="linkedin.com/in/yourname" 
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className={fetching ? "border-blue-500/50" : ""}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Profile Content</label>
                <Textarea 
                  placeholder="Paste your Headline, About section, and Experience here..." 
                  className="min-h-[300px] text-sm resize-none"
                  value={profileContent}
                  onChange={(e) => setProfileContent(e.target.value)}
                />
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-2">
                  <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    <strong>Tip:</strong> LinkedIn restricts direct fetching of full profiles. For the best AI analysis, please <strong>copy and paste</strong> your About and Experience sections manually.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !profileContent.trim()}
                className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Search size={18} className="mr-2" />}
                Analyze Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <Card className="h-full border-dashed flex items-center justify-center p-12 text-center bg-muted/10">
              <div className="space-y-4">
                <TrendingUp size={48} className="mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Submit your profile data to see your optimization score and suggestions.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="glass border-blue-500/20 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                        <circle
                          cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={364} strokeDashoffset={364 - (364 * result.overallScore) / 100}
                          strokeLinecap="round" className="text-blue-500 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-headline font-bold">{result.overallScore}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Score</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="text-2xl font-bold">Optimization Summary</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">"{result.summary}"</p>
                      <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                        {result.overallScore >= 80 ? (
                          <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Highly Competitive</Badge>
                        ) : (
                          <Badge className="bg-amber-500"><AlertCircle className="w-3 h-3 mr-1" /> Needs Polish</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!user ? (
                <Card className="glass border-primary/20 bg-primary/5 border-dashed">
                  <CardContent className="p-12 text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Lock size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold">Unlock Professional Audit</h4>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Sign in to reveal specific category scores, quantified feedback, and target keywords to boost your profile ranking.
                      </p>
                    </div>
                    <Button asChild size="lg" className="font-bold px-8 h-12 shadow-xl shadow-primary/20">
                      <Link href="/login">
                        <LogIn size={18} className="mr-2" />
                        Sign In to Unlock
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {result.sections.map((section, idx) => (
                      <Card key={idx} className="glass">
                        <CardHeader className="py-4 border-b bg-muted/5">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-bold">{section.category}</CardTitle>
                            <span className="text-sm font-bold text-blue-500">{section.score}%</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <p className="text-sm text-foreground/80">{section.feedback}</p>
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                              <Sparkles size={10} className="text-blue-400" />
                              Fixes to Boost Score
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {section.suggestions.map((s, i) => (
                                <li key={i} className="text-[11px] bg-blue-500/5 border border-blue-500/10 p-2 rounded-lg flex gap-2">
                                  <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="text-blue-500" size={16} />
                        Target Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {result.topKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-none">
                          {kw}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
