'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download, CheckCircle, Lock, Eye, Server } from 'lucide-react';

const certifications = [
  {
    name: 'SOC 2 Type II',
    status: 'Certified',
    lastAudit: '2025-11-15',
    auditor: 'Deloitte',
    icon: ShieldCheck,
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    name: 'GDPR',
    status: 'Compliant',
    lastAudit: '2025-09-20',
    auditor: 'Internal + DPO Review',
    icon: Lock,
    color: 'text-blue-400 bg-blue-500/10',
  },
  {
    name: 'ISO 27001',
    status: 'Certified',
    lastAudit: '2025-10-01',
    auditor: 'BSI Group',
    icon: CheckCircle,
    color: 'text-purple-400 bg-purple-500/10',
  },
];

const practices = [
  { icon: Lock, title: 'Encryption at Rest', desc: 'All data encrypted with AES-256. Keys managed via AWS KMS.' },
  { icon: Eye, title: 'Encryption in Transit', desc: 'TLS 1.3 enforced for all API and web traffic.' },
  { icon: Server, title: 'Infrastructure Security', desc: 'SOC 2 compliant hosting in AWS us-east-1 and eu-west-1 regions.' },
  { icon: ShieldCheck, title: 'Access Controls', desc: 'Role-based access control (RBAC) with SSO/SAML support.' },
  { icon: CheckCircle, title: 'Penetration Testing', desc: 'Annual third-party pen tests. Last completed Q3 2025.' },
  { icon: Lock, title: 'Data Retention', desc: 'Configurable retention. Data purged within 30 days of account closure.' },
];

export default function TrustCenterPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trust Center</CardTitle>
          <CardDescription>CloudDory&apos;s security posture and compliance certifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {certifications.map((cert) => {
              const Icon = cert.icon;
              return (
                <div key={cert.name} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cert.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="default" className="text-[10px]">{cert.status}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cert.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Last audit: {new Date(cert.lastAudit).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">Auditor: {cert.auditor}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download Report
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {practices.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-3 p-3 rounded-lg border border-white/5">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
