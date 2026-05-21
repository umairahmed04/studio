
"use client";

import { useMemo, useEffect, useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Plus, FileText, Trash2, Edit2, Loader2, Clock, Layout, FileSearch, Sparkles, Wand2, X, Globe, User, Briefcase, Mail, Phone, Zap, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FileUploadZone } from '@/components/tools/FileUploadZone';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateAiCv } from '@/ai/flows/ai-cv-generator-flow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function CVBuilderDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiForm, setAiForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    jobTitle: '',
    yearsOfExperience: '3',
    skills: '',
    country: '',
    linkedinUrl: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cv-builder');
    }
    if (user && !aiForm.fullName) {
      setAiForm(prev => ({ 
        ...prev, 
        fullName: user.displayName || '', 
        email: user.email || '' 
      }));
    }
  }, [user, authLoading, router, aiForm.fullName]);

  const resumesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'cvs'),
      orderBy('updatedAt', 'desc')
    );
  }, [db, user]);

  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);

  const handleCreateNew = async (templateId = 'professional', initialContent: any = null) => {
    if (!db || !user) return;
    try {
      const defaultContent = {
        personalInfo: { 
          fullName: user.displayName || '', 
          email: user.email || '', 
          phone: '', 
          location: '', 
          summary: '' 
        },
        experience: [],
        education: [],
        skills: { technical: [], soft: [], tools: [] },
        certifications: []
      };

      const res = await addDoc(collection(db, 'users', user.uid, 'cvs'), {
        userId: user.uid,
        title: initialContent ? `AI CV: ${aiForm.jobTitle}` : 'Untitled Resume',
        templateId: templateId,
        content: initialContent || defaultContent,
        settings: { dateFormat: 'MM/YYYY', colorAccent: '#3b82f6' },
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        aiGenerated: !!initialContent
      });

      await addDoc(collection(db, 'users', user.uid, 'activityLog'), {
        type: 'create',
        cvId: res.id,
        timestamp: serverTimestamp(),
        details: { title: initialContent ? `Generated AI CV for ${aiForm.jobTitle}` : 'New Resume' }
      });
      
      toast({ title: "Document Ready", description: "Opening your professional workspace..." });
      router.push(`/cv-builder/${res.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create resume." });
    }
  };

  const handleGenerateAiCv = async () => {
    const requiredFields = ['fullName', 'phone', 'email', 'jobTitle', 'yearsOfExperience'];
    const missing = requiredFields.filter(f => !aiForm[f as keyof typeof aiForm]);
    
    if (missing.length > 0) {
      toast({ 
        variant: "destructive", 
        title: "Incomplete Form", 
        description: "Please fill in all required fields marked with *." 
      });
      return;
    }

    setAiLoading(true);
    try {
      toast({ title: "AI Writer Active", description: "Crafting your professional history..." });
      const result = await generateAiCv({
        ...aiForm,
        yearsOfExperience: parseInt(aiForm.yearsOfExperience) || 0
      });
      
      await handleCreateNew('professional', result);
      setIsAiModalOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "AI Generation Failed", description: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  const handleUploadComplete = async (text: string) => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Empty File" });
      return;
    }
    toast({ title: "Importing...", description: "Mapping details to the builder." });
    
    // System Upgrade: Global Sync on Import
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_extracted_cv', text);
    }

    await handleCreateNew('professional', {
      personalInfo: { fullName: user?.displayName || '', email: user?.email || '', phone: '', location: '', summary: text },
      experience: [], education: [], skills: { technical: [], soft: [], tools: [] }, certifications: []
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!db || !user) return;
    if (confirm('Delete this resume permanently?')) {
      await deleteDoc(doc(db, 'users', user.uid, 'cvs', id));
      toast({ title: "Resume Deleted" });
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  if (!user) return null;

  return (
    <ToolLayout 
      title="AI Resume Manager" 
      description="Create, optimize, and manage professional resumes with one-click AI generation."
      badge="Professional Suite"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              Start Your Document
            </CardTitle>
            <CardDescription>Choose how you want to build your next professional profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EntryCard 
              icon={<Wand2 className={cn(aiLoading && "animate-spin")} />} 
              title="One-Click AI Maker" 
              desc="AI writes your entire CV in 60 seconds." 
              onClick={() => setIsAiModalOpen(true)}
              featured
            />
            <EntryCard 
              icon={<Plus />} 
              title="Manual Build" 
              desc="Create your document from scratch." 
              onClick={() => handleCreateNew()} 
            />
            <EntryCard 
              icon={<FileSearch />} 
              title="Import Document" 
              desc="Extract details from an existing file." 
              onClick={() => setIsUploading(true)} 
            />
            <EntryCard 
              icon={<Layout />} 
              title="Templates" 
              desc="Pick from our recruiter-approved designs." 
              href="/templates" 
            />
          </CardContent>
          {isUploading && (
            <div className="p-6 border-t bg-muted/20 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm">Upload File</h4>
                <Button variant="ghost" size="icon" onClick={() => setIsUploading(false)}><X size={16} /></Button>
              </div>
              <FileUploadZone onTextExtracted={handleUploadComplete} />
            </div>
          )}
        </Card>

        <Card className="glass flex flex-col justify-center items-center p-8 text-center space-y-4">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <FileText size={32} />
           </div>
           <h3 className="font-bold text-lg">Your Vault</h3>
           <p className="text-xs text-muted-foreground leading-relaxed">
             You have {resumes?.length || 0} resumes saved. Access them anytime from your private dashboard.
           </p>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          Your Resumes
          <Badge variant="outline" className="font-bold">{resumes?.length || 0}</Badge>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumesLoading ? (
            <div className="flex items-center justify-center col-span-full h-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : resumes?.length === 0 ? (
            <Card className="col-span-full p-20 border-dashed border-2 text-center bg-muted/5">
              <p className="text-muted-foreground mb-4 italic">No documents found. Start your first one with AI!</p>
              <Button onClick={() => setIsAiModalOpen(true)}><Wand2 size={16} className="mr-2" /> One-Click AI CV</Button>
            </Card>
          ) : resumes?.map((resume: any) => (
            <Card key={resume.id} className="glass group hover:border-primary/40 transition-all flex flex-col relative overflow-hidden">
              {resume.aiGenerated && (
                <div className="absolute top-0 right-0 p-2">
                   <Badge className="bg-primary/20 text-primary border-none text-[8px] uppercase font-black">AI Generated</Badge>
                </div>
              )}
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <FileText size={20} />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={(e) => handleDelete(e, resume.id)}><Trash2 size={14} /></Button>
                </div>
                <CardTitle className="text-base truncate">{resume.title || 'Untitled'}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-[9px] uppercase font-black opacity-60">
                  <Clock size={10} />
                  Updated {resume.updatedAt?.toDate ? formatDistanceToNow(resume.updatedAt.toDate(), { addSuffix: true }) : 'Recently'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 p-4">
                <Button asChild className="w-full font-bold h-9" variant="outline">
                  <Link href={`/cv-builder/${resume.id}`}><Edit2 size={14} className="mr-2" /> Continue Building</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-2xl glass border-white/10 overflow-hidden p-0">
          <DialogHeader className="p-6 bg-primary/5 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Wand2 size={24} className={cn(aiLoading && "animate-spin")} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-headline font-bold">One-Click AI CV Maker</DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Complete professional resume in 60 seconds
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <User size={10} /> Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input value={aiForm.fullName} onChange={(e) => setAiForm({...aiForm, fullName: e.target.value})} placeholder="e.g. John Doe" className="h-11" />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <Briefcase size={10} /> Job Title / Industry <span className="text-destructive">*</span>
                  </Label>
                  <Input value={aiForm.jobTitle} onChange={(e) => setAiForm({...aiForm, jobTitle: e.target.value})} placeholder="e.g. Software Engineer" className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <Zap size={10} /> Experience (Years) <span className="text-destructive">*</span>
                  </Label>
                  <Input type="number" value={aiForm.yearsOfExperience} onChange={(e) => setAiForm({...aiForm, yearsOfExperience: e.target.value})} className="h-11" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <Mail size={10} /> Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input value={aiForm.email} onChange={(e) => setAiForm({...aiForm, email: e.target.value})} placeholder="name@example.com" className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <Phone size={10} /> Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input value={aiForm.phone} onChange={(e) => setAiForm({...aiForm, phone: e.target.value})} placeholder="+00 000 0000" className="h-11" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <Globe size={10} /> Country (Optional)
                  </Label>
                  <Input value={aiForm.country} onChange={(e) => setAiForm({...aiForm, country: e.target.value})} placeholder="e.g. UAE" className="h-11" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                  <Linkedin size={10} /> LinkedIn URL (Optional)
                </Label>
                <Input value={aiForm.linkedinUrl} onChange={(e) => setAiForm({...aiForm, linkedinUrl: e.target.value})} placeholder="linkedin.com/in/username" className="h-11" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                  <Sparkles size={10} /> Specific Skills (Optional)
                </Label>
                <Textarea 
                  value={aiForm.skills} 
                  onChange={(e) => setAiForm({...aiForm, skills: e.target.value})} 
                  placeholder="e.g. React, SQL, Project Management..." 
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-white/10 gap-2">
            <Button variant="ghost" onClick={() => setIsAiModalOpen(false)} disabled={aiLoading} className="font-bold">
              Cancel
            </Button>
            <Button onClick={handleGenerateAiCv} disabled={aiLoading} className="font-bold px-10 h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              {aiLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  AI Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" size={18} />
                  Generate CV
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
}

function EntryCard({ icon, title, desc, onClick, href, featured }: any) {
  const content = (
    <div className="flex items-center gap-4 text-left">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${featured ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );

  const className = `p-4 border transition-all group rounded-xl cursor-pointer w-full h-full ${featured ? 'border-primary bg-background shadow-lg shadow-primary/5' : 'border-white/5 hover:border-primary/40 hover:bg-background bg-card/40'}`;

  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button onClick={onClick} className={className}>{content}</button>;
}
