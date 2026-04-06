'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { UserPlus, Clock, X } from 'lucide-react';

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export default function InviteDialog() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
    if (open && orgId) {
      fetchPendingInvites();
    }
  }, [open, orgId]);

  const fetchPendingInvites = async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations`);
      if (res.ok) {
        const data = await res.json();
        setPendingInvites(data.invitations || data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orgId) return;

    setSending(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send invitation');
      }

      const newInvite = await res.json();
      setPendingInvites((prev) => [newInvite, ...prev]);
      setEmail('');
      setRole('member');
      setMessage({ type: 'success', text: `Invitation sent to ${email.trim()}` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setSending(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations/${inviteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } catch {
      // Silently handle
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Email address</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {message.text}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={sending || !email.trim()}>
              {sending ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Pending Invitations */}
        {(pendingInvites.length > 0 || loadingInvites) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Pending Invitations
              </h4>
              {loadingInvites ? (
                <div className="flex justify-center py-3">
                  <LoadingSpinner className="w-4 h-4 text-cyan-500" />
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between rounded-lg bg-navy-800/50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{invite.email}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {invite.role}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
