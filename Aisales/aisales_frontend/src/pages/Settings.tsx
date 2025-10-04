import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';

interface WorkspaceUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const Settings = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkspaceUser | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const fetchWorkspaceUsers = async () => {
    if (!isAdmin || !token) return;
    
    setIsLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:8080/api/users/workspace-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const users = await res.json();
      setWorkspaceUsers(users);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load workspace users' });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceUsers();
  }, [isAdmin, token]);

  const handleInvite = async () => {
    if (!email || !tempPassword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8080/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, temporaryPassword: tempPassword }),
      });
      if (!res.ok) throw new Error('Invite failed');
      toast({ title: 'Invitation sent', description: `Invitation email sent to ${email}` });
      setEmail('');
      setTempPassword('');
      // Refresh the user list
      fetchWorkspaceUsers();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed', description: 'Could not send invitation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (currentUser: WorkspaceUser) => {
    setEditingUser(currentUser);
    setEditFirstName(currentUser.firstName);
    setEditLastName(currentUser.lastName);
    setEditEmail(currentUser.email);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editFirstName || !editLastName || !editEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'All fields are required' });
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail
        }),
      });

      if (!res.ok) throw new Error('Failed to update user');
      
      toast({ title: 'Success', description: 'User updated successfully' });
      setIsEditDialogOpen(false);
      fetchWorkspaceUsers(); // Refresh the list
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user' });
    }
  };

  const handleRemoveUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the workspace?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to remove user');
      
      toast({ title: 'Success', description: `${userName} has been removed from the workspace` });
      fetchWorkspaceUsers(); // Refresh the list
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove user' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your workspace and users</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email</Label>
                          <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-temp">Temporary Password</Label>
                          <Input id="invite-temp" type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} />
                        </div>
                        <Button onClick={handleInvite} disabled={isSubmitting || !email || !tempPassword} className="w-full">
                          {isSubmitting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">Workspace Users</h4>
                  
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading users...</div>
                    </div>
                  ) : workspaceUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No users have been added to this workspace yet.</p>
                      <p className="text-sm">Click "Add User" above to invite team members.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workspaceUsers.map((workspaceUser) => (
                            <TableRow key={workspaceUser.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                {workspaceUser.firstName} {workspaceUser.lastName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {workspaceUser.email}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={workspaceUser.role === 'ADMIN' ? 'default' : 'secondary'}
                                  className="rounded-full"
                                >
                                  {workspaceUser.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className="text-green-600 border-green-600 bg-green-50"
                                >
                                  {workspaceUser.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditUser(workspaceUser)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100"
                                    title="Edit User"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveUser(workspaceUser.id, workspaceUser.firstName)}
                                    className="h-8 w-8 p-0 hover:bg-red-100"
                                    title="Remove User"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Only admins can manage users.</p>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input 
                  id="edit-first-name" 
                  value={editFirstName} 
                  onChange={(e) => setEditFirstName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input 
                  id="edit-last-name" 
                  value={editLastName} 
                  onChange={(e) => setEditLastName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Settings;


