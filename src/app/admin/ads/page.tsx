'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Save, Megaphone, ShieldCheck, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdSenseManager() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings, loading } = useDoc(settingsRef);
  
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.adsense) {
      setFormData(settings.adsense);
    } else if (!loading) {
      setFormData({
        enabled: false,
        client: '',
        slots: {
          header: '',
          sidebar: '',
          footer: '',
          inContent: ''
        }
      });
    }
  }, [settings, loading]);

  const handleSave = async () => {
    if (!settingsRef || !formData) return;
    setSaving(true);
    try {
      await setDoc(settingsRef, { adsense: formData }, { merge: true });
      toast({ title: "Ads Configuration Saved", description: "Google AdSense settings updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update ad settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">AdSense Slots</h1>
          <p className="text-muted-foreground">Manage your monetization and ad placement slots.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 font-bold shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Save Ad Config
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-sm border-white/5 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-6">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="text-primary" />
                Global AdSense Activation
              </CardTitle>
              <CardDescription>Enter your Publisher ID to begin serving ads.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Ad Serving</span>
              <Switch 
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
              />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                  Publisher ID (CA-PUB)
                  <a href="https://adsense.google.com" target="_blank" className="text-primary flex items-center gap-1 hover:underline">Console <ExternalLink size={10} /></a>
                </label>
                <Input 
                  value={formData.client} 
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="h-12 font-mono text-sm"
                />
              </div>
            </div>

            <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdSlotInput 
                label="Header Slot" 
                value={formData.slots.header} 
                onChange={(v) => setFormData({...formData, slots: {...formData.slots, header: v}})} 
              />
              <AdSlotInput 
                label="Sidebar Slot" 
                value={formData.slots.sidebar} 
                onChange={(v) => setFormData({...formData, slots: {...formData.slots, sidebar: v}})} 
              />
              <AdSlotInput 
                label="Footer Slot" 
                value={formData.slots.footer} 
                onChange={(v) => setFormData({...formData, slots: {...formData.slots, footer: v}})} 
              />
              <AdSlotInput 
                label="In-Content Slot" 
                value={formData.slots.inContent} 
                onChange={(v) => setFormData({...formData, slots: {...formData.slots, inContent: v}})} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdSlotInput({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</label>
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="Slot ID..."
        className="font-mono text-xs"
      />
    </div>
  );
}
