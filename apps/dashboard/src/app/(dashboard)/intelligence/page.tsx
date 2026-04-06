"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModuleGate from "@/components/shared/ModuleGate";

export default function IntelligencePage() {
  return (
    <ModuleGate module="intelligence">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Threat Intelligence</h1>
          <p className="text-slate-500 mt-1">Real-time threat monitoring and intelligence feeds</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/intelligence/iocs">IOC Management</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/intelligence/reports">Threat Reports</Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
          <Eye className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="font-display font-semibold text-lg text-white mb-2">Threat intelligence feeds not configured</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Configure your threat intelligence feeds to start tracking adversaries, IOCs, and emerging threats.
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
