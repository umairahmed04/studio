"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignupPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<React.ReactNode | null>(null);

  const createUserProfile = async (user: any, name?: string) => {
    if (!db) return;
    const isAdmin = user.email === 'itexpert47@gmail.com';
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name || user.displayName || 'Job Seeker',
      photoURL: user.photoURL || '',
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setErrorMsg(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserProfile(result.user);
        toast({ title: "Welcome!", description: `Account created for ${result.user.displayName}` });
        router.push('/dashboard');
      }
    } catch (error: any) {
      let message: React.ReactNode = error.message;
      if (error.code === 'auth/unauthorized-domain') {
        message = (
          <div className="space-y-3">
            <p><strong>Setup Required:</strong> Your current domain is not authorized in Firebase.</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open <strong>Firebase Console</strong></li>
              <li>Authentication &gt; Settings &gt; <strong>Authorized Domains</strong></li>
              <li>Add this domain: <code className="bg-muted px-1 rounded">{window.location.hostname}</code></li>
            </ol>
          </div>
        );
      }
      setErrorMsg(message);
      toast({ variant: "destructive", title: "Signup failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      await createUserProfile(userCredential.user, displayName);
      toast({ title: "Success", description: "Account created successfully." });
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message);
      toast({ variant: "destructive", title: "Signup Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1 mb-8">
            <div className="flex flex-col items-center">
              <span className="font-headline text-[16px] font-black uppercase tracking-[0.2em] text-foreground leading-none">
                ATS Resume
              </span>
              <span className="font-headline text-[16px] font-black uppercase tracking-[0.2em] text-foreground leading-none mt-2">
                Scan
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join thousands of job seekers optimizing their success.</p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="flex-1">
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription className="text-xs mt-1">{errorMsg}</AlertDescription>
            </div>
          </Alert>
        )}

        <Card className="glass shadow-2xl border-white/10">
          <CardContent className="pt-8 space-y-6">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    className="pl-10"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
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
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign Up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <span className="bg-card px-3">Or sign up with</span>
              </div>
            </div>

            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full font-bold" disabled={loading}>
              Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
