"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Internal setup utility to create the specific admin user requested.
 */
export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async () => {
    if (!auth || !db) {
      toast({ variant: "destructive", title: "Config Error", description: "Firebase is not initialized properly." });
      return;
    }
    setLoading(true);

    const email = 'itexpert47@gmail.com';
    const password = 'Umair@786';

    try {
      // 1. Sign out current session to ensure fresh state
      try {
        await signOut(auth);
      } catch (e) {
        // Ignore signout errors
      }

      let userCredential;
      try {
        // 2. Try sign in first
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        // 3. Create if it doesn't exist
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }

      const user = userCredential.user;

      // 4. Force set Admin Role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: 'Master Admin',
        role: 'admin',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Admin Account Ready",
        description: `Successfully configured ${email} as Administrator.`
      });

      // 5. Take them to the dashboard
      router.push('/admin');
    } catch (error: any) {
      console.error("Setup Error:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Unknown error during setup."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <Card className="max-w-md w-full glass shadow-2xl border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl font-headline font-bold text-foreground">Admin Setup Utility</CardTitle>
          <CardDescription>
            Initialize the master admin account with requested credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-white/5">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email</span>
                <span className="font-bold">itexpert47@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Lock size={16} className="text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Access Level</span>
                <span className="font-bold">Full System Admin</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSetup} 
            disabled={loading} 
            className="w-full h-14 font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            {loading ? <Loader2 className="mr-2 animate-spin" /> : "Initialize Admin Account"}
          </Button>
          
          <div className="pt-4 space-y-2">
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.3em] font-black">
              System Authorization
            </p>
            <p className="text-[9px] text-center text-muted-foreground/60 italic leading-tight">
              This will automatically provision your Auth account and create your profile in the users collection with elevated privileges.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
