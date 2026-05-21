
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useFirestore, useDoc, useStorage } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();

  const userRef = useMemo(() => (user && db) ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: userData, loading: docLoading } = useDoc(userRef);

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    if (!userRef || !user) return;
    setSaving(true);
    try {
      // 1. Update Firestore
      await updateDoc(userRef, {
        displayName,
        updatedAt: serverTimestamp()
      });

      // 2. Update Auth Profile
      await updateProfile(user, { displayName });

      // 3. Log Activity
      await addDoc(collection(db!, 'users', user.uid, 'activityLog'), {
        type: 'edit',
        timestamp: serverTimestamp(),
        details: { title: 'Updated profile information' }
      });

      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage || !db || !userRef) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload an image.' });
      return;
    }

    setUploading(true);
    try {
      const storagePath = `users/${user.uid}/profile_photos/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Update Firestore, Auth, and Log
      await updateDoc(userRef, { photoURL: url, updatedAt: serverTimestamp() });
      await updateProfile(user, { photoURL: url });
      
      await addDoc(collection(db, 'users', user.uid, 'activityLog'), {
        type: 'photo_upload',
        timestamp: serverTimestamp(),
        details: { title: 'Updated profile photo' }
      });

      toast({ title: "Photo Uploaded", description: "Your profile picture is live." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not save photo." });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || (user && docLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) {
    router.push('/login?redirect=/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photo & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="glass overflow-hidden border-white/10 shadow-xl">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="relative group mb-6">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-2xl ring-2 ring-primary/20">
                    <AvatarImage src={userData?.photoURL || user.photoURL || ''} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {userData?.displayName?.[0] || user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    {uploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                    <span className="text-[10px] font-black uppercase mt-1">Change</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </div>
                
                <h3 className="text-xl font-headline font-bold truncate max-w-full">
                  {userData?.displayName || 'Job Seeker'}
                </h3>
                <p className="text-xs text-muted-foreground truncate max-w-full mb-6">
                  {user.email}
                </p>

                <div className="w-full grid grid-cols-2 gap-2 pt-6 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Role</p>
                    <Badge variant="outline" className="uppercase text-[9px] font-bold text-primary border-primary/20 bg-primary/5">
                      {userData?.role || 'user'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className="uppercase text-[9px] font-bold text-green-500 border-green-500/20 bg-green-500/5">
                      {userData?.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader className="py-4 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">
                    {userData?.createdAt?.toDate ? format(userData.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Verified</span>
                  <CheckCircle2 size={14} className="text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="glass border-white/10 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <User size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Profile Identity</CardTitle>
                    <CardDescription>Manage your professional name and public appearance.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Display Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="pl-10 h-12"
                        placeholder="John Doe"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight italic">
                      This is how your name will appear on shared resumes and in recruiter emails.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Email Address
                    </Label>
                    <div className="relative opacity-70">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        value={user.email || ''} 
                        disabled 
                        className="pl-10 h-12 bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      To change your primary email, please contact support.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-muted/30 border border-white/5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Verified Account Access</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your account is protected by standard authentication protocols. Every profile change is logged in your secure history for audit and recovery purposes.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-muted/10 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving || (userData?.displayName === displayName)}
                  className="h-12 px-10 font-bold shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                  Save Identity Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed border-2 border-muted/50 bg-muted/5">
              <CardContent className="p-8 text-center space-y-4">
                 <h4 className="font-bold text-sm">Need to delete your data?</h4>
                 <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                   Permanently removing your account will delete all resumes, activity logs, and personal details. This action cannot be undone.
                 </p>
                 <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20 h-10 font-bold px-6">
                   <Trash2 size={16} className="mr-2" />
                   Request Data Deletion
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

