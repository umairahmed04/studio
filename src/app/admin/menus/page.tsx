'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  GripVertical, 
  ChevronRight, 
  Save, 
  Layout, 
  Link as LinkIcon, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft,
  Menu,
  Wand2,
  Settings2,
  ExternalLink,
  Edit3,
  Tag,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn, cleanForFirestore } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  level: number;
}

/**
 * @fileOverview High-Performance Menu Management Hub.
 * WordPress-style menu builder with dynamic hierarchy and reordering.
 * Auto-provisions original site navigation for a seamless transition.
 */
export default function MenuManagement() {
  const db = useFirestore();
  const { toast } = useToast();

  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [editingMenu, setEditingMenu] = useState<{ name: string; items: MenuItem[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const isProvisioning = useRef(false);

  // Custom Link State
  const [customLink, setCustomLink] = useState({ label: '', url: '', isExternal: false });

  // Fetch Collections
  const pagesQuery = useMemo(() => db ? query(collection(db, 'pages')) : null, [db]);
  const blogQuery = useMemo(() => db ? query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc')) : null, [db]);
  const menusQuery = useMemo(() => db ? query(collection(db, 'menus')) : null, [db]);
  const locationsRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);

  const { data: pages } = useCollection(pagesQuery);
  const { data: posts } = useCollection(blogQuery);
  const { data: menus, loading: menusLoading } = useCollection(menusQuery);
  const { data: locations } = useDoc(locationsRef);

  const systemTools = [
    { label: 'ATS Resume Scan', href: '/ats-resume-checker' },
    { label: 'Interactive CV Builder', href: '/cv-builder' },
    { label: 'CV Compare & Match', href: '/cv-compare' },
    { label: 'AI Resume Optimizer', href: '/resume-optimizer' },
    { label: 'LinkedIn Audit', href: '/linkedin-profile-optimizer' },
    { label: 'LinkedIn Summary', href: '/linkedin-summary-generator' },
    { label: 'Job Matcher', href: '/job-description-matcher' },
    { label: 'Interview Prep', href: '/interview-prep' },
  ];

  // Logic: Restore Original Menu Structure on Provisioning
  useEffect(() => {
    const provision = async () => {
      if (!db || menusLoading || !menus || isProvisioning.current) return;
      
      const standardMenus = [
        { 
          name: 'Header Menu', 
          items: [
            { id: 'h-tools', label: 'Tools', href: '#', level: 0 },
            { id: 'h-ats', label: 'ATS Resume Scan', href: '/ats-resume-checker', level: 1 },
            { id: 'h-cvb', label: 'Interactive CV Builder', href: '/cv-builder', level: 1 },
            { id: 'h-cvc', label: 'CV Compare & Match', href: '/cv-compare', level: 1 },
            { id: 'h-rzo', label: 'AI Resume Optimizer', href: '/resume-optimizer', level: 1 },
            { id: 'h-lpa', label: 'LinkedIn Audit', href: '/linkedin-profile-optimizer', level: 1 },
            { id: 'h-lsg', label: 'LinkedIn Summary', href: '/linkedin-summary-generator', level: 1 },
            { id: 'h-jdm', label: 'Job Matcher', href: '/job-description-matcher', level: 1 },
            { id: 'h-itp', label: 'Interview Prep', href: '/interview-prep', level: 1 },
            { id: 'h-tpl', label: 'Templates', href: '/templates', level: 0 },
            { id: 'h-blg', label: 'Blog', href: '/blog', level: 0 },
            { id: 'h-abt', label: 'About', href: '/about', level: 0 }
          ]
        },
        { 
          name: 'Footer Menu', 
          items: [
            { id: 'f-tools-h', label: 'Tools', href: '#', level: 0 },
            { id: 'f-ats', label: 'ATS Resume Scan', href: '/ats-resume-checker', level: 1 },
            { id: 'f-cvb', label: 'CV Builder', href: '/cv-builder', level: 1 },
            { id: 'f-rzo', label: 'Resume Optimizer', href: '/resume-optimizer', level: 1 },
            { id: 'f-comp-h', label: 'Company', href: '#', level: 0 },
            { id: 'f-abt', label: 'About Us', href: '/about', level: 1 },
            { id: 'f-blg', label: 'Blog', href: '/blog', level: 1 },
            { id: 'f-cnt', label: 'Contact', href: '/contact', level: 1 },
            { id: 'f-leg-h', label: 'Legal', href: '#', level: 0 },
            { id: 'f-pri', label: 'Privacy Policy', href: '/privacy', level: 1 },
            { id: 'f-trm', label: 'Terms', href: '/terms', level: 1 },
            { id: 'f-dsc', label: 'Disclaimer', href: '/disclaimer', level: 1 }
          ]
        }
      ];

      let createdAny = false;
      for (const config of standardMenus) {
        const exists = menus.some(m => m.name === config.name);
        if (!exists) {
          isProvisioning.current = true;
          try {
            const docRef = await addDoc(collection(db, 'menus'), {
              name: config.name,
              items: config.items,
              createdAt: serverTimestamp()
            });
            if (locationsRef) {
              const locKey = config.name.toLowerCase().includes('header') ? 'header' : 'footer';
              await setDoc(locationsRef, { [locKey]: docRef.id }, { merge: true });
            }
            createdAny = true;
          } catch (e) {
            console.warn(`Failed to provision ${config.name}`);
          }
        }
      }
      if (createdAny) toast({ title: "Original Menus Restored & Synced" });
    };
    provision();
  }, [db, menus, menusLoading, toast, locationsRef]);

  useEffect(() => {
    if (menus && menus.length > 0 && !activeMenuId) {
      const header = menus.find(m => m.name === 'Header Menu');
      setActiveMenuId(header ? header.id : menus[0].id);
    }
  }, [menus, activeMenuId]);

  useEffect(() => {
    if (menus && activeMenuId) {
      const menu = menus.find(m => m.id === activeMenuId);
      if (menu) setEditingMenu({ name: menu.name, items: menu.items || [] });
    }
  }, [menus, activeMenuId]);

  const handleCreateMenu = async () => {
    if (!db) return;
    const name = prompt('Enter menu name:');
    if (!name) return;
    try {
      const docRef = await addDoc(collection(db, 'menus'), {
        name,
        items: [],
        createdAt: serverTimestamp()
      });
      setActiveMenuId(docRef.id);
      toast({ title: "Menu Created" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleSaveMenu = async () => {
    if (!db || !activeMenuId || !editingMenu) return;
    setSaving(true);
    try {
      const sanitizedData = cleanForFirestore({
        name: editingMenu.name,
        items: editingMenu.items,
        updatedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'menus', activeMenuId), sanitizedData, { merge: true });
      toast({ title: "Structure Secured" });
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setSaving(false);
    }
  };

  const addItemToMenu = (label: string, href: string, target: '_blank' | '_self' = '_self') => {
    if (!editingMenu) return;
    const newItem: MenuItem = {
      id: Math.random().toString(36).substring(7),
      label,
      href,
      target,
      level: 0
    };
    setEditingMenu({ ...editingMenu, items: [...editingMenu.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (!editingMenu) return;
    setEditingMenu({
      ...editingMenu,
      items: editingMenu.items.filter(item => item.id !== id)
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!editingMenu) return;
    const newItems = [...editingMenu.items];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setEditingMenu({ ...editingMenu, items: newItems });
  };

  const adjustNesting = (index: number, direction: 'left' | 'right') => {
    if (!editingMenu) return;
    const newItems = [...editingMenu.items];
    const item = newItems[index];
    if (direction === 'right' && item.level < 2) {
      item.level += 1;
    } else if (direction === 'left' && item.level > 0) {
      item.level -= 1;
    }
    setEditingMenu({ ...editingMenu, items: newItems });
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newItems = [...editingMenu!.items];
    const item = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, item);
    setEditingMenu({ ...editingMenu!, items: newItems });
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const handleAssignLocation = async (locKey: string, menuId: string) => {
    if (!locationsRef) return;
    try {
      await setDoc(locationsRef, { [locKey]: menuId }, { merge: true });
      toast({ title: "Location Mapped" });
    } catch (e) {
      toast({ variant: "destructive", title: "Assignment Failed" });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your site hierarchy and dynamic locations without UI changes.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handleCreateMenu} className="font-bold border-primary/20 text-primary">
             <Plus size={16} className="mr-2" /> New Menu
           </Button>
           <Button onClick={handleSaveMenu} disabled={saving || !editingMenu} className="font-bold shadow-lg shadow-primary/20 px-8">
             {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
             Save Changes
           </Button>
        </div>
      </div>

      <Card className="glass border-white/5">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest shrink-0">Current Menu:</span>
            <Select value={activeMenuId} onValueChange={setActiveMenuId}>
              <SelectTrigger className="w-full md:w-[250px] font-bold">
                <SelectValue placeholder="Choose a menu..." />
              </SelectTrigger>
              <SelectContent>
                {menus?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {activeMenuId && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold" onClick={async () => {
              if (confirm('Delete this menu structure?')) {
                await deleteDoc(doc(db!, 'menus', activeMenuId));
                setActiveMenuId('');
              }
            }}>
              <Trash2 size={14} className="mr-2" /> Delete Menu
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Layout size={14} className="text-primary" />
                Inject Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="tools" className="border-b px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">System Tools</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-2">
                    {systemTools.map((tool, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10 group hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-2">
                          <Wand2 size={12} className="text-primary" />
                          <span className="text-[11px] font-bold truncate pr-2">{tool.label}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => addItemToMenu(tool.label, tool.href)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pages" className="border-b px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Dynamic Pages</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-2">
                    {pages?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-white/5 group hover:border-primary/20 transition-all">
                        <span className="text-xs font-bold truncate pr-2">{p.title}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => addItemToMenu(p.title, `/${p.slug === 'home' ? '' : p.slug}`)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="posts" className="border-b px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Blog Articles</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-2">
                    {posts?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-white/5 group hover:border-primary/20 transition-all">
                        <span className="text-xs font-bold truncate pr-2">{p.title}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => addItemToMenu(p.title, `/blog/${p.slug || p.id}`)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="custom" className="border-0 px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Custom & External</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                         <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">URL Path / Link</Label>
                         <Input 
                           value={customLink.url}
                           onChange={(e) => setCustomLink({...customLink, url: e.target.value})}
                           placeholder="https://... or #anchor" 
                           className="h-9 text-xs font-mono" 
                         />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Label</Label>
                         <Input 
                           value={customLink.label}
                           onChange={(e) => setCustomLink({...customLink, label: e.target.value})}
                           placeholder="e.g. Help Center" 
                           className="h-9 text-xs" 
                         />
                      </div>
                      <div className="flex items-center gap-2">
                         <Checkbox 
                           id="is-ext-check" 
                           checked={customLink.isExternal} 
                           onCheckedChange={(checked) => setCustomLink({...customLink, isExternal: !!checked})} 
                         />
                         <Label htmlFor="is-ext-check" className="text-[10px] font-bold cursor-pointer">Open in new tab</Label>
                      </div>
                      <Button 
                        className="w-full h-9 text-[10px] font-black uppercase" 
                        size="sm" 
                        disabled={!customLink.label || !customLink.url}
                        onClick={() => {
                          addItemToMenu(customLink.label, customLink.url, customLink.isExternal ? '_blank' : '_self');
                          setCustomLink({ label: '', url: '', isExternal: false });
                        }}
                      >
                        Add to Structure
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50 overflow-hidden">
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Settings2 size={14} className="text-accent" />
                Assign Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Header Navigation</Label>
                    <Select value={locations?.header || ''} onValueChange={(val) => handleAssignLocation('header', val)}>
                      <SelectTrigger className="h-10 font-bold text-xs"><SelectValue placeholder="Assign menu" /></SelectTrigger>
                      <SelectContent>
                        {menus?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Footer Navigation</Label>
                    <Select value={locations?.footer || ''} onValueChange={(val) => handleAssignLocation('footer', val)}>
                      <SelectTrigger className="h-10 font-bold text-xs"><SelectValue placeholder="Assign menu" /></SelectTrigger>
                      <SelectContent>
                        {menus?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic leading-relaxed pt-4 border-t border-white/5">
                 Frontend UI remains identical; only data becomes dynamic.
               </p>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <Card className="border-white/5 bg-card/50 min-h-[600px] flex flex-col shadow-2xl">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between bg-muted/5">
              <div className="space-y-1">
                <CardTitle className="text-xl font-headline font-bold">Structure Builder</CardTitle>
                <CardDescription>Visual reordering for Header/Footer hierarchy.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Rename:</span>
                <Input 
                  value={editingMenu?.name || ''} 
                  onChange={(e) => editingMenu && setEditingMenu({ ...editingMenu, name: e.target.value })} 
                  className="w-40 h-8 font-bold text-xs" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {!editingMenu || editingMenu.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-4 border-2 border-dashed rounded-3xl opacity-40">
                  <Menu size={48} />
                  <p className="text-sm font-medium">Inject content to manage navigation.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editingMenu.items.map((item, idx) => (
                    <div 
                      key={`${item.id}-${idx}`} 
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group p-3 rounded-xl border border-white/5 bg-background shadow-sm flex items-center justify-between transition-all hover:border-primary/20 cursor-move",
                        draggedIdx === idx && "opacity-50 scale-[0.98] border-primary/40",
                        item.level === 1 && "ml-8 bg-muted/10",
                        item.level === 2 && "ml-16 bg-muted/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{item.label}</span>
                            {item.target === '_blank' && <ExternalLink size={10} className="text-primary" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{item.href}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-white/5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, 'up')} disabled={idx === 0}><ArrowUp size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, 'down')} disabled={idx === editingMenu.items.length - 1}><ArrowDown size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustNesting(idx, 'left')} disabled={item.level === 0}><ChevronLeft size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustNesting(idx, 'right')} disabled={item.level >= 2}><ChevronRight size={14} /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-6 border-t bg-muted/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                   {editingMenu?.items.length || 0} Original Nodes Mapped
                 </span>
              </div>
              <Button onClick={handleSaveMenu} disabled={saving || !editingMenu} className="font-bold px-10 h-11 shadow-lg shadow-primary/10">
                {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Sync Database
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}