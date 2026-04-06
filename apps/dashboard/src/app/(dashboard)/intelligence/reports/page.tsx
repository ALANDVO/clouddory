"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModuleGate from "@/components/shared/ModuleGate";

export default function ReportsPage() {
  return (
    <ModuleGate module="intelligence">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Threat Reports</h1>
        <p className="text-slate-500 mt-1">Intelligence reports on active threats and campaigns</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="font-display font-semibold text-lg text-white mb-2">No threat reports</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Threat reports will appear here once your intelligence feeds are configured and active.
        </p>
        <div className="flex gap-3">
          <Link href="/integrations">
            <Button>Configure Feeds</Button>
          </Link>
        </div>
      </div>
    </div>
    </ModuleGate>
  );
}
