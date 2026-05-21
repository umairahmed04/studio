'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData, loading: docLoading } = useDoc(userRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, authLoading, router]);

  // Show loader while we verify auth and role
  if (authLoading || (user && docLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to home if user is definitely not an admin after checking doc
  if (user && !docLoading && userData?.role !== 'admin' && userData?.role !== 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-12 rounded-3xl border shadow-xl">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have the necessary permissions to access the administrator dashboard.
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Required: admin or editor role
            </p>
            <Button asChild className="w-full h-12 font-bold">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Final check to prevent layout flash
  if (!user || !userData) return null;

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
