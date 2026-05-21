"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { generateCoverLetter, type GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generator';
import { Loader2, Copy, FileText, Send, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from '@/components/tools/FileUploadZone';

export default function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateCoverLetterOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim() || !roleTitle.trim()) return;
    setLoading(true);
    try {
      const output = await generateCoverLetter({ 
        resumeContent: resumeText,
        jobDescription: jobDescription,
        roleTitle: roleTitle
      });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Cover letter is ready to paste."
    });
  };

  return (
    <ToolLayout 
      title="AI Cover Letter Generator" 
      description="Create a compelling, personalized cover letter based on your resume and target role."
      badge="Smart Letters"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Target Role Title</label>
                <Input 
                  placeholder="e.g. Senior Software Engineer" 
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Job Description</label>
                <Textarea 
                  placeholder="Paste the job description here..." 
                  className="min-h-[150px] text-sm resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Your Resume</label>
                {!resumeText ? (
                  <FileUploadZone onTextExtracted={(text) => setResumeText(text)} className="p-4" />
                ) : (
                  <div className="relative">
                    <Textarea 
                      placeholder="Resume content..." 
                      className="min-h-[150px] text-sm resize-none"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80"
                      onClick={() => setResumeText('')}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !resumeText.trim() || !jobDescription.trim() || !roleTitle.trim()}
                className="w-full h-12 font-bold"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                Generate Letter
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {!result ? (
            <Card className="h-full border-dashed flex items-center justify-center p-12 text-center bg-muted/10">
              <div className="space-y-4">
                <FileText size={48} className="mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Provide your details on the left to generate your personalized cover letter.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="glass h-full animate-in fade-in slide-in-from-right-4">
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Your Cover Letter
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.coverLetter)}>
                  <Copy size={16} className="mr-2" />
                  Copy Text
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {result.coverLetter}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
