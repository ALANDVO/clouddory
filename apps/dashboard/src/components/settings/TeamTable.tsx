'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { MoreHorizontal, Shield, UserCircle, Eye } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  image?: string;
}

const roleBadgeVariant: Record<string, 'default' | 'success' | 'secondary' | 'warning'> = {
  owner: 'success',
  admin: 'default',
  member: 'secondary',
  viewer: 'warning',
};

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Shield className="w-3 h-3 mr-1" />,
  admin: <Shield className="w-3 h-3 mr-1" />,
  member: <UserCircle className="w-3 h-3 mr-1" />,
  viewer: <Eye className="w-3 h-3 mr-1" />,
};

export default function TeamTable() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;

    async function fetchMembers() {
      try {
        const res = await fetch(`/api/orgs/${orgId}/members`);
        if (!res.ok) throw new Error('Failed to load team members');
        const data = await res.json();
        setMembers(data.members || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load members');
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [orgId]);

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/orgs/${orgId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: newRole as Member['role'] } : m
        )
      );
    } catch {
      // Silently handle - could add toast notification here
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const res = await fetch(`/api/orgs/${orgId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove member');

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      // Silently handle - could add toast notification here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="w-6 h-6 text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-rose-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          {members.length} member{members.length !== 1 ? 's' : ''} in your organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Joined
                </th>
                <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-12">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr key={member.id} className="group">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-sm font-medium text-cyan-400 shrink-0">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          member.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={roleBadgeVariant[member.role] || 'secondary'} className="capitalize">
                      {roleIcons[member.role]}
                      {member.role}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-400">
                      {new Date(member.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="py-3">
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change role</DropdownMenuLabel>
                          {['admin', 'member', 'viewer']
                            .filter((r) => r !== member.role)
                            .map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleChangeRole(member.id, role)}
                                className="capitalize"
                              >
                                Set as {role}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id)}
                            className="text-rose-400 focus:text-rose-400"
                          >
                            Remove from team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
