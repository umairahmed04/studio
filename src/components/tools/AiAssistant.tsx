'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Wand2, ChevronRight, MessageSquare, Zap, Target, Trophy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AiAssistantProps {
  cvData: any;
  focusedSection?: string;
  onAction?: (type: string, payload?: any) => void;
}

export function AiAssistant({ cvData, focusedSection, onAction }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'rewrite'>('tips');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateScore = useMemo(() => {
    if (!cvData?.content) return 0;
    let score = 0;
    const c = cvData.content;
    if (c.personalInfo?.fullName) score += 5;
    if (c.personalInfo?.email) score += 5;
    if (c.personalInfo?.phone?.length > 5) score += 5;
    if (c.personalInfo?.location) score += 5;
    if (c.personalInfo?.summary?.length > 50) score += 15;
    if (c.experience?.length >= 3) score += 30;
    else if (c.experience?.length > 0) score += 15;
    if (c.education?.length > 0) score += 15;
    if (c.skills?.technical?.length >= 5) score += 15;
    if (c.personalInfo?.photoUrl) score += 5;
    return Math.min(score, 100);
  }, [cvData]);

  const suggestions = useMemo(() => {
    const tips: { title: string; text: string; icon: any; type: 'success' | 'warning' | 'info' }[] = [];
    const content = cvData?.content;
    if (!content) return tips;

    if (!content.experience || content.experience.length === 0) {
      tips.push({ title: 'Add Work History', text: 'Add your professional experience to significantly boost your score.', icon: Target, type: 'warning' });
    }
    if (!content.skills?.technical || content.skills.technical.length < 5) {
      tips.push({ title: 'Skill Density', text: 'Listing 5+ industry-specific skills increases ATS visibility.', icon: Zap, type: 'info' });
    }
    if (!content.personalInfo?.photoUrl) {
      tips.push({ title: 'Visual Identity', text: 'A professional headshot increases trust with recruiters.', icon: Info, type: 'info' });
    }

    if (focusedSection === 'personalInfo') {
      if (!content.personalInfo?.summary || content.personalInfo.summary.length < 100) {
        tips.push({ title: 'Better Summary', text: 'Aim for a 200-character "elevator pitch" highlighting impact.', icon: Trophy, type: 'info' });
      }
    } else if (focusedSection === 'experience') {
      tips.push({ title: 'Action Verbs', text: 'Start every bullet point with verbs like "Led" or "Optimized".', icon: Sparkles, type: 'success' });
    }

    return tips;
  }, [cvData, focusedSection]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] pointer-events-auto"
          >
            <Card className="glass shadow-2xl border-primary/20 overflow-hidden">
              <CardHeader className="p-4 bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Bot size={22} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Career Coach AI</CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Strength: {calculateScore}%</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="flex border-b border-primary/10">
                  <button 
                    className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'tips' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50")}
                    onClick={() => setActiveTab('tips')}
                  >
                    Analysis
                  </button>
                  <button 
                    className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'rewrite' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50")}
                    onClick={() => setActiveTab('rewrite')}
                  >
                    Auto-Rewrite
                  </button>
                </div>

                <ScrollArea className="h-[380px] p-4 bg-muted/5">
                  {activeTab === 'tips' ? (
                    <div className="space-y-4">
                      {suggestions.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                          <Trophy className="mx-auto text-yellow-500" size={40} />
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest">Recruiter Ready!</p>
                            <p className="text-[10px] text-muted-foreground">Your CV score is in the top 1%.</p>
                          </div>
                        </div>
                      ) : (
                        suggestions.map((tip, i) => {
                          const Icon = tip.icon;
                          return (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "p-3 rounded-xl border flex gap-3 shadow-sm",
                                tip.type === 'warning' ? "bg-red-50/50 border-red-100" : tip.type === 'success' ? "bg-green-50/50 border-green-100" : "bg-blue-50/50 border-blue-100"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner",
                                tip.type === 'warning' ? "bg-red-100 text-red-600" : tip.type === 'success' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                              )}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-0.5">{tip.title}</h4>
                                <p className="text-[11px] leading-relaxed opacity-80">{tip.text}</p>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-center space-y-4 shadow-xl">
                        <Sparkles className="mx-auto" size={28} />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em]">Magic Bullet AI</h4>
                          <p className="text-[10px] leading-relaxed opacity-90">
                            Transform basic tasks into powerful achievements statements.
                          </p>
                        </div>
                        <Button variant="secondary" className="w-full h-10 font-bold" onClick={() => (window as any).location.href = '/resume-optimizer'}>
                          Launch AI Rewrite
                        </Button>
                      </div>
                      <div className="p-4 border-2 border-dashed rounded-2xl text-center space-y-2 opacity-60">
                        <Info size={16} className="mx-auto" />
                        <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          Recruiters prefer quantified results (e.g. "Saved 20% on costs") over task descriptions.
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-4 bg-muted/20 border-t border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Online</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary tracking-widest px-2">
                    Gemini 2.5 Flash
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        {!isOpen && suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-[11px] font-black border-4 border-background animate-bounce shadow-lg">
            {suggestions.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}
