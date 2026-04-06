'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, X } from 'lucide-react';

interface StepInviteTeamProps {
  orgId: string;
  onComplete: () => void;
}

interface InviteRow {
  id: string;
  email: string;
  role: string;
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

function createRow(): InviteRow {
  return { id: crypto.randomUUID(), email: '', role: 'member' };
}

export default function StepInviteTeam({ orgId, onComplete }: StepInviteTeamProps) {
  const [rows, setRows] = useState<InviteRow[]>([createRow()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (id: string, field: keyof InviteRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const validRows = rows.filter(
    (row) => row.email.trim().length > 0 && row.email.includes('@')
  );

  const handleSendInvites = async () => {
    if (validRows.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        validRows.map((row) =>
          fetch(`/api/orgs/${orgId}/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: row.email.trim(), role: row.role }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed for ${row.email}`);
            return res.json();
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0 && failed.length < validRows.length) {
        setError(`${failed.length} invite(s) failed to send.`);
      } else if (failed.length === validRows.length) {
        throw new Error('Failed to send invitations');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-semibold text-white">
          Invite your team
        </h2>
        <p className="text-sm text-muted-foreground">
          Collaborate with teammates on cost optimization. You can always invite more later.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={row.email}
              onChange={(e) => updateRow(row.id, 'email', e.target.value)}
              className="flex-1"
            />
            <Select
              value={row.role}
              onValueChange={(val) => updateRow(row.id, 'role', val)}
            >
              <SelectTrigger className="w-[120px]">
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
              className="shrink-0 text-slate-400 hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add another
      </Button>

      {error && (
        <p className="text-sm text-rose-400 text-center">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          disabled={validRows.length === 0 || loading}
          onClick={handleSendInvites}
        >
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Sending invites...
            </>
          ) : (
            `Send Invite${validRows.length !== 1 ? 's' : ''}`
          )}
        </Button>
        <button
          type="button"
          onClick={onComplete}
          className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          Skip &amp; Go to Dashboard
        </button>
      </div>
    </div>
  );
}
