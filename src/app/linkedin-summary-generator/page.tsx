"use client";

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateLinkedInSummary, type LinkedInSummaryGeneratorOutput } from '@/ai/flows/linkedin-summary-generator';
import { Loader2, Copy, Linkedin, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LinkedInSummaryGenerator() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInSummaryGeneratorOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const output = await generateLinkedInSummary({ resumeText });
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
      description: "LinkedIn summary copied!"
    });
  };

  return (
    <ToolLayout 
      title="LinkedIn Summary Generator" 
      description="Create a professional, keyword-rich LinkedIn summary that attracts recruiters."
      badge="Profile Booster"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Resume Content</CardTitle>
            <CardDescription>Paste your resume text to generate a professional "About" section for LinkedIn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea 
              placeholder="Paste your resume here..." 
              className="min-h-[250px] text-sm resize-none"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <Button 
              size="lg"
              onClick={handleGenerate} 
              disabled={loading || !resumeText.trim()}
              className="w-full font-bold h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Generating Profile...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={18} />
                  Create LinkedIn Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="glass border-blue-500/30 animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-500/10 py-4 bg-blue-500/5">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Linkedin size={20} />
                Generated LinkedIn "About" Section
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.linkedInSummary)}>
                <Copy size={16} className="mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-muted/30 p-6 rounded-xl border border-white/5 whitespace-pre-wrap italic leading-relaxed text-sm">
                "{result.linkedInSummary}"
              </div>
              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-primary/5 text-xs text-muted-foreground border border-primary/10">
                <Sparkles size={16} className="text-primary shrink-0" />
                <span>Tip: Recruiters look for keywords and a clear call to action in your summary. We've included industry-specific terms from your resume.</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
