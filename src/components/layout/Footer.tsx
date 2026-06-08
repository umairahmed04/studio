'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Scan, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';

/**
 * @fileOverview Dynamic Global Footer with Code-Level Filters to hide Templates.
 */

const DEFAULT_FOOTER_MENU = [
  { label: 'Tools', level: 0, items: [
    { label: 'ATS Scan Engine', href: '/ats-resume-checker' },
    { label: 'Interactive CV Builder', href: '/cv-builder' },
    { label: 'CV Compare & Match', href: '/cv-compare' },
    { label: 'AI Bullet Optimizer', href: '/resume-optimizer' }
  ]},
  { label: 'Company', level: 0, items: [
    { label: 'Our Mission', href: '/about' },
    { label: 'Career Insights', href: '/blog' },
    { label: 'Support Hub', href: '/contact' }
  ]},
  { label: 'Legal', level: 0, items: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Legal Disclaimer', href: '/disclaimer' }
  ]}
];

export function Footer() {
  const db = useFirestore();

  const navSettingsRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const { data: navSettings, loading: settingsLoading } = useDoc(navSettingsRef);

  const menusQuery = useMemo(() => db ? query(collection(db, 'menus')) : null, [db]);
  const { data: menus, loading: menusLoading } = useCollection(menusQuery);

  const activeFooterMenu = useMemo(() => {
    if (!menus) return null;
    let menu = null;
    if (navSettings?.footer) {
      menu = menus.find(m => m.id === navSettings.footer);
    }
    if (!menu) {
      menu = menus.find(m => m.name === 'Footer Menu');
    }
    return menu;
  }, [menus, navSettings]);

  const footerColumns = useMemo(() => {
    if (activeFooterMenu?.items && activeFooterMenu.items.length > 0) {
      const columns: any[] = [];
      let currentColumn: any = null;

      // Filter out Template references at the logic level
      const filteredItems = activeHeaderMenu.items.filter((item: any) => {
        const hrefMatch = item.href?.toLowerCase().includes('/templates');
        const labelMatch = item.label?.toLowerCase().includes('template');
        return !hrefMatch && !labelMatch;
      });

      activeFooterMenu.items.forEach((item: any) => {
        // Double check item label for template exclusion
        if (item.label?.toLowerCase().includes('template') || item.href?.includes('/templates')) return;

        if (item.level === 0) {
          currentColumn = { title: item.label, links: [] };
          columns.push(currentColumn);
        } else if (item.level >= 1 && currentColumn) {
          currentColumn.links.push({ 
            label: item.label, 
            href: item.href, 
            target: item.target 
          });
        }
      });
      if (columns.length > 0) return columns;
    }
    if (menusLoading || settingsLoading) return [];
    
    // Default fallback columns also filtered
    return DEFAULT_FOOTER_MENU.map(col => ({
      title: col.label,
      links: col.items
    }));
  }, [activeFooterMenu, menusLoading, settingsLoading]);

  return (
    <footer className="bg-background border-t py-16" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur-[1px] opacity-80" />
                <div className="relative w-10 h-10 bg-background border border-white/20 rounded-xl flex items-center justify-center text-primary shadow-xl">
                  <Scan size={20} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-[13px] font-black uppercase tracking-[0.1em] text-foreground leading-none">
                  ATS Resume
                </span>
                <span className="font-headline text-[13px] font-black uppercase gradient-text leading-none mt-1.5 tracking-[0.1em]">
                  Scan
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
              Elevating career potential with premium AI optimization. Join 50,000+ job seekers who trust our ATS scanning technology.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Facebook size={12} /></Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Linkedin size={12} /></Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"><Twitter size={12} /></Link>
            </div>
          </div>

          {/* Dynamic Columns: Tools, Company, Legal */}
          {footerColumns.length > 0 ? (
            footerColumns.map((col: any, idx: number) => (
              <div key={`${col.title}-${idx}`} className="lg:pl-8">
                <h4 className="font-headline font-bold mb-8 uppercase text-[11px] tracking-[0.2em] text-primary">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link: any, lIdx: number) => (
                    <li key={`${link.label}-${lIdx}`}>
                      <Link 
                        href={link.href} 
                        target={link.target || '_self'}
                        className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4 animate-pulse lg:pl-8">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="space-y-3">
                    <div className="h-2.5 w-32 bg-muted rounded" />
                    <div className="h-2.5 w-24 bg-muted rounded" />
                    <div className="h-2.5 w-28 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            © {new Date().getFullYear()} ATS Resume Scan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
