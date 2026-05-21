
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Briefcase, 
  Layout,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Settings,
  Pencil,
  Check,
  Mail,
  Phone,
  X,
  Zap,
  FileDown,
  CalendarDays,
  Palette,
  Calendar as CalendarIcon,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { AiAssistant } from '@/components/tools/AiAssistant';
import { PhotoUpload } from '@/components/tools/PhotoUpload';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { logAnalyticsEvent } from '@/lib/analytics';

const TEMPLATES = [
  { id: 'professional', name: 'Executive Pro', category: 'Corporate' },
  { id: 'modern', name: 'Silicon Valley', category: 'Modern' },
  { id: 'minimalist', name: 'Clean Minimal', category: 'Minimal' },
  { id: 'creative', name: 'Creative Designer', category: 'Creative' },
  { id: 'academic', name: 'Academic Elite', category: 'Academic' },
  { id: 'ats-optimized', name: 'ATS Direct', category: 'ATS Friendly' },
];

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#3b82f6' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#ef4444' },
  { name: 'Midnight', value: '#000000' },
];

export default function ResumeBuilder() {
  const { id } = useParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const resumeRef = useMemo(() => (user && db && id) ? doc(db, 'users', user.uid, 'cvs', id as string) : null, [user, db, id]);
  const { data: resume, loading: resumeLoading } = useDoc(resumeRef);

  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaveLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [focusedSection, setFocusedSection] = useState<string>('personalInfo');

  useEffect(() => {
    if (resume && !formData) {
      setFormData(resume);
    }
  }, [resume, formData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cv-builder/' + id);
    }
  }, [user, authLoading, router, id]);

  const handleSave = useCallback(async (silent = false) => {
    if (!resumeRef || !formData || !isDirty) return;
    if (!silent) setSaveLoading(true);
    try {
      await updateDoc(resumeRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setIsDirty(false);
      if (!silent) toast({ title: "Progress Secured" });
    } catch (error) {
      if (!silent) toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      if (!silent) setSaveLoading(false);
    }
  }, [resumeRef, formData, isDirty, toast]);

  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => handleSave(true), 3000);
    return () => clearTimeout(timeout);
  }, [isDirty, handleSave]);

  const calculateScore = useMemo(() => {
    if (!formData?.content) return 0;
    let score = 0;
    const c = formData.content;
    if (c.personalInfo?.fullName) score += 5;
    if (c.personalInfo?.email) score += 5;
    if (c.personalInfo?.phone) score += 5;
    if (c.personalInfo?.location) score += 5;
    if (c.personalInfo?.summary?.length > 50) score += 15;
    if (c.experience?.length >= 2) score += 30;
    if (c.education?.length > 0) score += 15;
    if (c.skills?.technical?.length >= 5) score += 15;
    if (c.personalInfo?.photoUrl) score += 5;
    return Math.min(score, 100);
  }, [formData]);

  const updateContent = (section: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      content: { ...prev.content, [section]: data }
    }));
    setIsDirty(true);
  };

  const updateSettings = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
    setIsDirty(true);
  };

  const handlePrint = () => {
    if (db) {
      logAnalyticsEvent(db, {
        type: 'cv_export',
        path: window.location.pathname,
        sessionId: 'user-session',
        userId: user?.uid,
        label: 'PDF Download from Builder'
      });
    }
    window.print();
  };

  const parseSafeDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  };

  if (authLoading || resumeLoading || !formData) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  const currentTemplate = formData.templateId || 'professional';

  return (
    <div className="min-h-screen bg-muted/10 pb-20 no-scrollbar overflow-x-hidden print:overflow-visible print:bg-white print:pb-0">
      <div className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 print:hidden shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/cv-builder"><ArrowLeft size={20} /></Link></Button>
            <div>
              <div className="flex items-center gap-2">
                <Input 
                  value={formData.title || 'Untitled'} 
                  onChange={(e) => { setFormData((prev: any) => ({...prev, title: e.target.value})); setIsDirty(true); }} 
                  className="font-bold border-none text-lg bg-transparent focus-visible:ring-0 w-[200px] px-0 h-auto" 
                />
                <Badge variant="outline" className="text-[9px] uppercase font-black h-4 text-primary">{currentTemplate}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${calculateScore}%` }} /></div>
                  <span className="text-[9px] font-black text-primary uppercase">{calculateScore}% Strength</span>
                </div>
                {isDirty && <span className="text-[9px] font-bold text-amber-500 uppercase animate-pulse">Saving...</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="font-bold h-9"><FileDown size={16} className="mr-2" /> Download PDF</Button>
            <Button size="sm" onClick={() => handleSave()} disabled={saving || !isDirty} className="font-bold h-9 px-6">{saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />} Save</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full">
          {/* Builder UI Column */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="content" className="font-bold text-xs uppercase" onClick={() => setFocusedSection('personalInfo')}><Pencil size={14} className="mr-2" /> Edit</TabsTrigger>
                <TabsTrigger value="design" className="font-bold text-xs uppercase"><Layout size={14} className="mr-2" /> Style</TabsTrigger>
                <TabsTrigger value="global" className="font-bold text-xs uppercase"><Settings size={14} className="mr-2" /> Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 pt-4">
                <SectionCard icon={<UserIcon />} title="Identity & Contact" focused={focusedSection === 'personalInfo'} onFocus={() => setFocusedSection('personalInfo')}>
                   <div className="space-y-6">
                      <PhotoUpload 
                        cvId={id as string} 
                        currentPhotoUrl={formData.content.personalInfo?.photoUrl} 
                        onUploadComplete={(url) => {
                          updateContent('personalInfo', { ...formData.content.personalInfo, photoUrl: url });
                        }} 
                        onRemove={() => updateContent('personalInfo', { ...formData.content.personalInfo, photoUrl: '' })} 
                      />
                      <div className="space-y-4">
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Full Name</Label><Input value={formData.content.personalInfo?.fullName || ''} onChange={(e) => updateContent('personalInfo', { ...formData.content.personalInfo, fullName: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Email</Label><Input value={formData.content.personalInfo?.email || ''} onChange={(e) => updateContent('personalInfo', { ...formData.content.personalInfo, email: e.target.value })} /></div>
                          <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Phone</Label><Input value={formData.content.personalInfo?.phone || ''} onChange={(e) => updateContent('personalInfo', { ...formData.content.personalInfo, phone: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Location</Label><Input value={formData.content.personalInfo?.location || ''} onChange={(e) => updateContent('personalInfo', { ...formData.content.personalInfo, location: e.target.value })} /></div>
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-muted-foreground">Professional Summary</Label><Textarea rows={5} value={formData.content.personalInfo?.summary || ''} onChange={(e) => updateContent('personalInfo', { ...formData.content.personalInfo, summary: e.target.value })} /></div>
                      </div>
                   </div>
                </SectionCard>
                <SectionCard icon={<Briefcase />} title="Work History" focused={focusedSection === 'experience'} onFocus={() => setFocusedSection('experience')}>
                   <div className="space-y-4">
                      {(formData.content.experience || []).map((exp: any, i: number) => (
                        <div key={i} className="p-4 border rounded-xl bg-muted/20 relative group/item">
                           <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 h-8 w-8" onClick={() => { const list = [...formData.content.experience]; list.splice(i, 1); updateContent('experience', list); }}><Trash2 size={14} /></Button>
                           <div className="space-y-3">
                              <Input placeholder="Company" value={exp.company} className="bg-background/50 h-9 font-bold" onChange={(e) => { const list = [...formData.content.experience]; list[i].company = e.target.value; updateContent('experience', list); }} />
                              <Input placeholder="Role" value={exp.role} className="bg-background/50 h-9" onChange={(e) => { const list = [...formData.content.experience]; list[i].role = e.target.value; updateContent('experience', list); }} />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full bg-background/50 h-9 text-[10px] font-normal justify-start overflow-hidden", !exp.startDate && "text-muted-foreground")}>
                                      <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
                                      <span className="truncate">{exp.startDate || "Start Date"}</span>
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={parseSafeDate(exp.startDate)}
                                      onSelect={(date) => {
                                        const list = [...formData.content.experience];
                                        list[i].startDate = date ? format(date, "MMM yyyy") : "";
                                        updateContent('experience', list);
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full bg-background/50 h-9 text-[10px] font-normal justify-start overflow-hidden", !exp.endDate && "text-muted-foreground")}>
                                      <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
                                      <span className="truncate">{exp.endDate || "End Date"}</span>
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                      mode="single"
                                      selected={parseSafeDate(exp.endDate)}
                                      onSelect={(date) => {
                                        const list = [...formData.content.experience];
                                        list[i].endDate = date ? format(date, "MMM yyyy") : "";
                                        updateContent('experience', list);
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <Textarea placeholder="Achievements..." rows={4} value={exp.description} className="bg-background/50 text-xs" onChange={(e) => { const list = [...formData.content.experience]; list[i].description = e.target.value; updateContent('experience', list); }} />
                           </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-dashed h-12" onClick={() => updateContent('experience', [...(formData.content.experience || []), { company: '', role: '', description: '', startDate: '', endDate: '' }])}><Plus size={16} className="mr-2" /> Add Experience</Button>
                   </div>
                </SectionCard>
                <SectionCard icon={<Zap />} title="Skills & Keywords" focused={focusedSection === 'skills'} onFocus={() => setFocusedSection('skills')}>
                   <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {(formData.content.skills?.technical || []).map((s: string, i: number) => (
                           <Badge key={i} variant="secondary" className="gap-1 py-1">{s}<button onClick={() => { const list = [...formData.content.skills.technical]; list.splice(i, 1); updateContent('skills', { ...formData.content.skills, technical: list }); }}><X size={12} /></button></Badge>
                        ))}
                      </div>
                      <Input placeholder="Add skill and press Enter..." onKeyDown={(e: any) => { if (e.key === 'Enter' && e.target.value.trim()) { const list = [...(formData.content.skills?.technical || []), e.target.value.trim()]; updateContent('skills', { ...formData.content.skills, technical: list }); e.target.value = ''; }}} />
                   </div>
                </SectionCard>
              </TabsContent>

              <TabsContent value="design" className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((tpl) => (
                    <div 
                      key={tpl.id} 
                      className={cn(
                        "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 relative group", 
                        currentTemplate === tpl.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-white/5 hover:border-primary/20 hover:bg-muted/30"
                      )} 
                      onClick={() => { 
                        setFormData((prev: any) => ({ ...prev, templateId: tpl.id })); 
                        setIsDirty(true); 
                        toast({ title: `Applied ${tpl.name}` }); 
                      }}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300", 
                        currentTemplate === tpl.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-muted group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Layout size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-widest leading-tight">{tpl.name}</h4>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-60">{tpl.category}</p>
                      </div>
                      {currentTemplate === tpl.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-background">
                            <Check className="text-white" size={10} strokeWidth={4} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="global" className="pt-4 space-y-6">
                <SectionCard icon={<Palette />} title="Brand Configuration">
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Accent Color Selection</Label>
                        <div className="flex flex-wrap gap-2">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color.value}
                              className={cn(
                                "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                                (formData.settings?.colorAccent || '#3b82f6') === color.value ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent"
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => updateSettings('colorAccent', color.value)}
                              title={color.name}
                            />
                          ))}
                          <div className="flex items-center gap-2 ml-auto">
                            <Input 
                              type="color" 
                              value={formData.settings?.colorAccent || '#3b82f6'} 
                              onChange={(e) => updateSettings('colorAccent', e.target.value)}
                              className="w-10 h-10 p-0 overflow-hidden border-none cursor-pointer rounded-full bg-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-white/5">
                        <Label className="text-[10px] uppercase font-black text-muted-foreground flex items-center gap-2">
                          <CalendarIcon size={14} className="text-primary" />
                          Global Date Formatting
                        </Label>
                        <Select 
                          value={formData.settings?.dateFormat || 'MM/YYYY'} 
                          onValueChange={(v) => updateSettings('dateFormat', v)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/YYYY">Month / Year (05/2024)</SelectItem>
                            <SelectItem value="MMM YYYY">Short Month Year (May 2024)</SelectItem>
                            <SelectItem value="YYYY">Year Only (2024)</SelectItem>
                            <SelectItem value="Text">Standard Range (2024 - Present)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </SectionCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Resume Rendering Column */}
          <div className="lg:col-span-7 space-y-4 print:p-0 print:m-0 print:w-full print:block">
             <div 
               id="cv-render-target" 
               className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl min-h-[1100px] w-full p-12 md:p-16 border border-white/10 transition-all duration-700 origin-top print:shadow-none print:p-0 print:border-none print:rounded-none print:min-h-0 print:m-0 print:block print:w-full print:overflow-visible print:transform-none print:origin-top"
             >
                <ResumeRenderer data={formData} />
             </div>
          </div>
        </div>
      </div>

      <AiAssistant cvData={formData} focusedSection={focusedSection} />

      <style jsx global>{`
        @media print {
          @page {
            margin: 10mm !important;
            size: A4;
          }
          
          html, body, main, div[data-sidebar-wrapper] {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          nav, 
          header:not(.resume-header), 
          footer, 
          aside, 
          .print\:hidden,
          [data-sidebar="sidebar"],
          .sticky,
          button,
          .fixed,
          .AiAssistant,
          .Toaster,
          .no-print,
          div[role="dialog"],
          .DialogOverlay {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          #cv-render-target {
            position: relative !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            min-height: 0 !important;
            display: block !important;
            overflow: visible !important;
            transform: none !important;
            border-radius: 0 !important;
            text-rendering: optimizeLegibility !important;
          }

          section {
            page-break-inside: auto !important;
            break-inside: auto !important;
            margin-bottom: 15pt !important;
            display: block !important;
            width: 100% !important;
            overflow: visible !important;
          }
          
          h1, h2, h3 {
            page-break-after: avoid !important;
            color: black !important;
          }

          .resume-header {
            display: flex !important;
          }

          .experience-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }

          .container, .grid, .lg\:col-span-7 {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}

function SectionCard({ icon, title, children, focused, onFocus }: any) {
  return (
    <Card className={cn("glass border-white/10 shadow-lg transition-all duration-300", focused && "ring-2 ring-primary/40")} onClick={onFocus}>
      <CardHeader className="py-4 border-b border-white/5 flex flex-row items-center gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", focused ? "bg-primary text-white" : "bg-primary/10 text-primary")}>{icon}</div>
        <CardTitle className="text-sm font-bold uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-6">{children}</CardContent>
    </Card>
  );
}

function ResumeRenderer({ data }: { data: any }) {
  const content = data.content || {};
  const tpl = data.templateId || 'professional';
  const settings = data.settings || {};
  const accentColor = settings.colorAccent || '#3b82f6';
  
  const isAcademic = tpl === 'academic';
  const isAts = tpl === 'ats-optimized';
  const isCreative = tpl === 'creative';
  const isModern = tpl === 'modern';
  const isMinimal = tpl === 'minimalist';
  
  return (
    <div className={cn(
      "text-foreground transition-all duration-500 print:text-black print:max-w-none", 
      isAcademic ? 'font-serif' : 'font-sans',
      "max-w-4xl mx-auto",
      isMinimal && "text-muted-foreground"
    )} style={{ '--resume-primary': accentColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
      {/* HEADER */}
      <header className={cn(
        "resume-header flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-8 border-b-2 print:flex-row print:text-left print:gap-4 print:mb-6 print:border-black/10",
        isCreative && "md:flex-row-reverse",
        "border-primary/10"
      )} style={{ borderColor: `${accentColor}15` }}>
        <div className={cn(
          "flex-1 space-y-4 text-center md:text-left print:text-left print:space-y-1",
          isCreative && "md:text-right"
        )}>
          <h1 className={cn(
            "font-black uppercase tracking-tight text-4xl md:text-5xl print:text-3xl print:text-black",
            isModern ? "italic" : "",
            isMinimal ? "text-3xl tracking-normal font-normal" : ""
          )} style={{ color: accentColor }}>
            {content.personalInfo?.fullName || 'Full Name'}
          </h1>
          <div className={cn(
            "flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-bold opacity-60 print:gap-4 print:text-[9px] print:opacity-100",
            isCreative && "md:justify-end"
          )}>
             <span className="flex items-center gap-1">
               <Mail size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.email || 'email@example.com'}
             </span>
             <span className="flex items-center gap-1">
               <Phone size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.phone || '+000'}
             </span>
             <span className="flex items-center gap-1">
               <MapPin size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.location || 'Location'}
             </span>
          </div>
        </div>
        {content.personalInfo?.photoUrl && !isAts && (
          <div className="shrink-0 relative print:w-24 print:h-24">
            <img 
              src={content.personalInfo.photoUrl} 
              alt="Profile" 
              className="relative w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl print:w-24 print:h-24 print:shadow-none print:border-none print:rounded-lg" 
            />
          </div>
        )}
      </header>

      {/* BODY */}
      <div className={cn(
        "space-y-12 print:space-y-6",
        isAcademic && "space-y-16"
      )}>
        {content.personalInfo?.summary && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-4 border-b-2 pb-1 inline-block print:text-black print:mb-2 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Professional Summary
            </h2>
            <p className="text-sm italic opacity-80 leading-relaxed font-medium print:text-[11px] print:leading-normal print:opacity-100">
              "{content.personalInfo.summary}"
            </p>
          </section>
        )}

        {content.experience?.length > 0 && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-6 border-b-2 pb-1 inline-block print:text-black print:mb-4 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Work Experience
            </h2>
            <div className="space-y-10 print:space-y-4">
              {content.experience.map((exp: any, i: number) => (
                <div key={i} className="experience-item space-y-1">
                  <div className="flex justify-between font-black text-sm print:text-xs">
                    <span className={cn(isAcademic && "text-base")}>{exp.role || 'Job Role'}</span>
                    <span className="opacity-40 text-[10px] uppercase print:text-[8px] print:opacity-100 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-black uppercase print:text-black print:text-[10px]" style={{ color: `${accentColor}CC` }}>{exp.company}</p>
                  <p className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap mt-3 print:text-[10px] print:mt-1 print:leading-normal print:opacity-100 border-l-2 border-muted pl-5 print:border-black/10">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.skills?.technical?.length > 0 && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-4 border-b-2 pb-1 inline-block print:text-black print:mb-2 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Expertise & Skills
            </h2>
            <div className="flex flex-wrap gap-2 print:gap-1.5">
              {content.skills.technical.map((s: string, i: number) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-[10px] font-bold print:text-[8px] print:border-black/20 print:bg-transparent print:px-1.5 print:text-black"
                  style={{ borderColor: `${accentColor}33`, color: accentColor, backgroundColor: `${accentColor}0D` }}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
