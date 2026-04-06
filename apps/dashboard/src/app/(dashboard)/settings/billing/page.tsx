'use client';

import { Github, CheckCircle2, ExternalLink, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  'FinOps & Cost Optimization',
  'Cloud Security (CSPM) + CVE Tracking',
  'Threat Intelligence Feeds',
  'SOAR Automated Playbooks',
  'DoryAI Assistant (Gemini/OpenAI/Anthropic)',
  'AWS, GCP, Azure Integrations',
  'AiTags Virtual Tagging',
  'Custom Dashboards & Reports',
  'Jira, Confluence, Slack Integrations',
  'Unlimited Users & Cloud Accounts',
  'Role-Based Access Controls',
  'API Access & Webhooks',
];

export default function BillingPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">CloudDory is free and open source — no billing required.</p>
      </div>

      {/* Free Plan */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-navy-900/80">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-display font-bold text-3xl text-white">
              $0 <span className="text-lg text-slate-400 font-normal">/ forever</span>
            </h3>
            <Badge className="bg-cyan-500/10 text-cyan-400">Open Source</Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            MIT license. No usage limits. No feature gates. Self-host or use the hosted demo.
          </p>
        </CardContent>
      </Card>

      {/* Built By */}
      <Card className="border-white/5">
        <CardContent className="p-8">
          <h3 className="font-display font-semibold text-lg text-white mb-3">Built by Alan Vo</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            AI and cloud infrastructure developer specializing in FinOps, DevSecOps, and intelligent automation.
            CloudDory was built to prove that enterprise-grade cloud operations tools don&apos;t need enterprise-grade budgets.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="mailto:alanvo@gmail.com">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="w-3.5 h-3.5" /> alanvo@gmail.com
              </Button>
            </a>
            <a href="https://github.com/ALANDVO" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="w-3.5 h-3.5" /> GitHub
              </Button>
            </a>
            <a href="https://clouddory.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="w-3.5 h-3.5" /> clouddory.com
              </Button>
            </a>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Looking for AI development, cloud architecture, or DevOps consulting?{' '}
              <a href="mailto:alanvo@gmail.com" className="text-cyan-400 hover:underline">Get in touch</a>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Self-Host */}
      <Card className="border-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-white">Self-Host CloudDory</h3>
              <p className="text-xs text-slate-400 mt-1">Deploy on your own infrastructure in under 10 minutes.</p>
            </div>
            <a href="https://github.com/ALANDVO/clouddory" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2">
                <Github className="w-3.5 h-3.5" /> View on GitHub
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
