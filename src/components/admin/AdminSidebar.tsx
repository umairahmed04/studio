'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Wand2,
  Layout,
  BarChart3,
  ShieldCheck,
  Megaphone,
  ArrowLeft,
  FileSearch,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Platform Analytics', href: '/admin/analytics', icon: Activity },
  { name: 'Blog Management', href: '/admin/blog', icon: FileText },
  { name: 'Page Management', href: '/admin/pages', icon: FileSearch },
  { name: 'User Directory', href: '/admin/users', icon: Users },
  { name: 'AI Tool Control', href: '/admin/tools', icon: Wand2 },
  { name: 'CV Templates', href: '/admin/templates', icon: Layout },
  { name: 'AdSense Slots', href: '/admin/ads', icon: Megaphone },
  { name: 'Global Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card border-r w-64 shrink-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold mb-8 hover:opacity-80 transition-opacity">
          <ArrowLeft size={16} />
          <span>View Public Site</span>
        </Link>
        <div className="space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 mb-4">
            System Management
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} className={cn(
                    "transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mt-auto p-6 border-t bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Administrator</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Verified Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
