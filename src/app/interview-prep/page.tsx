'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Sparkles, 
  Briefcase, 
  UserCheck, 
  Mic, 
  History, 
  ArrowRight, 
  Loader2, 
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { generateInterviewQuestions } from '@/ai/flows/interview-prep-flow';
import { useToast } from '@/hooks/use-toast';

export default function InterviewPrepLanding() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [starting, setStarting] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    experienceLevel: 'Mid-Level',
    type: 'HR'
  });

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: history, loading: historyLoading } = useCollection(historyQuery);

  const handleStart = async () => {
    if (!user || !db) {
      router.push('/login?redirect=/interview-prep');
      return;
    }

    if (!formData.jobTitle) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter a target job title." });
      return;
    }

    setStarting(true);
    try {
      toast({ title: "AI Interviewer Ready", description: "Generating custom questions for your profile..." });
      
      const session = await generateInterviewQuestions({
        ...formData,
        resumeContent: '' // Logic can be added here to pull latest resume text if needed
      });

      const docRef = await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        ...formData,
        questions: session.questions,
        status: 'active',
        currentQuestionIndex: 0,
        responses: [],
        createdAt: serverTimestamp()
      });

      router.push(`/interview-prep/${docRef.id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: error.message });
      setStarting(false);
    }
  };

  return (
    <ToolLayout 
      title="AI Interview Preparation" 
      description="Practice high-stakes interviews with our real-time AI coach. Master the STAR method and boost your confidence."
      badge="Voice Interaction Enabled"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        {/* SETUP COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass border-primary/20 shadow-2xl shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Bot size={22} />
                </div>
                <div>
                  <CardTitle className="text-xl">Session Architect</CardTitle>
                  <CardDescription>Configure your practice environment.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                  <Target size={10} /> Target Job Title
                </Label>
                <Input 
                  placeholder="e.g. Senior Software Engineer" 
                  className="h-12 text-lg font-bold"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Seniority</Label>
                  <Select value={formData.experienceLevel} onValueChange={(v) => setFormData({...formData, experienceLevel: v})}>
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fresh Graduate">Fresh Graduate</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior / Lead</SelectItem>
                      <SelectItem value="Executive">Executive / VP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Interview Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR Round</SelectItem>
                      <SelectItem value="Technical">Technical Round</SelectItem>
                      <SelectItem value="Managerial">Managerial Round</SelectItem>
                      <SelectItem value="Behavioral">Behavioral (STAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                <Zap className="text-primary shrink-0" size={18} />
                <p className="text-[11px] leading-relaxed text-muted-foreground italic">
                  AI will use your current saved resume and these details to craft industry-specific challenges.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button 
                onClick={handleStart} 
                disabled={starting}
                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
              >
                {starting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing AI Coach...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Voice Interview
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* INFO/HISTORY COLUMN */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard 
              icon={<UserCheck />} 
              title="HR Readiness" 
              desc="Practice situational answers that impress recruitment leaders." 
            />
            <InfoCard 
              icon={<Zap />} 
              title="STAR Method" 
              desc="Our AI detects and coaches you on Situation, Task, Action, Result." 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2">
              <History size={20} className="text-primary" />
              Practice History
            </h3>
            {historyLoading ? (
              <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : !history || history.length === 0 ? (
              <Card className="p-12 border-dashed border-2 text-center bg-muted/5">
                <Trophy size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground italic">No sessions yet. Your first audit is waiting.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((session: any) => (
                  <Card key={session.id} className="glass hover:border-primary/40 transition-all cursor-pointer overflow-hidden group" onClick={() => router.push(`/interview-prep/${session.id}`)}>
                    <CardContent className="p-5 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{session.jobTitle}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-[8px] uppercase">{session.type}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar size={10} /> {formatDistanceToNow(session.createdAt?.toDate() || new Date(), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.report?.overallScore ? (
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase text-muted-foreground">Score</p>
                             <p className="text-lg font-black text-primary leading-none">{session.report.overallScore}%</p>
                          </div>
                        ) : (
                          <Badge className="bg-amber-500 text-[9px] uppercase">In Progress</Badge>
                        )}
                        <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function InfoCard({ icon, title, desc }: any) {
  return (
    <Card className="glass border-white/5">
      <CardContent className="p-6 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}