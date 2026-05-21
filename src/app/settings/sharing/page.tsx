'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { 
  Globe, 
  Link as LinkIcon, 
  Copy, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Loader2, 
  ArrowLeft,
  ExternalLink,
  QrCode,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { logAnalyticsEvent } from '@/lib/analytics';

export default function SharingSettings() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const userRef = useMemo(() => (user && db) ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData, loading: docLoading } = useDoc(userRef);

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || '');
      setIsPublic(userData.publicProfileEnabled || false);
    }
  }, [userData]);

  const handleToggle = async (enabled: boolean) => {
    if (!userRef) return;
    setIsPublic(enabled);
    try {
      await updateDoc(userRef, { publicProfileEnabled: enabled });
      toast({ title: enabled ? "Profile Published" : "Profile Restricted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleUpdateUsername = async () => {
    if (!db || !user || !username) return;
    setSaving(true);
    setChecking(true);
    try {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const registryRef = doc(db, 'usernames', cleanUsername);
      const checkSnap = await getDoc(registryRef);

      if (checkSnap.exists() && checkSnap.data().userId !== user.uid) {
        toast({ variant: "destructive", title: "Unavailable", description: "This username is already claimed." });
        return;
      }

      // Claim Username
      await setDoc(registryRef, { id: cleanUsername, userId: user.uid });
      await updateDoc(doc(db, 'users', user.uid), { username: cleanUsername });

      toast({ title: "Username Claimed", description: `You are now reachable at /u/${cleanUsername}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Claim Failed" });
    } finally {
      setSaving(false);
      setChecking(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(url);
    if (db) {
      logAnalyticsEvent(db, {
        type: 'link_share',
        path: window.location.pathname,
        sessionId: 'user-session',
        userId: user?.uid,
        label: 'Copy Public Profile Link'
      });
    }
    toast({ title: "Link Copied" });
  };

  if (authLoading || docLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <ToolLayout 
      title="Resume Share & Public Profile" 
      description="Claim your professional URL and share your high-performance profile with recruiters worldwide."
      badge="SEO Optimized Profiles"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* CONFIGURATION COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/10 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <Globe size={22} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Profile Availability</CardTitle>
                    <CardDescription>Control your public visibility.</CardDescription>
                  </div>
                </div>
                <Switch checked={isPublic} onCheckedChange={handleToggle} />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                    <LinkIcon size={10} /> Custom Vanity URL
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold opacity-40">/u/</span>
                       <Input 
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         className="pl-8 h-12 font-bold"
                         placeholder="johndoe"
                         disabled={saving}
                       />
                    </div>
                    <Button onClick={handleUpdateUsername} disabled={saving || !username} className="h-12 px-6 font-bold">
                      {saving ? <Loader2 className="animate-spin" /> : "Claim URL"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    Claiming a unique username makes your profile easier to find for recruiters and helps with SEO.
                  </p>
               </div>

               {isPublic && username && (
                 <div className="p-6 rounded-2xl bg-muted/30 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-bold">Your Live Profile Link</h4>
                       <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] uppercase font-black">Live Now</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background border shadow-inner">
                       <span className="flex-1 text-sm font-mono truncate opacity-60">{window.location.origin}/u/{username}</span>
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink}><Copy size={14} /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/u/${username}`} target="_blank"><ExternalLink size={14} /></Link>
                       </Button>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FeatureInfo icon={<ShieldCheck />} title="Privacy Guard" desc="Hide specific sections or contact details anytime." />
             <FeatureInfo icon={<Share2 />} title="Social Connect" desc="Share directly to LinkedIn with optimized meta tags." />
          </div>
        </div>

        {/* QR & ASSETS COLUMN */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="glass flex flex-col items-center justify-center p-12 text-center space-y-8 relative overflow-hidden">
              {!isPublic ? (
                <div className="space-y-4">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                     <Share2 size={32} />
                   </div>
                   <p className="text-sm text-muted-foreground">Enable public profile to generate sharing assets.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-3xl shadow-2xl ring-8 ring-primary/5">
                     <QRCodeSVG value={`${window.location.origin}/u/${username}?ref=qr`} size={180} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">QR Sharing Code</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Download this code and add it to your <br />physical resume header.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                     <Button variant="outline" className="font-bold"><Download size={16} className="mr-2" /> SVG</Button>
                     <Button variant="outline" className="font-bold"><QrCode size={16} className="mr-2" /> PNG</Button>
                  </div>
                </>
              )}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
           </Card>

           <Card className="glass p-8 border-dashed border-2">
              <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                   <Eye size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Engagement Insights</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have had <span className="font-black text-foreground">{userData?.analytics?.profileViews || 0}</span> views on your profile this month.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

function FeatureInfo({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-background border shadow-sm space-y-3">
       <div className="text-primary">{React.cloneElement(icon as React.ReactElement, { size: 20 })}</div>
       <h4 className="font-bold text-sm leading-none">{title}</h4>
       <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
