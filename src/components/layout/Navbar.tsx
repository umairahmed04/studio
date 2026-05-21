'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Scan, 
  Menu, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  UserCircle,
  ChevronDown,
  Search,
  Layout,
  Wand2,
  Linkedin,
  Target,
  ArrowLeftRight,
  Mic,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData } = useDoc(userRef);

  const navRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const { data: navData } = useDoc(navRef);

  const isAdmin = userData?.role === 'admin' || userData?.role === 'editor' || user?.email === 'itexpert47@gmail.com';

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const dynamicMenuItems = navData?.menuItems || [
    { label: 'Templates', href: '/templates' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider text-muted-foreground outline-none">
              Tools <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[480px] p-4 mt-2 grid grid-cols-2 gap-2" align="start">
              <ToolItem href="/ats-resume-checker" icon={<Search />} color="blue" title="ATS Resume Scan" desc="Check your CV score" />
              <ToolItem href="/cv-builder" icon={<Layout />} color="purple" title="Interactive Builder" desc="Recruiter-ready CVs" />
              <ToolItem href="/cv-compare" icon={<ArrowLeftRight />} color="orange" title="Compare & Match" desc="Side-by-side analysis" />
              <ToolItem href="/resume-optimizer" icon={<Wand2 />} color="green" title="AI Bullet Optimizer" desc="Auto-rewrite bullets" />
              <DropdownMenuSeparator className="col-span-2 my-2" />
              <ToolItem href="/interview-prep" icon={<Mic />} color="primary" title="AI Interview Prep" desc="Practice voice rounds" premium />
              <ToolItem href="/settings/sharing" icon={<Share2 />} color="accent" title="Resume Share" desc="Public online profile" premium />
            </DropdownMenuContent>
          </DropdownMenu>

          {dynamicMenuItems.map((item: any, idx: number) => (
            <Link 
              key={idx} 
              href={item.href} 
              className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          {user && !loading ? (
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
              <DropdownMenuContent className="w-64 p-2 mt-2" align="end">
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
                  <Link href="/settings/sharing" className="flex items-center gap-2">
                    <Share2 size={16} />
                    <span>Public Profile</span>
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
            !loading && (
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
                  <Menu size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem asChild className="p-3">
                  <Link href="/ats-resume-checker" className="font-bold">ATS Scan</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-3">
                  <Link href="/interview-prep" className="font-bold">AI Interview Prep</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-3">
                  <Link href="/settings/sharing" className="font-bold">Resume Share</Link>
                </DropdownMenuItem>
                {user ? (
                   <DropdownMenuItem asChild className="p-3 font-bold border-t">
                      <Link href="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                ) : !loading && (
                  <DropdownMenuItem asChild className="p-3 font-bold text-primary bg-primary/5 border-t">
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

function ToolItem({ href, icon, color, title, desc, premium }: any) {
  const colorMap: any = {
    blue: "bg-blue-500/10 text-blue-600",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
    green: "bg-green-500/10 text-green-600",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent-foreground",
  };

  return (
    <DropdownMenuItem asChild className="p-3 cursor-pointer group">
      <Link href={href} className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colorMap[color])}>
          {icon && typeof icon !== 'string' ? React.cloneElement(icon as React.ReactElement, { size: 20 }) : null}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">{title}</span>
            {premium && <Badge className="text-[7px] h-3 px-1 bg-gradient-to-r from-amber-400 to-orange-500 border-none uppercase font-black tracking-tighter">Premium</Badge>}
          </div>
          <span className="text-[10px] text-muted-foreground">{desc}</span>
        </div>
      </Link>
    </DropdownMenuItem>
  );
}