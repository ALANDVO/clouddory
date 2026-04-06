"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModuleGate from "@/components/shared/ModuleGate";

export default function AutomationPage() {
  return (
    <ModuleGate module="automation">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Automation & SOAR</h1>
          <p className="text-slate-500 mt-1">Security orchestration, automation, and response</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/automation/playbooks">Manage Playbooks</Link>
        </Button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="font-display font-semibold text-lg text-white mb-2">No playbooks configured</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Create your first automated playbook to streamline incident response and security operations.
        </p>
        <div className="flex gap-3">
          <Link href="/automation/playbooks">
            <Button>Create Playbook</Button>
          </Link>
        </div>
      </div>
    </div>
    </ModuleGate>
  );
}
