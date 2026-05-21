
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, increment, orderBy } from 'firebase/firestore';
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  CalendarDays, 
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PublicUserProfile() {
  const { username } = useParams();
  const db = useFirestore();
  
  const [userData, setUserData] = useState<any>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!db || !username) return;
      try {
        const usernameQuery = query(collection(db, 'usernames'), where('id', '==', username), limit(1));
        const usernameSnap = await getDocs(usernameQuery);
        
        if (usernameSnap.empty) {
          setLoading(false);
          return;
        }

        const uid = usernameSnap.docs[0].data().userId;
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (!userDoc.exists() || !userDoc.data().publicProfileEnabled) {
          setLoading(false);
          return;
        }
        setUserData(userDoc.data());

        const cvsQuery = query(collection(db, 'users', uid, 'cvs'), orderBy('updatedAt', 'desc'), limit(1));
        const cvsSnap = await getDocs(cvsQuery);
        if (!cvsSnap.empty) {
          setCvData(cvsSnap.docs[0].data());
        }

        updateDoc(doc(db, 'users', uid), {
          'analytics.profileViews': increment(1)
        }).catch(() => {});

      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [db, username]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/10">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Identity...</p>
      </div>
    );
  }

  if (!userData || !cvData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20 pt-10 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto px-4 print:max-w-none print:p-0">
        {/* Public Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-background/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg print:hidden">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
               <Globe size={24} />
             </div>
             <div>
               <h3 className="font-headline font-bold text-lg">Public Professional Profile</h3>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
                   Verified {cvData.templateId || 'Professional'} Document
                 </Badge>
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               </div>
             </div>
           </div>
           <div className="flex gap-3">
             <Button size="lg" variant="outline" onClick={() => window.print()} className="font-bold border-white/10 bg-background/50">
               <Download size={18} className="mr-2" /> Download PDF
             </Button>
             <Button size="lg" asChild className="font-bold shadow-lg shadow-primary/20">
               <Link href="/signup">Create My Own CV</Link>
             </Button>
           </div>
        </div>

        {/* Unified CV Rendering */}
        <Card id="cv-render-target" className="bg-white dark:bg-zinc-950 shadow-2xl border-none p-12 md:p-20 overflow-hidden transition-all duration-700 print:shadow-none print:p-0 print:m-0 print:overflow-visible print:block">
           <ResumeRenderer data={cvData} />
        </Card>

        {/* Trust Footer */}
        <div className="text-center py-10 opacity-40 print:hidden">
          <Link href="/" className="inline-flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
             <Zap size={14} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Powered by ATSResumeScan AI</span>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 15mm !important;
            size: A4;
          }
          
          html, body, main, div[data-sidebar-wrapper] {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          nav, header:not(.resume-header), footer, aside, button, .print\:hidden {
            display: none !important;
          }

          #cv-render-target {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            display: block !important;
            overflow: visible !important;
          }

          .resume-header {
            display: flex !important;
          }

          section {
            page-break-inside: auto !important;
            break-inside: auto !important;
            margin-bottom: 15pt !important;
          }

          .experience-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

function ResumeRenderer({ data }: { data: any }) {
  const content = data.content || {};
  const tpl = data.templateId || 'professional';
  const settings = data.settings || {};
  const accentColor = settings.colorAccent || '#3b82f6';
  
  const isAcademic = tpl === 'academic';
  const isAts = tpl === 'ats-optimized';
  const isCreative = tpl === 'creative';
  const isModern = tpl === 'modern';
  const isMinimal = tpl === 'minimalist';
  
  return (
    <div className={cn(
      "text-foreground transition-all duration-500 print:text-black print:max-w-none", 
      isAcademic ? 'font-serif' : 'font-sans',
      "max-w-4xl mx-auto",
      isMinimal && "text-muted-foreground"
    )} style={{ '--resume-primary': accentColor, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
      {/* HEADER */}
      <header className={cn(
        "resume-header flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-8 border-b-2 print:flex-row print:text-left print:gap-4 print:mb-6 print:border-black/10",
        isCreative && "md:flex-row-reverse",
        "border-primary/10"
      )} style={{ borderColor: `${accentColor}15` }}>
        <div className={cn(
          "flex-1 space-y-4 text-center md:text-left print:text-left print:space-y-1",
          isCreative && "md:text-right"
        )}>
          <h1 className={cn(
            "font-black uppercase tracking-tight text-4xl md:text-5xl print:text-3xl print:text-black",
            isModern ? "italic" : "",
            isMinimal ? "text-3xl tracking-normal font-normal" : ""
          )} style={{ color: accentColor }}>
            {content.personalInfo?.fullName || 'Full Name'}
          </h1>
          <div className={cn(
            "flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-bold opacity-60 print:gap-4 print:text-[9px] print:opacity-100",
            isCreative && "md:justify-end"
          )}>
             <span className="flex items-center gap-1">
               <Mail size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.email || 'email@example.com'}
             </span>
             <span className="flex items-center gap-1">
               <Phone size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.phone || '+000'}
             </span>
             <span className="flex items-center gap-1">
               <MapPin size={10} style={{ color: accentColor }} className="print:text-black" /> 
               {content.personalInfo?.location || 'Location'}
             </span>
          </div>
        </div>
        {content.personalInfo?.photoUrl && !isAts && (
          <div className="shrink-0 relative print:w-24 print:h-24">
            <img 
              src={content.personalInfo.photoUrl} 
              alt="Profile" 
              className="relative w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl print:w-24 print:h-24 print:shadow-none print:border-none print:rounded-lg" 
            />
          </div>
        )}
      </header>

      {/* BODY */}
      <div className={cn(
        "space-y-12 print:space-y-6",
        isAcademic && "space-y-16"
      )}>
        {content.personalInfo?.summary && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-4 border-b-2 pb-1 inline-block print:text-black print:mb-2 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Professional Summary
            </h2>
            <p className="text-sm italic opacity-80 leading-relaxed font-medium print:text-[11px] print:leading-normal print:opacity-100">
              "{content.personalInfo.summary}"
            </p>
          </section>
        )}

        {content.experience?.length > 0 && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-6 border-b-2 pb-1 inline-block print:text-black print:mb-4 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Work Experience
            </h2>
            <div className="space-y-10 print:space-y-4">
              {content.experience.map((exp: any, i: number) => (
                <div key={i} className="experience-item space-y-1">
                  <div className="flex justify-between font-black text-sm print:text-xs">
                    <span className={cn(isAcademic && "text-base")}>{exp.role || 'Job Role'}</span>
                    <span className="opacity-40 text-[10px] uppercase print:text-[8px] print:opacity-100 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-black uppercase print:text-black print:text-[10px]" style={{ color: `${accentColor}CC` }}>{exp.company}</p>
                  <p className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap mt-3 print:text-[10px] print:mt-1 print:leading-normal print:opacity-100 border-l-2 border-muted pl-5 print:border-black/10">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.skills?.technical?.length > 0 && (
          <section>
            <h2 className={cn(
              "text-[11px] font-black uppercase tracking-[0.4em] mb-4 border-b-2 pb-1 inline-block print:text-black print:mb-2 print:border-black/10",
              isMinimal && "tracking-[0.1em] border-none font-bold"
            )} style={{ color: accentColor, borderColor: `${accentColor}40` }}>
              Expertise & Skills
            </h2>
            <div className="flex flex-wrap gap-2 print:gap-1.5">
              {content.skills.technical.map((s: string, i: number) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-[10px] font-bold print:text-[8px] print:border-black/20 print:bg-transparent print:px-1.5 print:text-black"
                  style={{ borderColor: `${accentColor}33`, color: accentColor, backgroundColor: `${accentColor}0D` }}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
