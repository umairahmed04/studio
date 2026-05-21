'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileCode, 
  ImageIcon, 
  Globe, 
  Activity,
  ArrowUpRight,
  Plus,
  Clock
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CmsDashboard() {
  const db = useFirestore();

  const pagesQuery = useMemo(() => db ? query(collection(db, 'pages')) : null, [db]);
  const mediaQuery = useMemo(() => db ? query(collection(db, 'media')) : null, [db]);
  const recentPagesQuery = useMemo(() => db ? query(collection(db, 'pages'), orderBy('updatedAt', 'desc'), limit(5)) : null, [db]);

  const { data: pages } = useCollection(pagesQuery);
  const { data: media } = useCollection(mediaQuery);
  const { data: recentPages } = useCollection(recentPagesQuery);

  const stats = [
    { title: 'Total Pages', value: pages?.length || 0, icon: <FileCode className="text-primary" />, color: 'bg-primary/10' },
    { title: 'Media Assets', value: media?.length || 0, icon: <ImageIcon className="text-accent" />, color: 'bg-accent/10' },
    { title: 'Live Pages', value: pages?.filter((p: any) => p.status === 'published').length || 0, icon: <Globe className="text-green-500" />, color: 'bg-green-500/10' },
    { title: 'Drafts', value: pages?.filter((p: any) => p.status === 'draft').length || 0, icon: <Activity className="text-amber-500" />, color: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">CMS Overview</h1>
          <p className="text-muted-foreground">Real-time statistics from your dynamic content engine.</p>
        </div>
        <Button asChild className="font-bold h-12 shadow-lg shadow-primary/20">
          <Link href="/admin/pages"><Plus size={18} className="mr-2" /> New Content</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:border-primary/20 transition-all border-white/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </div>
              <h3 className="text-4xl font-headline font-bold mb-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Content Updates</CardTitle>
            <CardDescription>Track the latest changes across your dynamic pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPages?.map((page: any) => (
              <div key={page.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <FileCode size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{page.title}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {page.updatedAt?.toDate ? formatDistanceToNow(page.updatedAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-bold">
                    <Link href={`/admin/pages/${page.id}`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Link href="/admin/media" className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-muted/30 transition-colors group">
              <span className="font-bold text-sm">Media Library</span>
              <ImageIcon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-muted/30 transition-colors group">
              <span className="font-bold text-sm">Global Settings</span>
              <Activity size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
