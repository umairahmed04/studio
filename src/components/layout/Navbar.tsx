'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Scan, 
  Menu as MenuIcon, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  UserCircle,
  ChevronDown,
  ExternalLink,
  Search,
  Layout,
  ArrowLeftRight,
  Wand2,
  Mic,
  Share2,
  Target,
  Linkedin,
  HelpCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { useUser, useAuth, useDoc, useFirestore, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, collection, query } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Search,
  Layout,
  ArrowLeftRight,
  Wand2,
  Mic,
  Share2,
  Target,
  Linkedin,
  HelpCircle,
  FileText,
  ShieldCheck,
  ShieldAlert
};

const getIconStyle = (iconName: string) => {
  switch(iconName) {
    case 'Search': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    case 'Layout': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
    case 'ArrowLeftRight': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    case 'Wand2': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    case 'Mic': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    case 'Share2': return 'bg-slate-50 text-slate-600 dark:bg-slate-800/20 dark:text-slate-400';
    default: return 'bg-primary/5 text-primary';
  }
}

export function Navbar() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData } = useDoc(userRef);

  const navSettingsRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const { data: navSettings } = useDoc(navSettingsRef);

  const menusQuery = useMemo(() => db ? query(collection(db, 'menus')) : null, [db]);
  const { data: menus } = useCollection(menusQuery);

  const activeHeaderMenu = useMemo(() => {
    if (!menus || !navSettings?.header) return null;
    return menus.find(m => m.id === navSettings.header);
  }, [menus, navSettings]);

  const isAdmin = userData?.role === 'admin' || userData?.role === 'editor' || user?.email === 'itexpert47@gmail.com';

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const processedMenuItems = useMemo(() => {
    if (!activeHeaderMenu?.items) return [];
    
    // STRICT FILTER: Remove any item related to Templates immediately
    const filteredRaw = activeHeaderMenu.items.filter((item: any) => {
      const hrefMatch = item.href?.toLowerCase().includes('/templates');
      const labelMatch = item.label?.toLowerCase().includes('template');
      return !hrefMatch && !labelMatch;
    });

    const tree: any[] = [];
    const stack: any[] = [];

    filteredRaw.forEach((item: any) => {
      const node = { ...item, children: [] };
      
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        tree.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return tree;
  }, [activeHeaderMenu]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl" suppressHydrationWarning>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur-[2px] opacity-80" />
            <div className="relative w-10 h-10 bg-background border border-white/20 rounded-xl flex items-center justify-center text-primary shadow-xl">
              <Scan size={22} className="stroke-[2.5]" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-[12px] font-black uppercase tracking-[0.2em] text-foreground leading-none">
              ATS Resume
            </span>
            <span className="font-headline text-[12px] font-black uppercase gradient-text leading-none mt-1.5 tracking-[0.2em]">
              Scan
            </span>
          </div>
        </Link>

        {/* Dynamic Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {processedMenuItems.map((item, idx) => {
            const isMegaMenu = item.label === 'Tools' && item.children.length > 0;
            
            return isMegaMenu ? (
              <DropdownMenu key={`${item.id}-${idx}`}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest text-muted-foreground outline-none">
                  {item.label} <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[640px] p-8 mt-2 glass border-white/10" align="start">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                    {item.children.map((child: any, cIdx: number) => {
                      const Icon = ICON_MAP[child.iconName] || HelpCircle;
                      const showSeparator = cIdx === 4;
                      
                      return (
                        <React.Fragment key={`${child.id}-${cIdx}`}>
                          {showSeparator && <div className="col-span-2 border-t border-white/5 my-2" />}
                          <DropdownMenuItem asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent cursor-pointer group/item">
                            <Link href={child.href} target={child.target || '_self'} className="flex items-center gap-5">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0",
                                getIconStyle(child.iconName)
                              )}>
                                <Icon size={26} strokeWidth={2} />
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[15px] text-foreground tracking-tight leading-tight">{child.label}</span>
                                </div>
                                {child.description && (
                                  <p className="text-[11px] text-muted-foreground font-medium leading-tight opacity-70">
                                    {child.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : item.children && item.children.length > 0 ? (
              <DropdownMenu key={`${item.id}-${idx}`}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest text-muted-foreground outline-none">
                  {item.label} <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-2 mt-2 glass border-white/10" align="start">
                  {item.children.map((child: any, cIdx: number) => (
                    <DropdownMenuItem key={`${child.id}-${cIdx}`} asChild className="p-3 cursor-pointer">
                      <Link href={child.href} target={child.target || '_self'} className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                        {child.label}
                        {child.target === '_blank' && <ExternalLink size={10} />}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                key={`${item.id}-${idx}`} 
                href={item.href} 
                target={item.target || '_self'}
                className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest text-muted-foreground flex items-center gap-1"
              >
                {item.label}
                {item.target === '_blank' && <ExternalLink size={10} className="opacity-40" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          {user && !userLoading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 p-0 overflow-hidden border-2 border-background shadow-lg">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={userData?.photoURL || user.photoURL || ''} />
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                      {(userData?.displayName || user.displayName)?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 mt-2 glass border-white/10" align="end">
                <div className="flex items-center gap-3 p-3 mb-2 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={userData?.photoURL || user.photoURL || ''} />
                    <AvatarFallback>{(userData?.displayName || user.displayName)?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold truncate max-w-[150px]">{userData?.displayName || user.displayName || 'User'}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>

                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild className="p-3 cursor-pointer text-primary bg-primary/5 font-bold">
                      <Link href="/admin" className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild className="p-3 cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-3 cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <UserCircle size={16} />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="p-3 cursor-pointer text-destructive border-t rounded-none">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !userLoading && (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="font-bold hidden sm:flex uppercase tracking-wider text-xs">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm" className="font-bold px-4 md:px-6 shadow-lg shadow-primary/20 uppercase tracking-wider text-xs">
                  <Link href="/signup">Free Sign Up</Link>
                </Button>
              </div>
            )
          )}

          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MenuIcon size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 glass border-white/10">
                {processedMenuItems.map((item, mIdx) => (
                  <React.Fragment key={`${item.id}-${mIdx}`}>
                    <DropdownMenuItem asChild className="p-3">
                      <Link href={item.href} target={item.target || '_self'} className="font-bold uppercase text-xs tracking-widest">{item.label}</Link>
                    </DropdownMenuItem>
                    {item.children?.map((child: any, cIdx: number) => (
                      <DropdownMenuItem key={`${child.id}-${cIdx}`} asChild className="p-3 pl-6">
                        <Link href={child.href} target={child.target || '_self'} className="text-xs font-medium text-muted-foreground">{child.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </React.Fragment>
                ))}

                {user ? (
                   <DropdownMenuItem asChild className="p-3 font-bold">
                      <Link href="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                ) : !userLoading && (
                  <DropdownMenuItem asChild className="p-3 font-bold text-primary bg-primary/5">
                    <Link href="/signup">Free Sign Up</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
