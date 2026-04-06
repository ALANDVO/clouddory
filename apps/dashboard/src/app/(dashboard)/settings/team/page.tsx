'use client';

import TeamTable from '@/components/settings/TeamTable';
import InviteDialog from '@/components/settings/InviteDialog';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-semibold text-white">Team Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage members and invite new teammates.
          </p>
        </div>
        <InviteDialog />
      </div>
      <TeamTable />
    </div>
  );
}
