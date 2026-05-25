'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
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
  FileCode
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const navRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const blogRef = useMemo(() => db ? doc(db, 'settings', 'blog') : null, [db]);
  
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);
  const { data: navData, loading: navLoading } = useDoc(navRef);
  const { data: blogData, loading: blogLoading } = useDoc(blogRef);
  
  const [formData, setFormData] = useState<any>(null);
  const [navForm, setNavForm] = useState<any>(null);
  const [blogForm, setBlogForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    } else if (!settingsLoading) {
      setFormData({
        adsense: { enabled: false, client: '', slots: { header: '', sidebar: '', footer: '', inContent: '' } },
        seo: { siteName: 'ATSResumeScan', defaultTitle: '', defaultDescription: '', ogImage: '' },
        tools: { atsCheckerEnabled: true, resumeOptimizerEnabled: true, coverLetterEnabled: true }
      });
    }
  }, [settings, settingsLoading]);

  useEffect(() => {
    if (navData) {
      setNavForm(navData);
    } else if (!navLoading) {
      setNavForm({
        menuItems: [
          { label: 'Templates', href: '/templates' },
          { label: 'Blog', href: '/blog' },
          { label: 'About', href: '/about' }
        ],
        footer: {
          columns: [
            { title: 'Tools', links: [{ label: 'ATS Scan', href: '/ats-resume-checker' }] },
            { title: 'Company', links: [{ label: 'About', href: '/about' }] }
          ],
          social: { facebook: '', linkedin: '', twitter: '' }
        }
      });
    }
  }, [navData, navLoading]);

  useEffect(() => {
    if (blogData) {
      setBlogForm(blogData);
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

  /**
   * DATABASE EXPORT ENGINE
   * Satisfies the requirement for a complete database backup/download.
   */
  const handleExportDatabase = async () => {
    if (!db) return;
    setExporting(true);
    try {
      const collectionsToExport = [
        'pages', 
        'blog_posts', 
        'blog_categories', 
        'menus', 
        'users', 
        'settings'
      ];
      
      const fullBackup: any = {};

      for (const colName of collectionsToExport) {
        const querySnapshot = await getDocs(collection(db, colName));
        fullBackup[colName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // Create a downloadable JSON blob
      const jsonStr = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ATSResumeScan_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Backup Successful", description: "JSON export downloaded to your device." });
    } catch (error) {
      console.error("Export Error:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Could not generate database JSON." });
    } finally {
      setExporting(false);
    }
  };

  if (settingsLoading || navLoading || blogLoading || !formData || !navForm || !blogForm) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Platform CMS</h1>
          <p className="text-muted-foreground">Manage global settings and dynamic content taxonomies.</p>
        </div>
        <Button variant="outline" className="border-primary/20 text-primary font-bold" onClick={handleExportDatabase} disabled={exporting}>
          {exporting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
          Export Database Backup
        </Button>
      </div>

      <Tabs defaultValue="nav" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="nav"><List size={16} className="mr-2" /> Navigation</TabsTrigger>
          <TabsTrigger value="blog"><FileText size={16} className="mr-2" /> Blog Settings</TabsTrigger>
          <TabsTrigger value="seo"><Globe size={16} className="mr-2" /> Global SEO</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone size={16} className="mr-2" /> AdSense</TabsTrigger>
          <TabsTrigger value="tools"><ShieldCheck size={16} className="mr-2" /> AI Tools</TabsTrigger>
          <TabsTrigger value="backup"><Database size={16} className="mr-2" /> System Export</TabsTrigger>
        </TabsList>

        <TabsContent value="nav" className="pt-6 space-y-6">
          <Card className="border-white/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Main Menu</CardTitle>
                <CardDescription>Manage the links in your primary header.</CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveNav} disabled={saving}><Save size={16} className="mr-2" /> Save Navigation</Button>
            </CardHeader>
            <CardContent className="space-y-4">
               {navForm.menuItems.map((item: any, idx: number) => (
                 <div key={idx} className="flex gap-4 items-center bg-muted/20 p-3 rounded-lg border">
                    <GripVertical size={16} className="text-muted-foreground" />
                    <Input placeholder="Label" value={item.label} onChange={(e) => {
                      const newMenu = [...navForm.menuItems];
                      newMenu[idx].label = e.target.value;
                      setNavForm({...navForm, menuItems: newMenu});
                    }} />
                    <Input placeholder="Link" value={item.href} onChange={(e) => {
                      const newMenu = [...navForm.menuItems];
                      newMenu[idx].href = e.target.value;
                      setNavForm({...navForm, menuItems: newMenu});
                    }} />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      const newMenu = navForm.menuItems.filter((_: any, i: number) => i !== idx);
                      setNavForm({...navForm, menuItems: newMenu});
                    }}><Trash2 size={16} /></Button>
                 </div>
               ))}
               <Button variant="outline" className="w-full border-dashed" onClick={() => {
                 setNavForm({...navForm, menuItems: [...navForm.menuItems, { label: '', href: '' }]});
               }}><Plus size={16} className="mr-2" /> Add Menu Item</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="pt-6 space-y-6">
          <Card className="border-white/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Blog Categories</CardTitle>
                <CardDescription>Manage the taxonomies used to organize your career content.</CardDescription>
              </div>
              <Button size="sm" onClick={handleSaveBlog} disabled={saving}><Save size={16} className="mr-2" /> Save Blog Config</Button>
            </CardHeader>
            <CardContent className="space-y-4">
               {blogForm.categories.map((cat: string, idx: number) => (
                 <div key={idx} className="flex gap-4 items-center bg-muted/20 p-3 rounded-lg border">
                    <Tag size={16} className="text-primary opacity-50" />
                    <Input 
                      placeholder="Category Name" 
                      value={cat} 
                      onChange={(e) => {
                        const newCats = [...blogForm.categories];
                        newCats[idx] = e.target.value;
                        setBlogForm({...blogForm, categories: newCats});
                      }} 
                    />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      const newCats = blogForm.categories.filter((_: any, i: number) => i !== idx);
                      setBlogForm({...blogForm, categories: newCats});
                    }}><Trash2 size={16} /></Button>
                 </div>
               ))}
               <Button variant="outline" className="w-full border-dashed" onClick={() => {
                 setBlogForm({...blogForm, categories: [...blogForm.categories, '']});
               }}><Plus size={16} className="mr-2" /> Add Category</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-6 space-y-6">
          <Card className="shadow-sm border-white/5">
            <CardHeader className="flex justify-between flex-row items-center">
              <div>
                <CardTitle>Site-wide SEO</CardTitle>
                <CardDescription>Default metadata for search engines.</CardDescription>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}><Save size={16} className="mr-2" /> Save SEO</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Site Name</label>
                  <Input 
                    value={formData.seo.siteName} 
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, siteName: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Default Meta Title</label>
                  <Input 
                    value={formData.seo.defaultTitle} 
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, defaultTitle: e.target.value}})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Default Meta Description</label>
                <Textarea 
                  rows={4}
                  value={formData.seo.defaultDescription} 
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, defaultDescription: e.target.value}})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="pt-6 space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Database className="text-primary" />
                   Enterprise Data Export
                </CardTitle>
                <CardDescription>
                   Generate a complete structural backup of your site's content and configurations.
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 rounded-xl bg-background border flex items-center gap-3">
                      <FileCode className="text-blue-500" />
                      <div>
                         <p className="text-xs font-black uppercase text-muted-foreground">Pages</p>
                         <p className="text-lg font-bold">Structural</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-background border flex items-center gap-3">
                      <FileText className="text-purple-500" />
                      <div>
                         <p className="text-xs font-black uppercase text-muted-foreground">Content</p>
                         <p className="text-lg font-bold">Blog Posts</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-background border flex items-center gap-3">
                      <Settings className="text-green-500" />
                      <div>
                         <p className="text-xs font-black uppercase text-muted-foreground">Config</p>
                         <p className="text-lg font-bold">Menus/SEO</p>
                      </div>
                   </div>
                </div>

                <div className="p-6 rounded-2xl bg-muted/50 border border-dashed text-center space-y-4">
                   <History className="mx-auto text-muted-foreground opacity-40" size={40} />
                   <div className="space-y-1">
                      <h4 className="font-bold">JSON Data Recovery Point</h4>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                         Exports all Firestore collections as a single high-fidelity JSON file. Use this for migrations, offline backups, or data audit purposes.
                      </p>
                   </div>
                   <Button size="lg" className="px-12 font-bold shadow-lg shadow-primary/20" onClick={handleExportDatabase} disabled={exporting}>
                      {exporting ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                      Generate Production Backup
                   </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="pt-6 space-y-6">
          <Card className="shadow-sm border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AdSense Configuration</CardTitle>
                <CardDescription>Manage monetization slots.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Enable Ads</span>
                <Switch 
                  checked={formData.adsense.enabled}
                  onCheckedChange={(checked) => setFormData({...formData, adsense: {...formData.adsense, enabled: checked}})}
                />
                <Button onClick={handleSaveSettings} disabled={saving} className="ml-4"><Save size={16} /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Publisher ID</label>
                <Input 
                  value={formData.adsense.client} 
                  onChange={(e) => setFormData({...formData, adsense: {...formData.adsense, client: e.target.value}})}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="pt-6 space-y-6">
          <Card className="shadow-sm border-white/5">
            <CardHeader className="flex justify-between flex-row items-center">
              <div>
                <CardTitle>AI Feature Toggles</CardTitle>
                <CardDescription>Enable or disable specific tools.</CardDescription>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving}><Save size={16} /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.tools).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/5">
                  <span className="font-bold capitalize">{key.replace('Enabled', '').replace(/([A-Z])/g, ' $1')}</span>
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
