'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Search, 
  Target, 
  Trophy, 
  Layout, 
  Wand2, 
  Linkedin,
  Star,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ArrowLeftRight,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [sparkles, setSparkles] = useState<{top: string, left: string, size: number}[]>([]);

  useEffect(() => {
    setMounted(true);
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      size: 10 + i * 2
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
          {mounted && sparkles.map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20 dark:text-primary/10"
              style={{ top: s.top, left: s.left }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={s.size} />
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px] animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  2026 AI Performance Engine
                </Badge>
                <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 tracking-tight leading-[1.1] text-foreground">
                  Get You Hired with <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
                    High-Performance AI
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Join 50,000+ professionals beating the ATS with recruiter-approved templates and real-time AI optimization.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="w-full sm:w-auto px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 group rounded-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105" asChild>
                    <Link href="/ats-resume-checker">
                      Scan My CV
                      <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 h-14 text-lg font-bold rounded-xl bg-background/50 backdrop-blur border-border hover:bg-muted/50 transition-all" asChild>
                    <Link href="/cv-builder">Interactive CV Builder</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center lg:justify-start gap-4 pt-8"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Trusted by 50k+ Job Seekers
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-6 relative h-[600px] flex items-center justify-center perspective-[1000px]">
              {/* JESSICA MILLER (LEFT) */}
              <motion.div 
                initial={{ opacity: 0, x: -80, rotateY: 20 }}
                animate={{ opacity: 1, x: -140, rotateY: 20 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute left-1/2 z-10 w-[260px] h-[480px] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-border overflow-hidden p-6 hidden md:block"
              >
                <div className="space-y-4 h-full flex flex-col">
                  <div className="border-b-2 border-blue-500/10 pb-3">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white">Jessica Miller</h4>
                    <p className="text-[7px] text-blue-600 font-bold uppercase tracking-widest mt-1">Marketing Manager</p>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 mt-2 opacity-50">
                       <div className="flex items-center gap-1"><Phone size={6} /> <span className="text-[5px]">+1 (555) 123-4567</span></div>
                       <div className="flex items-center gap-1"><Mail size={6} /> <span className="text-[5px]">jessica.m@email.com</span></div>
                       <div className="flex items-center gap-1"><MapPin size={6} /> <span className="text-[5px]">New York, USA</span></div>
                       <div className="flex items-center gap-1"><Linkedin size={6} /> <span className="text-[5px]">/in/jessicamiller</span></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Profile</p>
                    <p className="text-[5px] leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                      Results-driven marketing manager with 8+ years of experience in digital marketing, brand strategy, and campaign execution.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Experience</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center"><span className="text-[6px] font-bold">Marketing Manager</span><span className="text-[5px] opacity-40">2021 - Present</span></div>
                        <p className="text-[5px] text-blue-600 font-bold">BrightWave Inc.</p>
                        <ul className="text-[4px] list-disc pl-2 space-y-0.5 mt-1 text-zinc-500">
                          <li>Leading digital campaigns that increased ROI by 45%.</li>
                          <li>Managing a team of 8 marketing professionals.</li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex justify-between items-center"><span className="text-[6px] font-bold">Marketing Specialist</span><span className="text-[5px] opacity-40">2018 - 2021</span></div>
                        <p className="text-[5px] text-blue-600 font-bold">MarketGenius</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto space-y-2 pt-4 border-t border-zinc-50">
                    <p className="text-[6px] font-black uppercase text-zinc-400 tracking-widest">Skills</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center"><span className="text-[5px]">Digital Marketing</span><div className="h-0.5 w-16 bg-blue-100 rounded-full overflow-hidden"><div className="h-full w-[90%] bg-blue-600 rounded-full" /></div></div>
                      <div className="flex justify-between items-center"><span className="text-[5px]">SEO & SEM</span><div className="h-0.5 w-16 bg-blue-100 rounded-full overflow-hidden"><div className="h-full w-[80%] bg-blue-600 rounded-full" /></div></div>
                      <div className="flex justify-between items-center"><span className="text-[5px]">Content Strategy</span><div className="h-0.5 w-16 bg-blue-100 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-blue-600 rounded-full" /></div></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* DAVID WILSON (CENTER) */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-30 w-[310px] h-[520px] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-border overflow-hidden flex"
              >
                <div className="w-[38%] bg-[#0f172a] h-full p-5 space-y-6 flex flex-col text-white">
                  <div className="space-y-1 text-center pt-2">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto border-2 border-zinc-700" />
                    <h4 className="text-[10px] font-black uppercase mt-2">David Wilson</h4>
                    <p className="text-[5px] text-zinc-500 font-bold uppercase tracking-wider">Software Engineer</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2"><Phone size={6} className="text-zinc-500" /><span className="text-[5px] opacity-70">+1 (555) 987-6543</span></div>
                    <div className="flex items-center gap-2"><Mail size={6} className="text-zinc-500" /><span className="text-[5px] opacity-70">david.w@email.com</span></div>
                    <div className="flex items-center gap-2"><MapPin size={6} className="text-zinc-500" /><span className="text-[5px] opacity-70">San Francisco, USA</span></div>
                    <div className="flex items-center gap-2"><Globe size={6} className="text-zinc-500" /><span className="text-[5px] opacity-70">david.dev</span></div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <p className="text-[6px] font-black uppercase text-zinc-500 tracking-widest">Skills</p>
                    <div className="space-y-2">
                       <div className="flex justify-between"><span className="text-[5px]">JavaScript</span><span className="text-[4px] opacity-40">95%</span></div>
                       <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-blue-500" /></div>
                       <div className="flex justify-between"><span className="text-[5px]">React</span><span className="text-[4px] opacity-40">90%</span></div>
                       <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[90%] bg-blue-500" /></div>
                       <div className="flex justify-between"><span className="text-[5px]">Node.js</span><span className="text-[4px] opacity-40">85%</span></div>
                       <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-blue-500" /></div>
                    </div>
                  </div>
                  <div className="mt-auto pb-4 space-y-2">
                     <p className="text-[6px] font-black uppercase text-zinc-500 tracking-widest">Education</p>
                     <p className="text-[5px] font-bold">B.Sc. Computer Science</p>
                     <p className="text-[4px] text-zinc-400">Stanford University</p>
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                   <div className="border-b-2 border-zinc-100 dark:border-zinc-900 pb-4">
                      <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest mb-2">Professional Profile</p>
                      <p className="text-[6px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Software engineer with 5+ years of experience in building building scalable web applications and delivering high-quality solutions.
                      </p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Work Experience</p>
                      <div className="space-y-3">
                        <div className="relative pl-3 border-l border-zinc-100 dark:border-zinc-800">
                          <div className="absolute -left-[3.5px] top-1 w-[6px] h-[6px] bg-blue-500 rounded-full" />
                          <div className="flex justify-between items-baseline"><span className="text-[6px] font-bold">Sr. Software Engineer</span><span className="text-[4px] opacity-40">2021 - Present</span></div>
                          <p className="text-[5px] text-zinc-400 font-bold">TechWave Solutions</p>
                          <p className="text-[5px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">Built and maintained scalable web applications using React and Node.js. Improved performance by 30%.</p>
                        </div>
                        <div className="relative pl-3 border-l border-zinc-100 dark:border-zinc-800">
                          <div className="absolute -left-[3.5px] top-1 w-[6px] h-[6px] bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                          <div className="flex justify-between items-baseline"><span className="text-[6px] font-bold">Software Engineer</span><span className="text-[4px] opacity-40">2019 - 2021</span></div>
                          <p className="text-[5px] text-zinc-400 font-bold">CodeCraft Tech</p>
                        </div>
                      </div>
                   </div>
                   <div className="pt-4 space-y-3">
                      <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Key Projects</p>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                          <p className="text-[6px] font-bold text-blue-700 dark:text-blue-400">E-Commerce Platform</p>
                          <p className="text-[4px] text-zinc-500 mt-0.5">Full-stack MERN solution scaled to 50k users.</p>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>

              {/* SOPHIA ANDERSON (RIGHT) */}
              <motion.div 
                initial={{ opacity: 0, x: 80, rotateY: -20 }}
                animate={{ opacity: 1, x: 140, rotateY: -20 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute left-1/2 z-10 w-[260px] h-[480px] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-border overflow-hidden p-6 hidden md:block"
              >
                <div className="space-y-5 flex flex-col h-full">
                  <div className="text-center border-b pb-4 border-purple-50 dark:border-zinc-900">
                    <h4 className="text-[11px] font-black text-purple-600 uppercase">Sophia Anderson</h4>
                    <p className="text-[6px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">UX/UI Designer</p>
                    <div className="flex justify-center gap-3 mt-2 opacity-50">
                       <Mail size={6} /> <Phone size={6} /> <MapPin size={6} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[6px] font-black uppercase text-purple-400 tracking-widest">About Me</p>
                    <p className="text-[5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Creative UX/UI designer with 4+ years of experience in designing user-centric digital experiences and scalable design systems.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[6px] font-black uppercase text-purple-400 tracking-widest">Experience</p>
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <p className="text-[6px] font-bold">UX/UI Designer</p>
                          <p className="text-[5px] text-purple-600 font-bold">DesignHub Studio</p>
                          <p className="text-[4px] opacity-40">2021 - Present</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[6px] font-bold">Junior Designer</p>
                          <p className="text-[5px] text-purple-600 font-bold">Pixel Perfect</p>
                       </div>
                    </div>
                  </div>
                  <div className="mt-auto space-y-3">
                    <p className="text-[6px] font-black uppercase text-purple-400 tracking-widest">Expertise</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[4px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">Figma</span>
                      <span className="text-[4px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">Prototyping</span>
                      <span className="text-[4px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">User Testing</span>
                    </div>
                    <div className="space-y-1.5">
                       <div className="h-0.5 w-full bg-purple-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-purple-500 rounded-full" /></div>
                       <div className="h-0.5 w-full bg-purple-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-purple-500 rounded-full" /></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ATS SCORE WIDGET */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 lg:-right-4 z-40 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur rounded-2xl shadow-xl flex items-center gap-3 border border-border"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="10" strokeLinecap="round" className="text-green-500" />
                  </svg>
                  <span className="absolute text-[10px] font-black">92%</span>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">ATS Score</p>
                  <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} className="fill-green-600 text-white" /> Excellent Match
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST WALL */}
      <section className="py-12 border-y bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-10">
            Trusted by candidates at top companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Netflix'].map((company) => (
              <span key={company} className="text-xl font-bold font-headline tracking-tighter">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground">The Science of <span className="text-primary">Getting Hired</span></h2>
            <p className="text-muted-foreground">Our 3-step framework is designed to bridge the gap between your talent and the recruiter's desk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="01" 
              title="Upload & Parse" 
              desc="Drop your current CV. Our AI dissects it exactly like a modern Applicant Tracking System (ATS) would."
              icon={<Zap className="text-yellow-500" />}
            />
            <StepCard 
              number="02" 
              title="AI Analysis" 
              desc="We cross-reference your profile with 10,000+ industry-specific keywords and recruiter heatmaps."
              icon={<Search className="text-blue-500" />}
              active
            />
            <StepCard 
              number="03" 
              title="Optimize & Land" 
              desc="Get a polished, ATS-optimized document that ranks in the top 1% of the application pile."
              icon={<Trophy className="text-green-500" />}
            />
          </div>
        </div>
      </section>

      {/* 4. THE TOOLKIT */}
      <section className="py-32 bg-muted/10 dark:bg-zinc-900/40 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl space-y-4">
              <Badge className="bg-primary/10 text-primary border-none">Professional Suite</Badge>
              <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground">The Professional's Toolkit</h2>
              <p className="text-muted-foreground">Everything you need to automate your job search and stand out in a competitive market.</p>
            </div>
            <Button variant="outline" asChild className="font-bold h-12 rounded-xl group bg-background">
               <Link href="/signup">
                Sign Up for Full Access <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Search />} 
              title="ATS Resume Scan" 
              desc="Instant audit of your resume score with keyword gaps and structural fixes."
              href="/ats-resume-checker"
              brandColor="#3b82f6"
            />
            <FeatureCard 
              icon={<Layout />} 
              title="Interactive CV Builder" 
              desc="Craft high-impact resumes with recruiter-approved interactive templates."
              href="/cv-builder"
              brandColor="#a855f7"
            />
            <FeatureCard 
              icon={<ArrowLeftRight />} 
              title="CV Compare & Match" 
              desc="Side-by-side resume comparison tool to close critical keyword gaps."
              href="/cv-compare"
              brandColor="#f59e0b"
            />
            <FeatureCard 
              icon={<Wand2 />} 
              title="AI Bullet Optimizer" 
              desc="Auto-rewrite weak tasks into powerful achievement statements with quantified results."
              href="/resume-optimizer"
              brandColor="#10b981"
            />
            <FeatureCard 
              icon={<Linkedin />} 
              title="LinkedIn Profile Audit" 
              desc="Scan your LinkedIn presence and get expert tips to boost search visibility."
              href="/linkedin-profile-optimizer"
              brandColor="#0077b5"
            />
            <FeatureCard 
              icon={<Target />} 
              title="Job Matcher" 
              desc="Paste a job description to see how well you rank against specific requirements."
              href="/job-description-matcher"
              brandColor="#f59e0b"
            />
          </div>
        </div>
      </section>

      {/* 5. SUCCESS STORIES */}
      <section className="py-32 overflow-hidden">
        <div className="container mx-auto px-4">
           <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground">Real Results for <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Real Careers</span></h2>
             <p className="text-muted-foreground">Join 50,000+ candidates who transformed their application success rate.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <TestimonialCard 
                name="Alex Rivera" 
                role="Software Engineer" 
                text="The ATS checker was a game changer. I went from zero replies to 3 interviews in one week."
                company="Amazon"
                image="https://picsum.photos/seed/alex/100/100"
              />
              <TestimonialCard 
                name="Sarah Chen" 
                role="Product Manager" 
                text="The AI bullet points helped me quantify my impact in a way I couldn't do alone. Highly recommended."
                company="Google"
                image="https://picsum.photos/seed/sarah/100/100"
              />
              <TestimonialCard 
                name="Michael Knight" 
                role="Sales Executive" 
                text="The templates are incredibly professional. My recruiters actually complimented the layout of my CV."
                company="Salesforce"
                image="https://picsum.photos/seed/view/100/100"
              />
              <TestimonialCard 
                name="Amara Okafor" 
                role="Marketing Strategist" 
                text="LinkedIn Auditor showed me exactly why I wasn't appearing in search results. Fixed it in minutes."
                company="Meta"
                image="https://picsum.photos/seed/amara/100/100"
              />
           </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="pb-32 container mx-auto px-4">
        <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden border border-primary/20">
           <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight text-foreground">Ready to Rank in the <br /><span className="text-primary">Top 1%?</span></h2>
              <p className="text-xl text-muted-foreground leading-relaxed">Join 50,000+ job seekers who have successfully optimized their resumes with our premium AI tools.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/30 rounded-2xl group" asChild>
                    <Link href="/signup">
                      Get Started Free <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </Button>
                 <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No credit card required</p>
              </div>
           </div>
           
           <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_#3b82f6_1px,_transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ number, title, desc, icon, active }: any) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 border-border",
      active ? "shadow-2xl shadow-primary/10 scale-105 bg-card z-20" : "bg-card/50 hover:bg-card"
    )}>
      <CardContent className="p-10 space-y-6">
        <div className="flex justify-between items-start">
          <span className="text-5xl font-headline font-black opacity-10 group-hover:opacity-20 transition-opacity">{number}</span>
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, desc, href, brandColor }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href}>
      <Card 
        className="group h-full bg-card/40 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-500 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-8 space-y-6">
          <div 
            className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg"
            style={{ 
              backgroundColor: isHovered ? `${brandColor}15` : '',
              color: isHovered ? brandColor : ''
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 28 })}
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
              {title}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
          <div className="pt-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary group-hover:underline">Launch Tool</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TestimonialCard({ name, role, text, company, image }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/20 transition-all group">
      <CardContent className="p-8 space-y-6">
        <div className="flex text-yellow-500 gap-1">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
        <p className="text-sm italic leading-relaxed text-muted-foreground">"{text}"</p>
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{name}</h4>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary">{role}</p>
            <p className="text-[9px] font-medium opacity-40">Hired by {company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}