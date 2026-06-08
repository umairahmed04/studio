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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  MousePointer2, 
  Globe, 
  ArrowUpRight, 
  Zap, 
  TrendingUp, 
  Loader2, 
  Calendar as CalendarIcon,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  FileText,
  MapPin,
  ExternalLink,
  Target,
  ArrowDownLeft,
  Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export default function AnalyticsDashboard() {
  const db = useFirestore();
  const [timeRange, setTimeRange] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Data Fetching
  const eventsQuery = useMemo(() => db ? query(collection(db, 'analytics_events'), orderBy('timestamp', 'desc'), limit(5000)) : null, [db]);
  const { data: events, loading } = useCollection(eventsQuery);

  // 2. Advanced Filtering
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let start: Date;
    let end: Date = new Date();

    if (timeRange === 'all') return events;

    if (timeRange === 'custom') {
      if (!customStart || !customEnd) return [];
      start = startOfDay(new Date(customStart));
      end = endOfDay(new Date(customEnd));
    } else {
      const days = timeRange === 'today' ? 0 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      start = startOfDay(subDays(new Date(), days));
    }

    return events.filter((e: any) => {
      const timestamp = e.timestamp?.toDate();
      return timestamp && isWithinInterval(timestamp, { start, end });
    });
  }, [events, timeRange, customStart, customEnd]);

  // 3. Metric Calculations
  const stats = useMemo(() => {
    const sessions = new Set(filteredEvents.map((e: any) => e.sessionId));
    const views = filteredEvents.filter((e: any) => e.type === 'page_view').length;
    const sessionCount = sessions.size || 1;
    
    // Bounce Rate Logic: % of sessions with only 1 event
    const sessionEvents: Record<string, number> = {};
    filteredEvents.forEach((e: any) => {
      sessionEvents[e.sessionId] = (sessionEvents[e.sessionId] || 0) + 1;
    });
    const bounces = Object.values(sessionEvents).filter(count => count === 1).length;

    return {
      totalEvents: filteredEvents.length,
      uniqueVisitors: sessions.size,
      pageViews: views,
      returningRatio: (filteredEvents.filter((e: any) => e.isNewUser === false).length / (filteredEvents.length || 1) * 100).toFixed(0),
      bounceRate: ((bounces / sessionCount) * 100).toFixed(1),
      avgPages: (views / sessionCount).toFixed(1)
    };
  }, [filteredEvents]);

  // 4. Chart Data Processing
  const trafficData = useMemo(() => {
    const sources: Record<string, number> = {};
    filteredEvents.forEach((e: any) => {
      const src = e.source || 'Direct';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredEvents]);

  const deviceData = useMemo(() => {
    const devices: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    filteredEvents.forEach((e: any) => {
      if (e.metadata?.device) devices[e.metadata.device]++;
    });
    return Object.entries(devices).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  const browserData = useMemo(() => {
    const browsers: Record<string, number> = {};
    filteredEvents.forEach((e: any) => {
      if (e.metadata?.browser) browsers[e.metadata.browser] = (browsers[e.metadata.browser] || 0) + 1;
    });
    return Object.entries(browsers).map(([name, value]) => ({ name, value }));
  }, [filteredEvents]);

  const topContent = useMemo(() => {
    const paths: Record<string, number> = {};
    filteredEvents.filter(e => e.type === 'page_view').forEach(e => {
      paths[e.path] = (paths[e.path] || 0) + 1;
    });
    return Object.entries(paths)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredEvents]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Type', 'Path', 'Source', 'Medium', 'Device', 'Browser', 'Country', 'City'];
    const rows = filteredEvents.map((e: any) => [
      e.timestamp?.toDate ? format(e.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
      e.type,
      e.path,
      e.source || 'direct',
      e.medium || 'none',
      e.metadata?.device || 'Unknown',
      e.metadata?.browser || 'Unknown',
      e.metadata?.country || 'Unknown',
      e.metadata?.city || 'Unknown'
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center p-20 gap-4"><Loader2 className="animate-spin text-primary w-10 h-10" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Computing Data Points...</p></div>;
  }

  return (
    <div className="space-y-8 pb-20 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold">Advanced Insights</h1>
          <p className="text-muted-foreground">Comprehensive behavioral mapping for atsresumescan.com</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-11 bg-background font-bold rounded-xl">
              <CalendarIcon size={14} className="mr-2 text-primary" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
              <SelectItem value="all">Full History</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <Input type="date" className="h-11 w-40 bg-background font-bold rounded-xl" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className="text-muted-foreground font-black text-[10px] uppercase">To</span>
              <Input type="date" className="h-11 w-40 bg-background font-bold rounded-xl" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={exportCsv} title="Export CSV"><Download size={18} /></Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => window.print()} title="Print Report"><FileText size={18} /></Button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard title="Page Views" value={stats.pageViews} desc="Visibility" icon={<Monitor className="text-blue-500" />} />
        <AnalyticsStatCard title="Unique Visitors" value={stats.uniqueVisitors} desc="Reach" icon={<Users className="text-purple-500" />} />
        <AnalyticsStatCard title="Bounce Rate" value={`${stats.bounceRate}%`} desc="Engagement" icon={<ArrowDownLeft className="text-red-500" />} />
        <AnalyticsStatCard title="Returning Users" value={`${stats.returningRatio}%`} desc="Loyalty" icon={<TrendingUp className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Traffic Sources Breakdown */}
        <Card className="lg:col-span-8 glass border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Acquisition Channels</CardTitle>
              <CardDescription>Top sources driving traffic in selected period.</CardDescription>
            </div>
            <Target className="text-primary opacity-20" size={32} />
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="lg:col-span-4 glass border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle>Platform Split</CardTitle>
            <CardDescription>Mobile vs Desktop usage.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
               {deviceData.map((d, i) => (
                 <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold">{d.value}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Performance */}
        <Card className="lg:col-span-2 glass border-white/5">
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
            <CardDescription>Pages with the highest visibility.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-white/5 hover:bg-muted/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">#{i+1}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate max-w-[300px]">{page.name}</p>
                        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{page.name === '/' ? 'Home Page' : page.name.split('/')[1] || 'Tool'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold">{page.value} Hits</Badge>
                      <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle>Critical Conversions</CardTitle>
            <CardDescription>Tool interaction metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <ConversionItem label="ATS Scans" count={filteredEvents.filter((e: any) => e.type === 'tool_use' && e.label?.includes('Scan')).length} color="bg-blue-500" />
             <ConversionItem label="CV Exports" count={filteredEvents.filter((e: any) => e.type === 'cv_export').length} color="bg-green-500" />
             <ConversionItem label="QR Scans" count={filteredEvents.filter((e: any) => e.type === 'qr_scan').length} color="bg-pink-500" />
             <ConversionItem label="Link Shares" count={filteredEvents.filter((e: any) => e.type === 'link_share').length} color="bg-cyan-500" />
             <ConversionItem label="Form Submissions" count={filteredEvents.filter((e: any) => e.type === 'form_submit').length} color="bg-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Geo Location Insights */}
      <Card className="glass border-white/5 overflow-hidden shadow-2xl">
         <CardHeader className="bg-primary/5 p-8 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <MapPin size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline font-bold">Global Visitor Distribution</CardTitle>
                <CardDescription>Geographic reach and regional session analysis.</CardDescription>
              </div>
            </div>
         </CardHeader>
         <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {Object.entries(
                 filteredEvents.reduce((acc: any, e: any) => {
                   const country = e.metadata?.country || 'Unknown';
                   acc[country] = (acc[country] || 0) + 1;
                   return acc;
                 }, {})
               )
               .sort((a: any, b: any) => b[1] - a[1])
               .slice(0, 9)
               .map(([country, count]: any, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-muted/10">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-[10px] font-black">{i+1}</div>
                       <span className="text-sm font-bold">{country}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{count}</span>
                 </div>
               ))}
            </div>
         </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          .print\:hidden { display: none !important; }
          .glass { border: 1px solid #ddd !important; background: white !important; box-shadow: none !important; }
          body { background: white !important; }
          .container { max-width: none !important; width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function AnalyticsStatCard({ title, value, desc, icon }: any) {
  return (
    <Card className="glass border-white/5 shadow-sm transition-all hover:border-primary/20">
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
          <span className="font-bold text-[11px] uppercase tracking-wider">{label}</span>
          <span className="text-muted-foreground font-mono">{count}</span>
       </div>
       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${Math.min(100, (count / 100) * 100)}%` }} />
       </div>
    </div>
  );
}
