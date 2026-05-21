'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  Tag
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

  if (settingsLoading || navLoading || blogLoading || !formData || !navForm || !blogForm) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Platform CMS</h1>
          <p className="text-muted-foreground">Manage global settings and dynamic content taxonomies.</p>
        </div>
      </div>

      <Tabs defaultValue="nav" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="nav"><List size={16} className="mr-2" /> Navigation</TabsTrigger>
          <TabsTrigger value="blog"><FileText size={16} className="mr-2" /> Blog Settings</TabsTrigger>
          <TabsTrigger value="seo"><Globe size={16} className="mr-2" /> Global SEO</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone size={16} className="mr-2" /> AdSense</TabsTrigger>
          <TabsTrigger value="tools"><ShieldCheck size={16} className="mr-2" /> AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="nav" className="pt-6 space-y-6">
          <Card className="border-white/5">
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

          <Card className="border-white/5">
            <CardHeader><CardTitle>Footer Structure</CardTitle></CardHeader>
            <CardContent className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {navForm.footer.columns.map((col: any, cIdx: number) => (
                   <div key={cIdx} className="space-y-4 p-4 border rounded-xl bg-card">
                      <div className="flex justify-between items-center">
                        <Input className="font-bold text-sm h-8" value={col.title} onChange={(e) => {
                          const newFooter = {...navForm.footer};
                          newFooter.columns[cIdx].title = e.target.value;
                          setNavForm({...navForm, footer: newFooter});
                        }} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                          const newFooter = {...navForm.footer};
                          newFooter.columns = newFooter.columns.filter((_: any, i: number) => i !== cIdx);
                          setNavForm({...navForm, footer: newFooter});
                        }}><Trash2 size={14} /></Button>
                      </div>
                      <div className="space-y-2">
                        {col.links.map((link: any, lIdx: number) => (
                          <div key={lIdx} className="flex gap-2">
                             <Input placeholder="Label" className="text-xs h-8" value={link.label} onChange={(e) => {
                               const newFooter = {...navForm.footer};
                               newFooter.columns[cIdx].links[lIdx].label = e.target.value;
                               setNavForm({...navForm, footer: newFooter});
                             }} />
                             <Input placeholder="Href" className="text-xs h-8" value={link.href} onChange={(e) => {
                               const newFooter = {...navForm.footer};
                               newFooter.columns[cIdx].links[lIdx].href = e.target.value;
                               setNavForm({...navForm, footer: newFooter});
                             }} />
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                               const newFooter = {...navForm.footer};
                               newFooter.columns[cIdx].links = newFooter.columns[cIdx].links.filter((_: any, i: number) => i !== lIdx);
                               setNavForm({...navForm, footer: newFooter});
                             }}><Trash2 size={12} /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-dashed" onClick={() => {
                          const newFooter = {...navForm.footer};
                          newFooter.columns[cIdx].links.push({ label: '', href: '' });
                          setNavForm({...navForm, footer: newFooter});
                        }}>Add Link</Button>
                      </div>
                   </div>
                 ))}
                 <Button variant="outline" className="h-full border-dashed" onClick={() => {
                   const newFooter = {...navForm.footer};
                   newFooter.columns.push({ title: 'New Column', links: [] });
                   setNavForm({...navForm, footer: newFooter});
                 }}><Plus size={20} className="mb-2" /> Add Column</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="pt-6 space-y-6">
          <Card className="border-white/5">
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
