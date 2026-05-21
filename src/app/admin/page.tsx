'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Activity,
  BarChart2,
  FileCode,
  ImageIcon,
  Clock,
  ExternalLink,
  MapPin,
  Globe,
  Zap,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const db = useFirestore();

  // 1. Live Visitors Query (Active within last 2 minutes)
  const twoMinutesAgo = useMemo(() => new Date(Date.now() - 2 * 60 * 1000), []);
  const liveQuery = useMemo(() => db ? query(
    collection(db, 'analytics_live'), 
    where('lastActive', '>=', Timestamp.fromDate(twoMinutesAgo))
  ) : null, [db, twoMinutesAgo]);
  const { data: liveUsers } = useCollection(liveQuery);

  // 2. Global Totals
  const pagesQuery = useMemo(() => db ? query(collection(db, 'pages')) : null, [db]);
  const mediaQuery = useMemo(() => db ? query(collection(db, 'media')) : null, [db]);
  const recentPagesQuery = useMemo(() => db ? query(collection(db, 'pages'), orderBy('updatedAt', 'desc'), limit(5)) : null, [db]);
  const { data: pages } = useCollection(pagesQuery);
  const { data: media } = useCollection(mediaQuery);
  const { data: recentPages } = useCollection(recentPagesQuery);

  // 3. Analytics Events
  const eventsQuery = useMemo(() => db ? query(collection(db, 'analytics_events'), orderBy('timestamp', 'desc'), limit(50)) : null, [db]);
  const { data: recentEvents } = useCollection(eventsQuery);

  const stats = [
    { 
      title: 'Active Users', 
      value: liveUsers?.length || 0, 
      change: 'Real-time', 
      trend: 'up', 
      icon: <Users className="text-blue-500" /> 
    },
    { 
      title: 'Media Assets', 
      value: media?.length || 0, 
      change: 'Storage Active', 
      trend: 'up', 
      icon: <ImageIcon className="text-primary" /> 
    },
    { 
      title: 'System Activity', 
      value: recentEvents?.length || 0, 
      change: 'Live Events', 
      trend: 'up', 
      icon: <Activity className="text-green-500" /> 
    },
    { 
      title: 'System Health', 
      value: 'Stable', 
      change: '100% Uptime', 
      trend: 'up', 
      icon: <BarChart2 className="text-accent" /> 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time statistics from your dynamic CMS and professional toolkit.</p>
        </div>
        <Button asChild variant="outline" className="font-bold border-primary/20 text-primary">
          <Link href="/admin/analytics">View Full Analytics</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard 
            key={i}
            title={stat.title} 
            value={stat.value} 
            change={stat.change} 
            trend={stat.trend} 
            icon={stat.icon} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Visitor Map/List */}
        <Card className="lg:col-span-2 shadow-sm border-white/5 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary" size={20} />
                Live Visitors
              </CardTitle>
              <CardDescription>Instant traffic distribution across your platform.</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {liveUsers?.length || 0} Online Now
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {!liveUsers || liveUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic">No active users in the last 2 minutes.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {liveUsers.slice(0, 20).map((visitor: any) => (
                    <div key={visitor.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{visitor.city}, {visitor.country}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{visitor.path}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-primary">{visitor.browser}</p>
                         <p className="text-[9px] text-muted-foreground uppercase">{visitor.device}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Event Stream */}
        <Card className="shadow-sm border-white/5 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-accent" size={20} />
              Event Stream
            </CardTitle>
            <CardDescription>Live actions performed by users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {!recentEvents || recentEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">Waiting for events...</div>
              ) : recentEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      event.type === 'tool_use' ? "bg-green-500" : "bg-primary"
                    )} />
                    <div>
                      <p className="text-xs font-bold leading-tight capitalize">
                        {event.type.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {event.label || event.path}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold shrink-0">
                    {event.timestamp?.toDate ? formatDistanceToNow(event.timestamp.toDate(), { addSuffix: true }) : 'Now'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-white/5 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Content Updates</CardTitle>
              <CardDescription>The latest changes across your CMS pages.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/pages">View All Pages</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPages?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">No pages created yet.</div>
            ) : recentPages?.map((page: any) => (
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
                    <Clock size={12} /> {page.updatedAt?.toDate ? formatDistanceToNow(page.updatedAt.toDate(), { addSuffix: true }) : 'Recently'}
                  </span>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/pages/${page.id}`}><ExternalLink size={14} /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-white/5 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
            <CardDescription>Health and resource utilization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total CMS Pages</span>
                <span className="font-bold">{pages?.length || 0}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Media Storage</span>
                <span className="font-bold">{media?.length || 0} Assets</span>
             </div>
             <div className="flex items-center justify-between text-sm pt-4 border-t">
                <span className="text-muted-foreground">Session Status</span>
                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5 uppercase text-[9px]">Verified Admin</Badge>
             </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.2);
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon }: any) {
  return (
    <Card className="shadow-sm border-white/5 bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
          <div className={cn(
            "flex items-center text-[10px] font-black uppercase tracking-widest",
            trend === 'up' ? "text-green-500" : "text-destructive"
          )}>
            {change}
          </div>
        </div>
        <h3 className="text-3xl font-headline font-bold mb-1">{value}</h3>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{title}</p>
      </CardContent>
    </Card>
  );
}
