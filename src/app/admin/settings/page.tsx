'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  Loader2, 
  Save, 
  Globe, 
  Megaphone, 
  ShieldCheck, 
  List, 
  Plus, 
  Trash2, 
  GripVertical, 
  FileText,
  Tag,
  Download,
  Database,
  History,
  FileCode,
  Upload,
  AlertCircle,
  CheckCircle2,
  Settings,
  RefreshCw,
  Clock,
  ShieldAlert,
  Wand2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function AdminSettings() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const navRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const blogRef = useMemo(() => db ? doc(db, 'settings', 'blog') : null, [db]);
  
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);
  const { data: navData, loading: navLoading } = useDoc(navRef);
  const { data: blogData, loading: blogLoading } = useDoc(blogRef);
  
  const backupQuery = useMemo(() => db ? query(collection(db, 'system_backups'), orderBy('timestamp', 'desc'), limit(10)) : null, [db]);
  const { data: backupHistory, loading: historyLoading } = useCollection(backupQuery);
  
  const [formData, setFormData] = useState<any>(null);
  const [navForm, setNavForm] = useState<any>({ menuItems: [] });
  const [blogForm, setBlogForm] = useState<any>({ categories: [] });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    } else if (!settingsLoading) {
      setFormData({
        adsense: { enabled: false, client: '', slots: { header: '', sidebar: '', footer: '', inContent: '' } },
        seo: { 
          siteName: 'ATSResumeScan', 
          defaultTitle: 'ATSResumeScan | Free AI ATS Resume Checker & CV Optimizer', 
          defaultDescription: 'Instantly check your ATS resume score, optimize with AI, and beat recruitment bots. Use our professional AI resume checker and CV optimizer to rank in the top 1% of applicants. Free, fast, and recruiter-approved.', 
          ogImage: 'https://atsresumescan.com/og-image.jpg' 
        },
        tools: { atsCheckerEnabled: true, resumeOptimizerEnabled: true, coverLetterEnabled: true }
      });
    }
  }, [settings, settingsLoading]);

  useEffect(() => {
    if (navData) {
      setNavForm({
        menuItems: [],
        ...navData
      });
    } else if (!navLoading) {
      setNavForm({
        menuItems: [],
        footer: { columns: [], social: { facebook: '', linkedin: '', twitter: '' } }
      });
    }
  }, [navData, navLoading]);

  useEffect(() => {
    if (blogData) {
      setBlogForm({
        categories: [],
        ...blogData
      });
    } else if (!blogLoading) {
      setBlogForm({
        categories: [
          'ATS Resume Tips',
          'Resume Examples',
          'Career Advice',
          'Interview Tips',
          'LinkedIn Optimization'
        ]
      });
    }
  }, [blogData, blogLoading]);

  const handleSaveSettings = async () => {
    if (!settingsRef || !formData) return;
    setSaving(true);
    try {
      const { id: _id, ...saveData } = formData;
      await setDoc(settingsRef, saveData, { merge: true });
      toast({ title: "Settings Saved", description: "Global configuration updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNav = async () => {
    if (!navRef || !navForm) return;
    setSaving(true);
    try {
      const { id: _id, ...saveData } = navForm;
      await setDoc(navRef, saveData, { merge: true });
      toast({ title: "Navigation Updated", description: "Changes are now live on the frontend." });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!blogRef || !blogForm) return;
    setSaving(true);
    try {
      const { id: _id, ...saveData } = blogForm;
      await setDoc(blogRef, saveData, { merge: true });
      toast({ title: "Blog Config Saved", description: "Categories have been updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportDatabase = async () => {
    if (!db || !user) return;
    setExporting(true);
    try {
      const collectionsToExport = [
        'pages', 
        'blog_posts', 
        'blog_categories', 
        'menus', 
        'users', 
        'settings',
        'usernames',
        'media',
        'cv_templates',
        'analytics_events'
      ];
      
      const fullBackup: any = {
        metadata: {
          version: "2.0",
          timestamp: new Date().toISOString(),
          author: user.email,
          site: "ATSResumeScan"
        },
        data: {}
      };

      for (const colName of collectionsToExport) {
        const querySnapshot = await getDocs(collection(db, colName));
        const docs = [];
        
        for (const d of querySnapshot.docs) {
          const docData: any = {
            id: d.id,
            ...d.data()
          };

          // Capture Sub-collections for Pages (Sections)
          if (colName === 'pages') {
            const sectionsSnap = await getDocs(collection(db, 'pages', d.id, 'sections'));
            docData._sections = sectionsSnap.docs.map(s => ({
              id: s.id,
              ...s.data()
            }));
          }

          // Capture Sub-collections for Users (CVs, Scans, Logs)
          if (colName === 'users') {
            const cvsSnap = await getDocs(collection(db, 'users', d.id, 'cvs'));
            docData._cvs = cvsSnap.docs.map(c => ({ id: c.id, ...c.data() }));

            const scansSnap = await getDocs(collection(db, 'users', d.id, 'scans'));
            docData._scans = scansSnap.docs.map(s => ({ id: s.id, ...s.data() }));

            const logsSnap = await getDocs(collection(db, 'users', d.id, 'activityLog'));
            docData._activityLog = logsSnap.docs.map(l => ({ id: l.id, ...l.data() }));
          }

          docs.push(docData);
        }
        fullBackup.data[colName] = docs;
      }

      const jsonStr = JSON.stringify(fullBackup, null, 2);
      const filename = `ATS_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log backup to history
      await addDoc(collection(db, 'system_backups'), {
        filename,
        timestamp: serverTimestamp(),
        author: user.email,
        type: 'full',
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'success'
      });

      toast({ title: "Full Backup Ready", description: "Website state and files have been archived." });
    } catch (error) {
      console.error("Export Error:", error);
      toast({ variant: "destructive", title: "Backup Engine Failure" });
    } finally {
      setExporting(false);
    }
  };

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !db || !confirm('CRITICAL: This will overwrite existing production data. Proceed with restoration?')) return;

    setImporting(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup.data) throw new Error("Invalid backup format.");

      for (const [colName, docs] of Object.entries(backup.data)) {
        if (!Array.isArray(docs)) continue;

        for (const docObj of docs as any[]) {
          const { id, _sections, _cvs, _scans, _activityLog, ...docData } = docObj;
          const docRef = doc(db, colName, id);
          
          await setDoc(docRef, { ...docData, updatedAt: serverTimestamp() }, { merge: true });

          // Restore Page Sections
          if (colName === 'pages' && _sections) {
            for (const section of _sections) {
              const { id: sId, ...sData } = section;
              await setDoc(doc(db, 'pages', id, 'sections', sId), sData, { merge: true });
            }
          }

          // Restore User Nesting
          if (colName === 'users') {
            if (_cvs) for (const c of _cvs) await setDoc(doc(db, 'users', id, 'cvs', c.id), c, { merge: true });
            if (_scans) for (const s of _scans) await setDoc(doc(db, 'users', id, 'scans', s.id), s, { merge: true });
            if (_activityLog) for (const l of _activityLog) await setDoc(doc(db, 'users', id, 'activityLog', l.id), l, { merge: true });
          }
        }
      }

      toast({ title: "System Restored", description: "Production state synchronized from backup file." });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error("Import Error:", error);
      toast({ variant: "destructive", title: "Restoration Failed", description: error.message });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteBackupLog = async (id: string) => {
    if (!db || !confirm('Remove this log entry? (The local file remains)')) return;
    await deleteDoc(doc(db, 'system_backups', id));
  };

  if (settingsLoading || navLoading || blogLoading || !formData) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-card/50 backdrop-blur p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-3xl font-headline font-bold">Platform Control</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            Manage global site logic and data integrity.
          </p>
        </div>
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImportDatabase} className="hidden" accept=".json" />
          <Button variant="outline" className="border-primary/20 text-primary font-bold h-12 rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
            Restore Production State
          </Button>
          <Button className="font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20" onClick={handleExportDatabase} disabled={exporting}>
            {exporting ? <Loader2 className="animate-spin mr-2" /> : <Database size={18} className="mr-2" />}
            Create Full Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-14 bg-muted/50 p-1 rounded-2xl border border-white/5">
          <TabsTrigger value="backup" className="rounded-xl font-bold"><Database size={16} className="mr-2" /> Backup Suite</TabsTrigger>
          <TabsTrigger value="nav" className="rounded-xl font-bold"><List size={16} className="mr-2" /> Navigation</TabsTrigger>
          <TabsTrigger value="blog" className="rounded-xl font-bold"><FileText size={16} className="mr-2" /> Blog Setup</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl font-bold"><Globe size={16} className="mr-2" /> SEO</TabsTrigger>
          <TabsTrigger value="ads" className="rounded-xl font-bold"><Megaphone size={16} className="mr-2" /> AdSense</TabsTrigger>
          <TabsTrigger value="tools" className="rounded-xl font-bold"><ShieldCheck size={16} className="mr-2" /> AI Toggles</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="pt-8 space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                 <Card className="border-primary/20 bg-primary/5 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                             <Database size={28} />
                          </div>
                          <div>
                             <CardTitle className="text-2xl font-headline font-bold">One-Click Disaster Recovery</CardTitle>
                             <CardDescription>Generate high-fidelity snapshots of all production data.</CardDescription>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <BackupStat icon={<FileCode className="text-blue-500" />} label="Structural" count="All Pages" />
                          <BackupStat icon={<FileText className="text-purple-500" />} label="Content" count="Blog Posts" />
                          <BackupStat icon={<Clock className="text-green-500" />} label="User State" count="CVs & Scans" />
                       </div>
                       
                       <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-6">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <AlertTitle className="font-bold text-primary mb-1">Backup Specification</AlertTitle>
                          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
                            The backup engine encapsulates all Firestore collections into a portable JSON structure. 
                            This includes custom page sections, SEO settings, and binary asset references. 
                            Use this file to migrate between Firebase projects or recover from accidental deletions.
                          </AlertDescription>
                       </Alert>

                       <div className="flex justify-center pt-4">
                          <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30 group" onClick={handleExportDatabase} disabled={exporting}>
                             {exporting ? <Loader2 className="animate-spin mr-3" size={24} /> : <RefreshCw className="mr-3 group-hover:rotate-180 transition-transform duration-700" size={24} />}
                             Generate Production Snapshot
                          </Button>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="glass border-white/10 rounded-3xl overflow-hidden">
                    <CardHeader className="p-8 border-b bg-muted/5">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <History className="text-primary" size={20} />
                             <CardTitle className="text-xl">Backup Archive</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3">Last 10 Actions</Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-white/5">
                          {historyLoading ? (
                            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
                          ) : !backupHistory || backupHistory.length === 0 ? (
                            <div className="p-16 text-center text-muted-foreground italic">No backup history recorded.</div>
                          ) : (
                            backupHistory.map((log: any) => (
                              <div key={log.id} className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                       <FileCode size={20} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold truncate max-w-[200px]">{log.filename}</p>
                                       <div className="flex items-center gap-3 text-[10px] uppercase font-black text-muted-foreground/60 tracking-tight mt-1">
                                          <span className="flex items-center gap-1"><Clock size={10} /> {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'MMM d, h:mm a') : 'Now'}</span>
                                          <span>•</span>
                                          <span>Size: {log.size}</span>
                                          <span>•</span>
                                          <span className="text-primary">{log.author}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDeleteBackupLog(log.id)}>
                                    <Trash2 size={16} />
                                 </Button>
                              </div>
                            ))
                          )}
                       </div>
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-4 space-y-6">
                 <Card className="glass border-white/10 rounded-3xl overflow-hidden sticky top-24">
                    <CardHeader className="bg-muted/10 p-6 border-b">
                       <CardTitle className="text-lg flex items-center gap-2">
                          <Upload size={18} className="text-primary" />
                          Restoration Portal
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                       <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-muted-foreground/30">
                             <FileCode size={32} className="text-muted-foreground/40" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="font-bold text-sm">Upload Snapshot</h4>
                             <p className="text-xs text-muted-foreground leading-relaxed">
                               Select an `.json` backup file to restore the database to a previous state.
                             </p>
                          </div>
                          <Button variant="outline" className="w-full h-12 font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                             {importing ? <Loader2 className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                             Restore State
                          </Button>
                       </div>
                       
                       <div className="pt-6 border-t border-white/5">
                          <Alert variant="destructive" className="bg-destructive/5 border-destructive/10 rounded-2xl">
                             <ShieldAlert size={14} />
                             <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Restoration Warning</AlertTitle>
                             <AlertDescription className="text-[10px] opacity-70">
                               Restoring will overwrite current production data. This action is not reversible.
                             </AlertDescription>
                          </Alert>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-dashed border-2 border-primary/20 bg-primary/5 rounded-3xl p-6">
                    <CardContent className="p-0 space-y-4">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="text-primary" size={20} />
                          <h4 className="font-bold text-sm">Security Audit</h4>
                       </div>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                         Backups are generated with client-side serialization to ensure 100% data fidelity. Metadata for each action is logged for compliance and security monitoring.
                       </p>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="nav" className="pt-8">
          <Card className="border-white/5 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/5 p-8 border-b">
              <div>
                <CardTitle>Global Navigation Links</CardTitle>
                <CardDescription>Primary menu structures for the live application.</CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveNav} disabled={saving} className="rounded-xl px-6 font-bold"><Save size={16} className="mr-2" /> Save Navigation</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
               {navForm.menuItems?.map((item: any, idx: number) => (
                 <div key={idx} className="flex gap-4 items-center bg-card/50 p-4 rounded-2xl border border-white/5">
                    <GripVertical size={16} className="text-muted-foreground" />
                    <Input placeholder="Label" value={item.label} className="h-11 rounded-xl" onChange={(e) => {
                      const newMenu = [...navForm.menuItems];
                      newMenu[idx].label = e.target.value;
                      setNavForm({...navForm, menuItems: newMenu});
                    }} />
                    <Input placeholder="Link" value={item.href} className="h-11 rounded-xl" onChange={(e) => {
                      const newMenu = [...navForm.menuItems];
                      newMenu[idx].href = e.target.value;
                      setNavForm({...navForm, menuItems: newMenu});
                    }} />
                    <Button variant="ghost" size="icon" className="text-destructive rounded-xl" onClick={() => {
                      const newMenu = navForm.menuItems.filter((_: any, i: number) => i !== idx);
                      setNavForm({...navForm, menuItems: newMenu});
                    }}><Trash2 size={16} /></Button>
                 </div>
               ))}
               <Button variant="outline" className="w-full border-dashed h-12 rounded-2xl" onClick={() => {
                 setNavForm({...navForm, menuItems: [...(navForm.menuItems || []), { label: '', href: '' }]});
               }}><Plus size={16} className="mr-2" /> Add Menu Item</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="pt-8">
          <Card className="border-white/5 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/5 p-8 border-b">
              <div>
                <CardTitle>Content Taxonomy</CardTitle>
                <CardDescription>Organize your articles and career resources.</CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveBlog} disabled={saving} className="rounded-xl px-6 font-bold"><Save size={16} className="mr-2" /> Save Blog Config</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
               {blogForm.categories?.map((cat: string, idx: number) => (
                 <div key={idx} className="flex gap-4 items-center bg-card/50 p-4 rounded-2xl border border-white/5">
                    <Tag size={16} className="text-primary opacity-50" />
                    <Input 
                      placeholder="Category Name" 
                      value={cat} 
                      className="h-11 rounded-xl"
                      onChange={(e) => {
                        const newCats = [...blogForm.categories];
                        newCats[idx] = e.target.value;
                        setBlogForm({...blogForm, categories: newCats});
                      }} 
                    />
                    <Button variant="ghost" size="icon" className="text-destructive rounded-xl" onClick={() => {
                      const newCats = blogForm.categories.filter((_: any, i: number) => i !== idx);
                      setBlogForm({...blogForm, categories: newCats});
                    }}><Trash2 size={16} /></Button>
                 </div>
               ))}
               <Button variant="outline" className="w-full border-dashed h-12 rounded-2xl" onClick={() => {
                 setBlogForm({...blogForm, categories: [...(blogForm.categories || []), '']});
               }}><Plus size={16} className="mr-2" /> Add Category</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-8">
          <Card className="shadow-sm border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="flex justify-between flex-row items-center bg-muted/5 p-8 border-b">
              <div>
                <CardTitle>Global Identity & SEO</CardTitle>
                <CardDescription>Default meta-data and branding configuration.</CardDescription>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} className="rounded-xl px-6 font-bold"><Save size={16} className="mr-2" /> Save SEO</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Site Public Name</label>
                  <Input 
                    value={formData.seo?.siteName || ''} 
                    className="h-12 rounded-xl"
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, siteName: e.target.value}})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Default Title Template</label>
                  <Input 
                    value={formData.seo?.defaultTitle || ''} 
                    className="h-12 rounded-xl"
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, defaultTitle: e.target.value}})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Master Meta Description</label>
                <Textarea 
                  rows={4}
                  className="rounded-2xl resize-none p-4"
                  value={formData.seo?.defaultDescription || ''} 
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, defaultDescription: e.target.value}})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="pt-8">
          <Card className="shadow-sm border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/5 p-8 border-b">
              <div>
                <CardTitle>AdSense Engine</CardTitle>
                <CardDescription>Manage monetization and global ad serving.</CardDescription>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Ads</span>
                   <Switch 
                     checked={formData?.adsense?.enabled}
                     onCheckedChange={(checked) => setFormData({...formData, adsense: {...formData.adsense, enabled: checked}})}
                   />
                </div>
                <Button onClick={handleSaveSettings} disabled={saving} className="rounded-xl font-bold"><Save size={16} /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Publisher ID (CA-PUB)</label>
                <Input 
                  value={formData?.adsense?.client || ''} 
                  className="h-12 font-mono rounded-xl"
                  onChange={(e) => setFormData({...formData, adsense: {...formData.adsense, client: e.target.value}})}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="pt-8">
          <Card className="shadow-sm border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="flex justify-between flex-row items-center bg-muted/5 p-8 border-b">
              <div>
                <CardTitle>AI Feature Configuration</CardTitle>
                <CardDescription>Global toggles for specialized career tools.</CardDescription>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} className="rounded-xl px-6 font-bold"><Save size={16} className="mr-2" /> Save Toggles</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {formData?.tools && Object.entries(formData.tools).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-5 rounded-2xl bg-card/50 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-all">
                        <Wand2 size={18} />
                     </div>
                     <span className="font-bold capitalize text-sm">{key.replace('Enabled', '').replace(/([A-Z])/g, ' $1')} Tool</span>
                  </div>
                  <Switch checked={val} onCheckedChange={(v) => setFormData({...formData, tools: {...formData.tools, [key]: v}})} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BackupStat({ icon, label, count }: any) {
  return (
    <div className="p-4 rounded-2xl bg-background border border-white/5 shadow-sm flex items-center gap-3">
       <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">{icon}</div>
       <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter leading-none mb-1">{label}</p>
          <p className="text-sm font-bold">{count}</p>
       </div>
    </div>
  );
}
