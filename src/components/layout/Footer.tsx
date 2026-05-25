'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Scan, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';

/**
 * @fileOverview Dynamic Global Footer with Robust Fallback.
 * Maps hierarchical CMS menu items into original column-based structure.
 * Guaranteed visibility even before CMS initialization.
 */

// Original static structure used as a fallback if database is empty
const DEFAULT_FOOTER_MENU = [
  { label: 'Tools', level: 0, items: [
    { label: 'ATS Scan Engine', href: '/ats-resume-checker' },
    { label: 'Interactive CV Builder', href: '/cv-builder' },
    { label: 'CV Compare & Match', href: '/cv-compare' },
    { label: 'AI Bullet Optimizer', href: '/resume-optimizer' },
    { label: 'Premium Templates', href: '/templates' }
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

  /**
   * Robust Menu Resolver:
   * 1. Try finding by ID from settings
   * 2. Fallback to finding by Name "Footer Menu"
   */
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

  /**
   * Process Footer Columns:
   * Maps dynamic levels (0 = Header, 1+ = Link) into the visual grid.
   */
  const footerColumns = useMemo(() => {
    // If we have dynamic data from CMS, process it
    if (activeFooterMenu?.items && activeFooterMenu.items.length > 0) {
      const columns: any[] = [];
      let currentColumn: any = null;

      activeFooterMenu.items.forEach((item: any) => {
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

    // If CMS is loading, wait
    if (menusLoading || settingsLoading) return [];

    // Fallback: Return the original requested structure if DB is empty
    return DEFAULT_FOOTER_MENU.map(col => ({
      title: col.label,
      links: col.items
    }));
  }, [activeFooterMenu, menusLoading, settingsLoading]);

  return (
    <footer className="bg-background border-t py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                <Scan size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-[13px] font-black uppercase tracking-tight text-foreground leading-none">
                  ATS Resume
                </span>
                <span className="font-headline text-[13px] font-black uppercase gradient-text leading-none mt-1.5">
                  Scan
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Elevating career potential with premium AI optimization. Join 50,000+ job seekers who trust our ATS scanning technology.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Facebook size={14} /></Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Linkedin size={14} /></Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Twitter size={14} /></Link>
            </div>
          </div>

          {/* Dynamic Columns: Tools, Company, Legal */}
          {footerColumns.length > 0 ? (
            footerColumns.map((col: any, idx: number) => (
              <div key={`${col.title}-${idx}`}>
                <h4 className="font-headline font-bold mb-6 uppercase text-xs tracking-widest text-primary">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link: any, lIdx: number) => (
                    <li key={`${link.label}-${lIdx}`}>
                      <Link 
                        href={link.href} 
                        target={link.target || '_self'}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // Placeholder skeleton during load
            <>
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </>
          )}
        </div>
        
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ATS Resume Scan. All rights reserved.
          </p>
          <div className="flex gap-4">
             <span className="text-[10px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-black uppercase tracking-tighter border border-white/5">System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}