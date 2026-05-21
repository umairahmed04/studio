"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Scan, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<React.ReactNode | null>(null);

  const syncUserProfile = async (user: any) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const isAdmin = user.email === 'itexpert47@gmail.com';

    if (!userDoc.exists() || isAdmin) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Job Seeker',
        photoURL: user.photoURL || '',
        role: isAdmin ? 'admin' : (userDoc.data()?.role || 'user'),
        status: 'active',
        updatedAt: serverTimestamp(),
        createdAt: userDoc.exists() ? (userDoc.data()?.createdAt || serverTimestamp()) : serverTimestamp()
      }, { merge: true });
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Firebase Auth is not initialized." });
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserProfile(result.user);
        toast({ title: "Welcome back!", description: `Signed in as ${result.user.displayName}` });
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Do not use console.error as it triggers Next.js error overlays in dev
      let message: React.ReactNode = error.message;
      
      if (error.code === 'auth/unauthorized-domain') {
        message = (
          <div className="space-y-3">
            <p><strong>Configuration Required:</strong> This domain is not authorized in your Firebase Project.</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Go to <strong>Firebase Console</strong></li>
              <li>Authentication &gt; Settings &gt; <strong>Authorized Domains</strong></li>
              <li>Add: <code className="bg-muted px-1 rounded">{window.location.hostname}</code></li>
            </ol>
          </div>
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "The sign-in window was closed before completion.";
      }
      
      setErrorMsg(message);
      toast({ variant: "destructive", title: "Sign in failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(result.user);
      toast({ title: "Success", description: "Logged in successfully." });
      router.push('/dashboard');
    } catch (error: any) {
      let message = "Invalid email or password.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        if (email === 'itexpert47@gmail.com') {
          message = "Admin account not found. Please 'Sign Up' first with these credentials to activate it.";
        } else {
          message = "Incorrect credentials. If you don't have an account, please Sign Up.";
        }
      }
      setErrorMsg(message);
      toast({ 
        variant: "destructive", 
        title: "Login Error", 
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1 mb-8">
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur-[2px] opacity-80" />
              <div className="relative w-12 h-12 bg-background border border-white/20 rounded-xl flex items-center justify-center text-primary shadow-xl">
                <Scan size={26} className="stroke-[2.5]" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline text-[16px] font-black uppercase tracking-[0.2em] text-foreground leading-none">
                ATS Resume
              </span>
              <span className="font-headline text-[16px] font-black uppercase tracking-[0.2em] text-foreground leading-none mt-2">
                Scan
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Sign In</h1>
          <p className="text-muted-foreground mt-2">Welcome back to your career dashboard.</p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="flex-1">
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription className="text-xs mt-1">{errorMsg}</AlertDescription>
            </div>
          </Alert>
        )}

        <Card className="glass shadow-2xl border-white/10">
          <CardContent className="pt-8 space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign In with Email"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <span className="bg-card px-3">Or continue with</span>
              </div>
            </div>

            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full font-bold" disabled={loading}>
              Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
