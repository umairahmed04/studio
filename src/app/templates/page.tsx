"use client";

import { useMemo, useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Layout, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  Search, 
  LogIn, 
  Lock, 
  ArrowRight, 
  Heart,
  Eye,
  Maximize2,
  X,
  Loader2,
  Sparkles,
  Filter,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ["All", "ATS Friendly", "Creative", "Corporate", "Modern", "Academic", "Startup"];

export default function TemplatesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch Templates
  const templatesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'cv_templates'), 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: templates, loading } = useCollection(templatesQuery);

  // Fetch User Profile for Favorites
  const userRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userData } = useDoc(userRef);

  const favorites = userData?.favorites || [];

  const toggleFavorite = async (templateId: string) => {
    if (!user || !userRef) {
      router.push(`/login?redirect=/templates`);
      return;
    }
    const isFav = favorites.includes(templateId);
    try {
      await updateDoc(userRef, {
        favorites: isFav ? arrayRemove(templateId) : arrayUnion(templateId)
      });
      toast({
        title: isFav ? "Removed from Favorites" : "Added to Favorites",
        description: isFav ? "Template removed from your library." : "Template saved for later."
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update favorites." });
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    let list = templates.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (activeCategory !== "All") {
      list = list.filter(t => t.category === activeCategory || t.tags?.includes(activeCategory));
    }

    // Limit for guests
    if (!user) return list.slice(0, 6);
    return list;
  }, [templates, searchTerm, activeCategory, user]);

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    if (!user || !db) {
      router.push(`/login?redirect=/templates`);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'resumes'), {
        userId: user.uid,
        title: `New ${templateName}`,
        templateId: templateId.replace('tpl-', ''), 
        content: {
          personalInfo: { fullName: user.displayName || '', email: user.email || '', phone: '', location: '', summary: '' },
          experience: [],
          education: [],
          skills: { technical: [], soft: [], tools: [] },
          projects: []
        },
        settings: {
          dateFormat: "MM/YYYY",
          colorAccent: "#3b82f6"
        },
        updatedAt: serverTimestamp()
      });
      toast({ title: "Template Selected", description: "Taking you to the builder..." });
      router.push(`/cv-builder/${docRef.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to start CV." });
    }
  };

  return (
    <ToolLayout 
      title="Professional CV Templates" 
      description="Select a recruiter-approved, ATS-compliant template. Switch styles instantly without losing your data."
      badge="Visual Identity Library"
    >
      <div className="space-y-8 mb-20">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search templates..." 
              className="pl-10 h-11 bg-background/50 border-white/5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <Badge 
                key={cat} 
                variant={activeCategory === cat ? "default" : "outline"}
                className="px-4 py-1.5 cursor-pointer hover:bg-primary/20 transition-all font-bold uppercase text-[10px] tracking-widest"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass overflow-hidden h-[500px]">
                <Skeleton className="h-[400px] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <Search className="mx-auto text-muted-foreground opacity-20" size={64} />
              <p className="text-muted-foreground italic">No templates found matching your criteria.</p>
            </div>
          ) : filteredTemplates.map((template: any) => (
            <Card key={template.id} className="glass group relative overflow-hidden border-white/5 hover:border-primary/20 transition-all flex flex-col hover:shadow-2xl hover:shadow-primary/5">
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">
                    {template.category || "Professional"}
                  </Badge>
                  <button 
                    onClick={() => toggleFavorite(template.id)}
                    className={`transition-colors ${favorites.includes(template.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                  >
                    <Heart size={20} fill={favorites.includes(template.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <CardTitle className="text-xl font-headline font-bold">{template.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 flex-1 relative">
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:shadow-primary/10 transition-all">
                  <img 
                    src={template.customImageUrl || placeholderData.placeholderImages.find(img => img.id === template.imageId)?.imageUrl || 'https://placehold.co/600x800'} 
                    alt={template.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 absolute inset-0"
                    data-ai-hint="resume template"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <Button variant="secondary" size="sm" className="font-bold" onClick={() => setPreviewTemplate(template)}>
                      <Eye size={16} className="mr-2" /> Quick Preview
                    </Button>
                    <Button variant="default" size="sm" className="font-bold" onClick={() => handleUseTemplate(template.id, template.name)}>
                      <ArrowRight size={16} className="mr-2" /> Use This Template
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(template.tags || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0 mt-auto">
                <Button className="w-full font-bold shadow-lg shadow-primary/20 h-11" onClick={() => handleUseTemplate(template.id, template.name)}>
                  Build with this style
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {!user && (
        <section className="p-12 rounded-3xl bg-primary/10 text-center space-y-6 border border-primary/20 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
            <Lock size={32} />
          </div>
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-headline font-bold">Unlock 20+ More Premium Styles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our full library includes specialized templates for Creative, Technical, Academic, and Executive roles. Sign up for free to access them all.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="font-bold px-12 h-14 shadow-xl shadow-primary/20">
              <Link href="/signup">
                <LogIn className="mr-2" size={20} />
                Sign Up for Free Access
              </Link>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            Join 50,000+ job seekers today
          </p>
        </section>
      )}

      {/* Realistic Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden glass border-white/10">
          <DialogHeader className="p-6 border-b bg-muted/30 flex flex-row items-center justify-between shrink-0">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} />
                {previewTemplate?.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Interactive preview mode</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-background/50 rounded-lg border p-1 mr-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}><Minus size={14} /></Button>
                <span className="text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}><Plus size={14} /></Button>
              </div>
              <Button onClick={() => handleUseTemplate(previewTemplate.id, previewTemplate.name)} className="font-bold">Use Template</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/50 p-8 md:p-12 scrollbar-hide">
            <div 
              className="bg-white dark:bg-zinc-950 mx-auto shadow-2xl transition-all duration-300 origin-top p-12 min-h-[1100px] w-full max-w-[800px]"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <RealisticPreview data={previewTemplate} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
}

// Sub-component for a realistic placeholder rendering in modal
function RealisticPreview({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="space-y-8 font-sans">
      <div className="border-b-4 border-primary pb-6">
        <h1 className="text-5xl font-black text-foreground mb-2">AMARA OKAFOR</h1>
        <p className="text-primary font-bold tracking-widest text-sm uppercase">Global Marketing Strategist</p>
        <div className="mt-4 flex gap-6 text-[11px] font-medium opacity-60">
          <span>+971 50 123 4567</span>
          <span>amara@example.com</span>
          <span>Dubai, UAE</span>
        </div>
      </div>
      
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-tighter text-primary">Professional Profile</h2>
        <p className="text-sm leading-relaxed text-foreground/80 font-medium">
          Strategic marketing executive with 10+ years of experience leading cross-functional teams in EMEA and Asian markets. 
          Expert in high-growth digital ecosystems and data-driven branding.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-tighter text-primary">Experience Highlights</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-base">Senior Product Manager</h4>
              <p className="text-primary text-xs font-bold italic">Global Tech Solutions | 2021 — Present</p>
            </div>
            <span className="text-[10px] font-black opacity-40 uppercase">London, UK</span>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/70">
            <li>Directed a team of 15 designers and engineers to launch SaaS platform scaling to 1M+ users.</li>
            <li>Optimized customer acquisition costs by 45% through regional keyword strategy.</li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-12">
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-tighter text-primary">Core Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {["Market Analysis", "Growth Hacking", "Stakeholder Management", "Digital Strategy"].map(s => (
              <Badge key={s} variant="outline" className="text-[10px] border-primary/20 bg-primary/5">{s}</Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-tighter text-primary">Education</h2>
          <div>
            <h4 className="font-bold text-sm">MBA, International Business</h4>
            <p className="text-[11px] opacity-60">INSEAD | Class of 2019</p>
          </div>
        </div>
      </section>
    </div>
  );
}
