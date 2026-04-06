'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookmarkButton() {
  const { data: session } = useSession();
  const orgId = (session as any)?.currentOrgId;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!orgId || !name.trim()) return;
    setSaving(true);
    try {
      const filterState: Record<string, string> = {};
      searchParams.forEach((v, k) => { filterState[k] = v; });

      await fetch(`/api/orgs/${orgId}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), page: pathname, filterState }),
      });
      setSaved(true);
      setTimeout(() => { setOpen(false); setSaved(false); setName(''); }, 1200);
    } catch {} finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors shadow-lg backdrop-blur-md"
      >
        <Bookmark className="w-4 h-4" />
        <span className="text-sm font-medium">Save View</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bm-name">Bookmark name</Label>
              <Input
                id="bm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q1 AWS costs by team"
                autoFocus
              />
            </div>
            <div className="text-xs text-slate-500">
              Page: <span className="text-slate-400">{pathname}</span>
              {searchParams.toString() && (
                <span className="ml-1 text-slate-600">?{searchParams.toString()}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Bookmark'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
