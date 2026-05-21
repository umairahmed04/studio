'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { 
  Search, 
  Loader2, 
  Users, 
  ShieldCheck, 
  Mail, 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  Edit2, 
  MoreVertical,
  User as UserIcon,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

export default function UserDirectory() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);

  const filteredUsers = users?.filter((u: any) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Insufficient permissions." });
    }
  };

  const handleStatusToggle = async (user: any) => {
    if (!db) return;
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      toast({ 
        title: newStatus === 'blocked' ? "User Blocked" : "User Unblocked", 
        description: `Access status updated for ${user.email}.` 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not update user status." });
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditName(user.displayName || '');
    setEditRole(user.role || 'user');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!db || !editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        displayName: editName,
        role: editRole
      });
      toast({ title: "Profile Updated", description: "User details have been saved." });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to save changes." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">User Directory</h1>
          <p className="text-muted-foreground">Manage platform access, roles, and account status.</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Users: {users?.length || 0}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10 h-12 bg-background/50" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
        ) : filteredUsers?.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2">
            <Users size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No users found matching your search.</p>
          </Card>
        ) : filteredUsers?.map((user: any) => (
          <Card 
            key={user.id} 
            className={cn(
              "transition-all border-white/5 bg-card/50 backdrop-blur relative overflow-hidden",
              user.status === 'blocked' ? "opacity-60 grayscale" : "hover:border-primary/20"
            )}
          >
            {user.status === 'blocked' && (
              <div className="absolute top-0 right-0 p-2">
                <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-tighter">Account Blocked</Badge>
              </div>
            )}
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg",
                  user.status === 'blocked' ? "bg-muted-foreground" : "bg-gradient-to-br from-primary to-accent"
                )}>
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg truncate">{user.displayName || 'Unnamed User'}</h3>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="uppercase text-[9px] tracking-widest h-4">
                      {user.role || 'user'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                    <span>Joined {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9 px-3 font-bold" onClick={() => openEditDialog(user)}>
                    <Edit2 size={14} className="mr-2" /> Edit
                  </Button>
                  <Button 
                    variant={user.status === 'blocked' ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "h-9 px-3 font-bold",
                      user.status === 'blocked' ? "bg-green-600 hover:bg-green-700" : "text-destructive hover:bg-destructive/10"
                    )}
                    onClick={() => handleStatusToggle(user)}
                  >
                    {user.status === 'blocked' ? (
                      <><CheckCircle2 size={14} className="mr-2" /> Unblock</>
                    ) : (
                      <><Ban size={14} className="mr-2" /> Block</>
                    )}
                  </Button>
                </div>
                
                <div className="w-32 hidden md:block border-l pl-4">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Role Access</p>
                  <Select 
                    defaultValue={user.role || 'user'} 
                    onValueChange={(val) => handleRoleChange(user.id, val)}
                  >
                    <SelectTrigger className="h-8 text-[10px] font-bold uppercase">
                      <SelectValue placeholder="Set Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md glass">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <UserIcon size={20} />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">Edit User Profile</DialogTitle>
            </div>
            <DialogDescription>
              Modify professional identity and system permissions for this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-bold uppercase text-muted-foreground">Display Name</Label>
              <Input 
                id="edit-name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="User Full Name"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-xs font-bold uppercase text-muted-foreground">Access Level (Role)</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-11 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Standard User</SelectItem>
                  <SelectItem value="editor">Content Editor</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-white/5 space-y-1">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email Identity</p>
              <p className="text-sm font-medium">{editingUser?.email}</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="font-bold px-8 shadow-lg shadow-primary/20">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
