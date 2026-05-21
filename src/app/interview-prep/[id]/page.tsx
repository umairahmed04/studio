'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Mic, 
  Square, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Timer,
  ChevronRight,
  Trophy,
  Target,
  Wand2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeInterviewAnswer, generateInterviewReport } from '@/ai/flows/interview-prep-flow';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewSession() {
  const { id } = useParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const sessionRef = useMemo(() => (user && db && id) ? doc(db, 'users', user.uid, 'interviews', id as string) : null, [user, db, id]);
  const { data: session, loading: sessionLoading } = useDoc(sessionRef);

  const [currentIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 min per answer
  
  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interim += event.results[i][0].transcript;
          }
        }
      };
    }
  }, []);

  useEffect(() => {
    if (session?.status === 'completed') return;
    let timer: any;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft, session?.status]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ variant: "destructive", title: "Unsupported Browser", description: "Please use Chrome or Edge for voice support." });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setTimeLeft(120);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const currentQuestion = session?.questions?.[currentIndex];

  const handleNext = async () => {
    if (!transcript.trim()) return;
    if (!sessionRef || !currentQuestion) return;

    setAnalyzing(true);
    try {
      const analysis = await analyzeInterviewAnswer({
        question: currentQuestion.question,
        userAnswer: transcript,
        category: currentQuestion.category
      });

      const updatedResponses = [...(session.responses || [])];
      updatedResponses[currentIndex] = {
        question: currentQuestion.question,
        answer: transcript,
        analysis
      };

      await updateDoc(sessionRef, {
        responses: updatedResponses,
        currentQuestionIndex: currentIndex + 1,
        updatedAt: serverTimestamp()
      });

      setTranscript('');
      setCurrentQuestionIndex(currentIndex + 1);
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionRef || !user) return;
    setCompleting(true);
    try {
      const report = await generateInterviewReport({
        jobTitle: session.jobTitle,
        sessionData: session.responses
      });

      await updateDoc(sessionRef, {
        report,
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Interview Complete", description: "Your performance report is ready." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Finalization Failed", description: e.message });
    } finally {
      setCompleting(false);
    }
  };

  if (authLoading || sessionLoading || !session) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  const isFinished = currentIndex >= session.questions.length || session.status === 'completed';

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* COMPLETED VIEW */}
        {isFinished && session.report ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-inner">
                  <Trophy size={40} className="animate-pulse" />
                </div>
                <h1 className="text-4xl font-headline font-bold">Performance Report</h1>
                <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-black">{session.jobTitle} • {session.type} Round</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ScoreBadge label="Overall" value={session.report.overallScore} />
                <ScoreBadge label="Communication" value={session.report.communicationScore} />
                <ScoreBadge label="Technical" value={session.report.technicalScore} />
                <ScoreBadge label="Readiness" value={session.report.hrReadinessScore} />
             </div>

             <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <p className="text-lg leading-relaxed text-foreground/80 italic">"{session.report.summary}"</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-green-600 tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={14} /> Key Strengths
                        </h4>
                        <ul className="space-y-3">
                          {session.report.topStrengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex gap-2">
                              <span className="text-green-500 font-bold">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                          <AlertCircle size={14} /> Critical Fixes
                        </h4>
                        <ul className="space-y-3">
                          {session.report.criticalFixes.map((f: string, i: number) => (
                            <li key={i} className="text-sm bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex gap-2">
                              <span className="text-red-500 font-bold">•</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="flex justify-center pt-8">
               <Button size="lg" className="px-12 h-14 font-bold" onClick={() => router.push('/interview-prep')}>
                 Start New Session
               </Button>
             </div>
          </div>
        ) : isFinished && !session.report ? (
          <Card className="glass p-20 text-center space-y-8 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
               <Loader2 className="w-10 h-10 animate-spin" />
             </div>
             <div className="space-y-2">
               <h2 className="text-3xl font-headline font-bold">Reviewing Your Session</h2>
               <p className="text-muted-foreground">Our AI coach is aggregating your responses and detecting behavioral patterns...</p>
             </div>
             <Button size="lg" onClick={handleComplete} disabled={completing} className="px-10 font-bold">
               {completing ? "Generating Report..." : "Generate Final Score"}
             </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-end gap-4">
               <div>
                 <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-2">Question {currentIndex + 1} of {session.questions.length}</Badge>
                 <h1 className="text-2xl md:text-3xl font-headline font-bold">{session.jobTitle} Practice</h1>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border shadow-sm">
                  <Timer className={cn("text-primary", timeLeft < 30 && "text-destructive animate-pulse")} size={18} />
                  <span className={cn("font-mono font-bold text-lg", timeLeft < 30 && "text-destructive")}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
               </div>
            </div>

            <Progress value={(currentIndex / session.questions.length) * 100} className="h-2 bg-muted shadow-inner" />

            <Card className="glass border-primary/20 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
              <CardHeader className="bg-primary/5 border-b border-white/10 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl ring-2 ring-primary/5">
                    <Volume2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{currentQuestion.category} Analysis</p>
                    <CardTitle className="text-xl md:text-2xl leading-tight">"{currentQuestion.question}"</CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 flex-1 flex flex-col space-y-6">
                <div className="flex-1 bg-muted/20 rounded-2xl p-6 border-2 border-dashed border-muted relative group">
                  {!transcript && !isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground italic text-sm">
                      Click the microphone to begin your answer...
                    </div>
                  )}
                  <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{transcript}</p>
                  {isRecording && <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-white" /> Live Listening</div>}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleRecording} 
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl",
                        isRecording ? "bg-destructive scale-110" : "bg-primary hover:scale-105 hover:bg-primary/90"
                      )}
                    >
                      {isRecording ? <Square size={32} /> : <Mic size={32} />}
                    </button>
                    <div>
                      <p className="font-bold text-sm">{isRecording ? "Listening..." : transcript ? "Recording Saved" : "Click to Record"}</p>
                      <p className="text-xs text-muted-foreground">Aim for 90-120 seconds for maximum impact.</p>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="px-10 h-14 font-bold shadow-xl shadow-primary/20" 
                    onClick={handleNext}
                    disabled={!transcript.trim() || analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing with STAR...
                      </>
                    ) : (
                      <>
                        Submit & Next
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TipItem icon={<Sparkles className="text-yellow-500" />} text="Be specific about results." />
              <TipItem icon={<Target className="text-blue-500" />} text="Use 'I' instead of 'We' statements." />
              <TipItem icon={<CheckCircle2 className="text-green-500" />} text="Structure using STAR framework." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBadge({ label, value }: any) {
  return (
    <Card className="glass text-center p-6 border-white/5 shadow-lg">
      <div className="text-3xl font-headline font-black text-primary mb-1">{value}%</div>
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
    </Card>
  );
}

function TipItem({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-background border shadow-sm text-xs font-medium text-muted-foreground">
      {icon}
      {text}
    </div>
  );
}