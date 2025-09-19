import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Settings = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

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
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed', description: 'Could not send invitation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your workspace and users</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Add User</Button>
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
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Only admins can manage users.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;


