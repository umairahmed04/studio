"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  History, 
  Plus, 
  ArrowUpRight, 
  FileCheck, 
  Calendar,
  Loader2,
  MoreVertical,
  Copy,
  Trash2,
  Download,
  Share2,
  Clock,
  ExternalLink,
  Wand2,
  Settings,
  Zap,
  Layout,
  Search,
  Sparkles,
  Camera,
  Mail,
  Edit2
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const resumesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'cvs'),
      orderBy('updatedAt', 'desc')
    );
  }, [db, user]);

  const activityQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'activityLog'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: resumes, loading: resumesLoading } = useCollection(resumesQuery);
  const { data: activities, loading: activityLoading } = useCollection(activityQuery);

  const handleCreateNew = async () => {
    if (!db || !user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'cvs'), {
        title: 'New Resume',
        templateId: 'professional',
        content: {
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
          projects: []
        },
        settings: { dateFormat: 'MM/YYYY', colorAccent: '#3b82f6' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      addDoc(collection(db, 'users', user.uid, 'activityLog'), {
        type: 'create',
        cvId: docRef.id,
        timestamp: serverTimestamp(),
        details: { title: 'New Resume' }
      });

      router.push(`/cv-builder/${docRef.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create resume." });
    }
  };

  const handleDuplicate = async (cv: any) => {
    if (!db || !user) return;
    try {
      const { id, ...data } = cv;
      const docRef = await addDoc(collection(db, 'users', user.uid, 'cvs'), {
        ...data,
        title: `${cv.title} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      addDoc(collection(db, 'users', user.uid, 'activityLog'), {
        type: 'create',
        cvId: docRef.id,
        timestamp: serverTimestamp(),
        details: { title: `${cv.title} (Copy)`, sourceId: cv.id }
      });

      toast({ title: "Resume Duplicated" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Duplicate failed." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !user || !confirm('Delete this CV permanently?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cvs', id));
      toast({ title: "Resume Deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Delete failed." });
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary shadow-xl">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-headline font-bold">Welcome Back, {user?.displayName || 'Professional'}!</h1>
              <p className="text-muted-foreground">Manage your documents and career timeline.</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="font-bold h-12 px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-5 w-5" /> Create New CV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total CVs" value={String(resumes?.length || 0)} subValue="Saved documents" icon={<FileText className="text-primary" />} />
          <StatCard title="AI Boosts" value={String(activities?.filter(a => a.type === 'optimize').length || 0)} subValue="Optimizations" icon={<Wand2 className="text-accent" />} />
          <StatCard title="Premium" value="Active" subValue="Full Features" icon={<FileCheck className="text-green-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="glass border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">My Recent CVs</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cv-builder" className="text-xs font-bold uppercase tracking-widest">Manage All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumesLoading ? (
                    <div className="col-span-full flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                  ) : resumes?.length === 0 ? (
                    <div className="col-span-full text-center p-12 border-dashed border-2 rounded-2xl bg-muted/10">
                      <p className="text-muted-foreground mb-4">No resumes created yet.</p>
                      <Button onClick={handleCreateNew} variant="outline">Start Now</Button>
                    </div>
                  ) : (
                    resumes?.map((cv) => (
                      <Card key={cv.id} className="group hover:border-primary/40 transition-all bg-background/50 relative overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                           <div className="flex justify-between items-start">
                             <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest">{cv.templateId || 'Professional'}</Badge>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={14} /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={() => router.push(`/cv-builder/${cv.id}`)}><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleDuplicate(cv)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => router.push(`/cv/share/${cv.id}`)}><Share2 className="mr-2 h-4 w-4" /> Share Link</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleDelete(cv.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                           <CardTitle className="text-base font-bold truncate pr-8">{cv.title}</CardTitle>
                           <CardDescription className="text-[10px] flex items-center gap-1">
                             <Clock size={10} /> Updated {cv.updatedAt?.toDate ? formatDistanceToNow(cv.updatedAt.toDate(), { addSuffix: true }) : 'Recently'}
                           </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-2">
                          <Button variant="outline" size="sm" className="w-full font-bold text-xs" asChild>
                            <Link href={`/cv-builder/${cv.id}`}>Continue Editing</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History size={18} className="text-primary" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activityLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4" /></div>
                ) : activities?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent history.</p>
                ) : (
                  activities?.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="w-0.5 h-full bg-muted mt-2 group-last:hidden" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-bold leading-none">
                          {getActivityTitle(activity.type)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.details?.title || 'System action'}
                        </p>
                        <p className="text-[10px] font-black uppercase text-primary/60 mt-1.5 flex items-center gap-1">
                          <Clock size={10} />
                          {activity.timestamp?.toDate ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'create': return <Plus size={14} />;
    case 'edit': return <Settings size={14} />;
    case 'optimize': return <Wand2 size={14} />;
    case 'export': return <Download size={14} />;
    case 'share': return <Share2 size={14} />;
    case 'photo_upload': return <Camera size={14} />;
    default: return <Zap size={14} />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'create': return 'bg-blue-500/10 text-blue-500';
    case 'optimize': return 'bg-purple-500/10 text-purple-500';
    case 'export': return 'bg-green-500/10 text-green-500';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getActivityTitle(type: string) {
  switch (type) {
    case 'create': return 'Created New CV';
    case 'optimize': return 'AI Optimized';
    case 'export': return 'Exported PDF';
    case 'share': return 'Shared Public Link';
    case 'photo_upload': return 'Updated Photo';
    default: return 'Profile Action';
  }
}

function StatCard({ title, value, subValue, icon }: any) {
  return (
    <Card className="glass border-white/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
          <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
        </div>
        <div className="text-3xl font-headline font-bold mb-1">{value}</div>
        <p className="text-[10px] uppercase font-black text-muted-foreground/60">{subValue}</p>
      </CardContent>
    </Card>
  );
}
