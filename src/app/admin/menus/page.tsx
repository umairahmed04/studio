'use client';

import { useState, useMemo, useEffect } from 'react';
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
  ChevronDown, 
  Save, 
  Layout, 
  Link as LinkIcon, 
  ArrowRight, 
  FileText, 
  Tag, 
  Check, 
  Settings2,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { cn, cleanForFirestore } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  children?: MenuItem[];
  level: number;
}

export default function MenuManagement() {
  const db = useFirestore();
  const { toast } = useToast();

  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [editingMenu, setEditingMenu] = useState<{ name: string; items: MenuItem[] } | null>(null);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Collections for Menu Sources
  const pagesQuery = useMemo(() => db ? query(collection(db, 'pages')) : null, [db]);
  const blogQuery = useMemo(() => db ? query(collection(db, 'blog_posts'), orderBy('updatedAt', 'desc')) : null, [db]);
  const menusQuery = useMemo(() => db ? query(collection(db, 'menus')) : null, [db]);
  const locationsRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);

  const { data: pages } = useCollection(pagesQuery);
  const { data: posts } = useCollection(blogQuery);
  const { data: menus, loading: menusLoading } = useCollection(menusQuery);
  const { data: locations } = useDoc(locationsRef);

  useEffect(() => {
    if (menus && menus.length > 0 && !activeMenuId) {
      setActiveMenuId(menus[0].id);
    }
  }, [menus, activeMenuId]);

  useEffect(() => {
    if (menus && activeMenuId) {
      const menu = menus.find(m => m.id === activeMenuId);
      if (menu) {
        setEditingMenu({ name: menu.name, items: menu.items || [] });
      }
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

  const handleDeleteMenu = async () => {
    if (!db || !activeMenuId || !confirm('Permanently delete this menu structure?')) return;
    try {
      await deleteDoc(doc(db, 'menus', activeMenuId));
      setActiveMenuId(menus?.[0]?.id || '');
      toast({ title: "Menu Deleted" });
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
      toast({ title: "Menu Saved", description: "All changes are now live." });
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignLocation = async (locKey: string, menuId: string) => {
    if (!locationsRef) return;
    try {
      await setDoc(locationsRef, { [locKey]: menuId }, { merge: true });
      toast({ title: "Location Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const addItemToMenu = (label: string, href: string) => {
    if (!editingMenu) return;
    const newItem: MenuItem = {
      id: Math.random().toString(36).substring(7),
      label,
      href,
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

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Build and organize your site's navigation structures.</p>
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
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest shrink-0">Select Menu:</span>
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
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold" onClick={handleDeleteMenu}>
              <Trash2 size={14} className="mr-2" /> Delete Menu
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Available Content */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Layout size={14} className="text-primary" />
                Add Menu Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="pages" className="border-b px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Pages</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-2">
                    {pages?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-white/5 group">
                        <span className="text-xs font-bold truncate pr-2">{p.title}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => addItemToMenu(p.title, `/${p.slug === 'home' ? '' : p.slug}`)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="posts" className="border-b px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Blog Posts</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-2">
                    {posts?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-white/5 group">
                        <span className="text-xs font-bold truncate pr-2">{p.title}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => addItemToMenu(p.title, `/blog/${p.slug || p.id}`)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="custom" className="border-0 px-4">
                  <AccordionTrigger className="text-xs font-bold hover:no-underline py-4">Custom Links</AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                         <Label className="text-[9px] font-black uppercase">URL</Label>
                         <Input id="custom-url" placeholder="https://..." className="h-8 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-[9px] font-black uppercase">Link Text</Label>
                         <Input id="custom-label" placeholder="Menu Item" className="h-8 text-xs" />
                      </div>
                      <Button className="w-full h-8 text-[10px] font-black uppercase" size="sm" onClick={() => {
                        const url = (document.getElementById('custom-url') as HTMLInputElement).value;
                        const label = (document.getElementById('custom-label') as HTMLInputElement).value;
                        if(url && label) addItemToMenu(label, url);
                      }}>Add to Menu</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                <Settings2 size={14} className="text-accent" />
                Menu Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground">Primary Header</Label>
                    <Select value={locations?.header || ''} onValueChange={(val) => handleAssignLocation('header', val)}>
                      <SelectTrigger className="h-9 font-bold text-xs"><SelectValue placeholder="Assign a menu" /></SelectTrigger>
                      <SelectContent>
                        {menus?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-muted-foreground">Main Footer</Label>
                    <Select value={locations?.footer || ''} onValueChange={(val) => handleAssignLocation('footer', val)}>
                      <SelectTrigger className="h-9 font-bold text-xs"><SelectValue placeholder="Assign a menu" /></SelectTrigger>
                      <SelectContent>
                        {menus?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               <p className="text-[9px] text-muted-foreground italic leading-relaxed pt-4 border-t border-white/5">
                 Changes to location assignments reflect instantly on the public website.
               </p>
            </CardContent>
          </Card>
        </aside>

        {/* Right Side: Menu Builder */}
        <main className="lg:col-span-8 space-y-6">
          <Card className="border-white/5 bg-card/50 min-h-[600px] flex flex-col">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between bg-muted/5">
              <div className="space-y-1">
                <CardTitle className="text-xl font-headline font-bold">Menu Structure</CardTitle>
                <CardDescription>Drag and drop items to reorder and create submenus.</CardDescription>
              </div>
              <Input 
                value={editingMenu?.name || ''} 
                onChange={(e) => editingMenu && setEditingMenu({ ...editingMenu, name: e.target.value })} 
                className="w-48 h-8 font-bold text-xs" 
                placeholder="Menu Name"
              />
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {!editingMenu || editingMenu.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-4 border-2 border-dashed rounded-3xl opacity-40">
                  <Menu size={48} />
                  <p className="text-sm font-medium">Add items from the left to start building your menu.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editingMenu.items.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "group p-3 rounded-xl border border-white/5 bg-background shadow-sm flex items-center justify-between transition-all hover:border-primary/20",
                        item.level === 1 && "ml-8 bg-muted/10",
                        item.level === 2 && "ml-16 bg-muted/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-0.5 shrink-0 opacity-40">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{item.href}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-white/5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, 'up')} disabled={idx === 0}><ArrowUp size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(idx, 'down')} disabled={idx === editingMenu.items.length - 1}><ArrowDown size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustNesting(idx, 'left')} disabled={item.level === 0}><ChevronLeft size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustNesting(idx, 'right')} disabled={item.level >= 2}><ChevronRight size={14} /></Button>
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
            {editingMenu && editingMenu.items.length > 0 && (
              <CardFooter className="p-6 border-t bg-muted/10 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {editingMenu.items.length} Root Items & Submenus
                </p>
                <Button onClick={handleSaveMenu} disabled={saving} className="font-bold px-8">
                  {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                  Save Menu Structure
                </Button>
              </CardFooter>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
