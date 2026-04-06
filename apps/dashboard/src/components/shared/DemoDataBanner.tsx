'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/stores/app-store';
import { FlaskConical, X, Cloud } from 'lucide-react';

export default function DemoDataBanner() {
  const { currentOrgId } = useAppStore();
  const [hasDemoData, setHasDemoData] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!currentOrgId) return;
    async function check() {
      try {
        const res = await fetch(`/api/orgs/${currentOrgId}/settings`);
        if (res.ok) {
          const settings = await res.json();
          const demo = settings.find?.((s: any) => s.settingKey === 'has_demo_data');
          setHasDemoData(demo?.settingValue === 'true');
        }
      } catch { /* silent */ }
    }
    check();
  }, [currentOrgId]);

  if (!hasDemoData || dismissed) return null;

  return (
    <div className="mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
      <FlaskConical className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-300 font-medium">You&apos;re viewing sample data</p>
        <p className="text-xs text-amber-400/70 mt-0.5">
          This is artificial demo data to showcase CloudDory&apos;s capabilities. To see your real cloud spend, connect your AWS, GCP, or Azure account.
        </p>
        <Link
          href="/settings/cloud-accounts"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Cloud className="w-3.5 h-3.5" />
          Connect Cloud Account
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/50 hover:text-amber-400 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
