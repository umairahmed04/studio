'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Scan, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Footer() {
  const db = useFirestore();
  const navRef = useMemo(() => db ? doc(db, 'settings', 'navigation') : null, [db]);
  const { data: navData } = useDoc(navRef);

  const footerColumns = navData?.footer?.columns || [
    { title: 'Tools', links: [
      { label: 'ATS Scan Engine', href: '/ats-resume-checker' },
      { label: 'Interactive CV Builder', href: '/cv-builder' },
      { label: 'CV Compare & Match', href: '/cv-compare' },
      { label: 'AI Bullet Optimizer', href: '/resume-optimizer' },
      { label: 'Premium Templates', href: '/templates' }
    ]},
    { title: 'Company', links: [
      { label: 'Our Mission', href: '/about' },
      { label: 'Career Insights', href: '/blog' },
      { label: 'Support Hub', href: '/contact' }
    ]},
    { title: 'Legal', links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Legal Disclaimer', href: '/disclaimer' }
    ]}
  ];

  return (
    <footer className="bg-background border-t py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
              <Link href={navData?.footer?.social?.facebook || "#"} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Facebook size={14} /></Link>
              <Link href={navData?.footer?.social?.linkedin || "#"} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Linkedin size={14} /></Link>
              <Link href={navData?.footer?.social?.twitter || "#"} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"><Twitter size={14} /></Link>
            </div>
          </div>

          {footerColumns.map((col: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-headline font-bold mb-6 uppercase text-xs tracking-widest text-primary">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link: any, lIdx: number) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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