"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { jobDescriptionMatcher, type JobDescriptionMatcherOutput } from '@/ai/flows/job-description-matcher';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, Target, Zap, Search, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from '@/components/tools/FileUploadZone';

export default function JobDescriptionMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobDescriptionMatcherOutput | null>(null);
  const { toast } = useToast();

  const handleMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    try {
      const output = await jobDescriptionMatcher({ 
        resumeText: resumeText,
        jobDescriptionText: jobDescription
      });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="Job Description Matcher" 
      description="Compare your resume to any job description and see how well you match."
      badge="Smart Analysis"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              Paste Job Description
            </CardTitle>
            <CardDescription>Copy and paste the full job posting text here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Job Title, Requirements, Responsibilities..." 
              className="min-h-[300px] text-sm resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-accent" size={20} />
              Your Resume
            </CardTitle>
            <CardDescription>Upload your document or paste your resume content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resumeText ? (
              <FileUploadZone onTextExtracted={(text) => setResumeText(text)} />
            ) : (
              <div className="relative">
                <Textarea 
                  placeholder="Experience, Skills, Summary..." 
                  className="min-h-[300px] text-sm resize-none"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                  onClick={() => setResumeText('')}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mb-12">
        <Button 
          size="lg" 
          onClick={handleMatch} 
          disabled={loading || !resumeText.trim() || !jobDescription.trim()}
          className="px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Matching Skills...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze Match
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="glass border-primary/30 overflow-hidden">
            <div className="bg-primary/10 p-6 flex items-center justify-between border-b border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {result.matchPercentage}%
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Match Percentage</h3>
                  <p className="text-muted-foreground text-sm">Based on skills, keywords, and experience alignment.</p>
                </div>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
                {result.matchPercentage > 80 ? 'Perfect Match' : result.matchPercentage > 60 ? 'Strong Match' : 'Weak Match'}
              </Badge>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-500" />
                      Matched Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <AlertCircle size={18} className="text-red-500" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Target size={18} className="text-accent" />
                      Critical Missing Skills
                    </h4>
                    <ul className="space-y-3">
                      {result.missingSkills.map((skill, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-accent font-bold">•</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-500" />
                      Optimization Tips
                    </h4>
                    <ul className="space-y-3">
                      {result.optimizationSuggestions.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-sm p-3 rounded bg-muted/30 border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i+1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolLayout>
  );
}
