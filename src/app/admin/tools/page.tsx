'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Save, Wand2, Search, ArrowLeftRight, FileText, Target, ShieldCheck, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ToolControl() {
  const db = useFirestore();
  const { toast } = useToast();
  const settingsRef = db ? doc(db, 'settings', 'global') : null;
  const { data: settings, loading } = useDoc(settingsRef);
  
  const [tools, setTools] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.tools) {
      setTools(settings.tools);
    } else if (!loading) {
      setTools({
        atsCheckerEnabled: true,
        resumeOptimizerEnabled: true,
        coverLetterEnabled: true,
        cvCompareEnabled: true,
        jobMatcherEnabled: true,
        linkedinAuditEnabled: true
      });
    }
  }, [settings, loading]);

  const handleSave = async () => {
    if (!settingsRef || !tools) return;
    setSaving(true);
    try {
      await setDoc(settingsRef, { tools }, { merge: true });
      toast({ title: "Tools Updated", description: "AI feature visibility has been updated across the site." });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update tool settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tools) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const toolList = [
    { id: 'atsCheckerEnabled', label: 'ATS Resume Scan', desc: 'Main resume scoring and audit tool.', icon: Search },
    { id: 'cvCompareEnabled', label: 'CV Compare & Match', desc: 'Side-by-side resume comparison.', icon: ArrowLeftRight },
    { id: 'resumeOptimizerEnabled', label: 'AI Resume Optimizer', desc: 'Bullet point and content rewriter.', icon: Wand2 },
    { id: 'jobMatcherEnabled', label: 'Job Description Matcher', desc: 'Keyword alignment for specific jobs.', icon: Target },
    { id: 'coverLetterEnabled', label: 'Cover Letter Builder', desc: 'Personalized application letter generator.', icon: FileText },
    { id: 'linkedinAuditEnabled', label: 'LinkedIn Profile Audit', desc: 'Professional social presence scanner.', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">AI Tool Control</h1>
          <p className="text-muted-foreground">Manage the visibility and availability of AI features site-wide.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 font-bold shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Save Tool Config
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toolList.map((tool) => (
          <Card key={tool.id} className="hover:border-primary/20 transition-all border-white/5 bg-card/50 backdrop-blur relative overflow-hidden">
            {!tools[tool.id] && (
              <div className="absolute top-0 right-0 p-2">
                <Badge variant="destructive" className="text-[9px] uppercase font-black">Disabled</Badge>
              </div>
            )}
            <CardContent className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <tool.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tool.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              <Switch 
                checked={tools[tool.id]} 
                onCheckedChange={(checked) => setTools({ ...tools, [tool.id]: checked })} 
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 bg-muted/5">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Sparkles size={20} />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="font-bold">Dynamic Feature Toggles</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disabling a tool here will immediately remove it from the Navbar and all public-facing navigation menus for all users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
