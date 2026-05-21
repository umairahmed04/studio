'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Users, 
  MousePointer2, 
  Globe, 
  ArrowUpRight, 
  Zap, 
  TrendingUp, 
  Loader2, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#000000'];

export default function AnalyticsDashboard() {
  const db = useFirestore();
  const [timeRange, setTimeRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Fetch Event History (Limit increased to 2000 for better time-range coverage)
  const eventsQuery = useMemo(() => db ? query(collection(db, 'analytics_events'), orderBy('timestamp', 'desc'), limit(2000)) : null, [db]);
  const { data: events, loading } = useCollection(eventsQuery);

  // 2. Data Filtering by Time Range
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    if (timeRange === 'all') return events;

    if (timeRange === 'custom') {
      if (!customStart || !customEnd) return [];
      const start = new Date(customStart);
      const end = new Date(customEnd);
      // Set to end of the day for inclusive filtering
      end.setHours(23, 59, 59, 999);
      
      return events.filter((e: any) => {
        const timestamp = e.timestamp?.toDate();
        return timestamp && timestamp >= start && timestamp <= end;
      });
    }

    const rangeStart = new Date();
    if (timeRange === 'today') {
      rangeStart.setHours(0, 0, 0, 0); // Start of today (midnight)
    } else if (timeRange === 'week') {
      rangeStart.setDate(rangeStart.getDate() - 7);
    } else if (timeRange === 'month') {
      rangeStart.setMonth(rangeStart.getMonth() - 1);
    }

    return events.filter((e: any) => {
      const timestamp = e.timestamp?.toDate();
      return timestamp && timestamp >= rangeStart;
    });
  }, [events, timeRange, customStart, customEnd]);

  // 3. Data Processing for Charts using filtered events
  const deviceData = useMemo(() => {
    const counts: any = { Desktop: 0, Mobile: 0, Tablet: 0 };
    filteredEvents.forEach((e: any) => {
      if (e.metadata?.device) counts[e.metadata.device]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  const trafficSources = useMemo(() => {
    const sources: any = { Direct: 0, Google: 0, Social: 0, Referral: 0 };
    filteredEvents.forEach((e: any) => {
      const src = e.metadata?.referrer || 'Direct';
      if (src.toLowerCase().includes('google')) sources.Google++;
      else if (src.toLowerCase().includes('linkedin') || src.toLowerCase().includes('facebook') || src.toLowerCase().includes('t.co')) sources.Social++;
      else if (src === 'Direct') sources.Direct++;
      else sources.Referral++;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value })).filter(s => (s.value as number) > 0);
  }, [filteredEvents]);

  const topPages = useMemo(() => {
    const paths: any = {};
    filteredEvents.forEach((e: any) => {
      if (!paths[e.path]) paths[e.path] = 0;
      paths[e.path]++;
    });
    return Object.entries(paths)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => (b.value as number) - (a.value as number))
      .slice(0, 5);
  }, [filteredEvents]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Deep behavioral insights (excluding system administrators).</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-11 bg-background font-bold">
              <CalendarIcon size={14} className="mr-2 text-primary" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
              <SelectItem value="all">Full History</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <Input 
                type="date" 
                className="h-11 w-40 bg-background font-bold" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-muted-foreground font-black text-[10px] uppercase">To</span>
              <Input 
                type="date" 
                className="h-11 w-40 bg-background font-bold" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 h-11">
            <TrendingUp className="text-primary" size={16} />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Live Insights Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard title="Total Events" value={filteredEvents.length} desc="In selection" icon={<Zap className="text-yellow-500" />} />
        <AnalyticsStatCard title="Unique Visitors" value={new Set(filteredEvents.map((e: any) => e.sessionId)).size} desc="In selection" icon={<Users className="text-blue-500" />} />
        <AnalyticsStatCard title="Avg. Page/Session" value={( filteredEvents.length / (new Set(filteredEvents.map((e: any) => e.sessionId)).size || 1) ).toFixed(1)} desc="Engagement" icon={<MousePointer2 className="text-purple-500" />} />
        <AnalyticsStatCard title="Live Reach" value="Global" desc="100% Connectivity" icon={<Globe className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Distribution */}
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Device Usage</CardTitle>
            <CardDescription>What platforms are your users browsing from?</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Acquisition Channels</CardTitle>
            <CardDescription>Top sources driving traffic to your site.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 -mt-4">
              {trafficSources.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[10px] font-black uppercase text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-white/5">
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
            <CardDescription>Pages with the highest visitor engagement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">#{i+1}</div>
                      <span className="text-sm font-bold font-mono">{page.name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px]">{page.value as any} Views</Badge>
                      <ArrowUpRight size={14} className="text-muted-foreground" />
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle>Core Tool Conversions</CardTitle>
            <CardDescription>Event counts in selected range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <ConversionItem label="ATS Scans" count={filteredEvents.filter((e: any) => e.type === 'tool_use' && e.label?.includes('Scan')).length} color="bg-blue-500" />
             <ConversionItem label="CV Exports" count={filteredEvents.filter((e: any) => e.type === 'cv_export').length} color="bg-green-500" />
             <ConversionItem label="QR Scans" count={filteredEvents.filter((e: any) => e.type === 'qr_scan').length} color="bg-pink-500" />
             <ConversionItem label="Link Shares" count={filteredEvents.filter((e: any) => e.type === 'link_share').length} color="bg-cyan-500" />
             <ConversionItem label="Form Leads" count={filteredEvents.filter((e: any) => e.type === 'form_submit').length} color="bg-purple-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsStatCard({ title, value, desc, icon }: any) {
  return (
    <Card className="glass border-white/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{desc}</span>
        </div>
        <h3 className="text-3xl font-headline font-bold mb-1">{value}</h3>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{title}</p>
      </CardContent>
    </Card>
  );
}

function ConversionItem({ label, count, color }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-xs">
          <span className="font-bold">{label}</span>
          <span className="text-muted-foreground">{count} Hits</span>
       </div>
       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full transition-all", color)} style={{ width: `${Math.min(100, (count / 100) * 100)}%` }} />
       </div>
    </div>
  );
}
