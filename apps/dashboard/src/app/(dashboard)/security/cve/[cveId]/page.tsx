'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, ExternalLink, Clock, User, Tag, FileText, Server, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ModuleGate from '@/components/shared/ModuleGate';
import { useAppStore } from '@/stores/app-store';

interface CveDetail {
  id: string;
  cveId: string;
  severity: string;
  cvssScore: number | null;
  title: string;
  description: string;
  affectedProduct: string | null;
  vendor: string | null;
  published: string;
  cisaKev: boolean;
  exploitAvailable: boolean;
  patchAvailable: boolean;
  source: string;
  status: string;
  assignedTo: string | null;
  notes: string | null;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'ring-blue-500/30' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-slate-500/10 text-slate-400' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-amber-500/10 text-amber-400' },
  { value: 'mitigated', label: 'Mitigated', color: 'bg-emerald-500/10 text-emerald-400' },
  { value: 'not_affected', label: 'Not Affected', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'accepted_risk', label: 'Accepted Risk', color: 'bg-purple-500/10 text-purple-400' },
];

export default function CveDetailPage() {
  const params = useParams();
  const cveId = decodeURIComponent(params.cveId as string);
  const { currentOrgId } = useAppStore();
  const [cve, setCve] = useState<CveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [affectedResources, setAffectedResources] = useState<{ service: string; provider: string; cost: number; records: number }[]>([]);
  const [scanningResources, setScanningResources] = useState(false);

  useEffect(() => {
    if (!currentOrgId) return;
    async function fetchCve() {
      try {
        const res = await fetch(`/api/orgs/${currentOrgId}/cves?search=${encodeURIComponent(cveId)}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          const found = data.cves?.find((c: CveDetail) => c.cveId === cveId);
          if (found) {
            setCve(found);
            setStatus(found.status || 'new');
            setNotes(found.notes || '');
            setAssignedTo(found.assignedTo || '');
          }
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchCve();
  }, [currentOrgId, cveId]);

  // Scan resources for potential CVE matches
  useEffect(() => {
    if (!currentOrgId || !cve) return;
    async function scanResources() {
      setScanningResources(true);
      try {
        const res = await fetch(`/api/orgs/${currentOrgId}/spend?group_by=service`);
        if (!res.ok) return;
        const data = await res.json();

        // Map CVE vendor/product to cloud service keywords
        const vendor = (cve!.vendor || '').toLowerCase();
        const product = (cve!.affectedProduct || '').toLowerCase();
        const title = (cve!.title || '').toLowerCase();

        // Build search terms from CVE data
        const searchTerms: string[] = [vendor, product].filter(Boolean);
        // Also extract keywords from the title
        const titleWords = title.split(/[\s\-—:,()]+/).filter((w: string) => w.length > 3);
        searchTerms.push(...titleWords);

        // Known vendor→service mappings for cloud
        const VENDOR_SERVICE_MAP: Record<string, string[]> = {
          'amazon': ['ec2', 's3', 'rds', 'lambda', 'route 53', 'cloudfront', 'dynamodb', 'eks', 'ecs'],
          'aws': ['ec2', 's3', 'rds', 'lambda', 'route 53', 'cloudfront', 'dynamodb', 'eks', 'ecs'],
          'google': ['compute engine', 'cloud storage', 'bigquery', 'gke', 'cloud sql'],
          'microsoft': ['virtual machines', 'sql database', 'blob storage', 'aks'],
          'apache': ['apache', 'httpd', 'tomcat'],
          'nginx': ['nginx'],
          'openssh': ['ssh', 'openssh'],
          'openssl': ['ssl', 'tls', 'openssl'],
          'docker': ['docker', 'container', 'ecs', 'eks', 'gke', 'aks'],
          'kubernetes': ['kubernetes', 'k8s', 'eks', 'gke', 'aks'],
          'redis': ['elasticache', 'redis'],
          'postgresql': ['rds', 'cloud sql', 'postgresql'],
          'nodejs': ['lambda', 'node'],
          'php': ['php', 'ec2'],
          'fortinet': ['fortigate', 'fortios'],
          'connectwise': ['screenconnect'],
          'tukaani': ['xz', 'linux'],
          'jenkins': ['jenkins'],
          'jetbrains': ['teamcity'],
          'paloaltonetworks': ['pan-os', 'palo alto'],
          'vmware': ['vcenter', 'esxi'],
          'ivanti': ['ivanti', 'endpoint'],
        };

        const matchKeywords: string[] = [];
        for (const term of searchTerms) {
          matchKeywords.push(term);
          const mapped = VENDOR_SERVICE_MAP[term];
          if (mapped) mapped.forEach((m: string) => matchKeywords.push(m));
        }
        // Dedupe
        const uniqueKeywords = Array.from(new Set(matchKeywords));

        // Match against actual cloud resources
        const records = data.records || [];
        const serviceMap = new Map<string, { cost: number; records: number; provider: string }>();

        for (const record of records) {
          const svc = (record.service || '').toLowerCase();
          const src = record.source || 'unknown';

          let matched = false;
          for (let k = 0; k < uniqueKeywords.length; k++) {
            if (uniqueKeywords[k] && svc.includes(uniqueKeywords[k])) { matched = true; break; }
          }

          if (matched) {
            const key = record.service;
            const existing = serviceMap.get(key);
            if (existing) {
              existing.cost += parseFloat(record.cost) || 0;
              existing.records += 1;
            } else {
              serviceMap.set(key, { cost: parseFloat(record.cost) || 0, records: 1, provider: src });
            }
          }
        }

        setAffectedResources(
          Array.from(serviceMap.entries())
            .map(([service, d]) => ({ service, ...d }))
            .sort((a, b) => b.cost - a.cost)
        );
      } catch { /* silent */ }
      finally { setScanningResources(false); }
    }
    scanResources();
  }, [currentOrgId, cve]);

  const handleSave = async () => {
    if (!currentOrgId || !cve) return;
    setSaving(true);
    try {
      await fetch(`/api/orgs/${currentOrgId}/cves/${cve.cveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, assignedTo: assignedTo || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const sevConfig = SEVERITY_CONFIG[cve?.severity || 'medium'] || SEVERITY_CONFIG.medium;

  if (loading) {
    return (
      <ModuleGate module="security">
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner className="w-8 h-8 text-cyan-400" />
        </div>
      </ModuleGate>
    );
  }

  if (!cve) {
    return (
      <ModuleGate module="security">
        <div className="space-y-6">
          <Link href="/security/detections" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Detections
          </Link>
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="font-display font-semibold text-lg text-white">CVE not found</h2>
            <p className="text-sm text-slate-400 mt-1">{cveId} is not in the CloudDory vulnerability catalog.</p>
          </div>
        </div>
      </ModuleGate>
    );
  }

  return (
    <ModuleGate module="security">
      <div className="space-y-6 max-w-4xl">
        {/* Back link */}
        <Link href="/security/detections" className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Detections
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-14 h-14 rounded-xl ${sevConfig.bg} ring-1 ${sevConfig.ring} flex items-center justify-center flex-shrink-0`}>
            <span className={`font-display font-extrabold text-lg ${sevConfig.color}`}>
              {cve.cvssScore || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-2xl text-white">{cve.cveId}</h1>
              <Badge className={`${sevConfig.bg} ${sevConfig.color} uppercase text-xs`}>{cve.severity}</Badge>
              {cve.cisaKev && <Badge className="bg-red-500/10 text-red-400 text-xs">CISA KEV</Badge>}
              {cve.exploitAvailable && <Badge className="bg-orange-500/10 text-orange-400 text-xs">Exploit Available</Badge>}
              {cve.patchAvailable && <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">Patch Available</Badge>}
            </div>
            <p className="text-lg text-slate-300">{cve.title}</p>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-white/5 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">CVSS Score</p>
            <p className={`text-2xl font-display font-bold ${sevConfig.color}`}>{cve.cvssScore || 'N/A'}</p>
          </Card>
          <Card className="border-white/5 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Published</p>
            <p className="text-sm font-medium text-white">{new Date(cve.published).toLocaleDateString()}</p>
          </Card>
          <Card className="border-white/5 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Vendor</p>
            <p className="text-sm font-medium text-white capitalize">{cve.vendor || 'Unknown'}</p>
          </Card>
          <Card className="border-white/5 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Affected</p>
            <p className="text-sm font-medium text-white capitalize">{cve.affectedProduct || 'Unknown'}</p>
          </Card>
        </div>

        {/* Description */}
        <Card className="border-white/5">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Description
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{cve.description}</p>
          </CardContent>
        </Card>

        {/* Threat Assessment */}
        <Card className="border-white/5">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Threat Assessment
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${cve.cisaKev ? 'bg-red-500/5 border border-red-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
                <p className="text-xs text-slate-500 mb-1">CISA Known Exploited</p>
                <p className={`text-sm font-semibold ${cve.cisaKev ? 'text-red-400' : 'text-slate-400'}`}>
                  {cve.cisaKev ? 'Yes — Actively Exploited in the Wild' : 'No'}
                </p>
                {cve.cisaKev && <p className="text-xs text-red-400/70 mt-1">Federal agencies must patch immediately per BOD 22-01</p>}
              </div>
              <div className={`p-4 rounded-lg ${cve.exploitAvailable ? 'bg-orange-500/5 border border-orange-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
                <p className="text-xs text-slate-500 mb-1">Public Exploit</p>
                <p className={`text-sm font-semibold ${cve.exploitAvailable ? 'text-orange-400' : 'text-slate-400'}`}>
                  {cve.exploitAvailable ? 'Yes — Exploit Code Available' : 'No known public exploit'}
                </p>
              </div>
              <a
                href="#remediation"
                className={`p-4 rounded-lg block hover:ring-1 transition-all ${cve.patchAvailable ? 'bg-emerald-500/5 border border-emerald-500/20 hover:ring-emerald-500/30' : 'bg-amber-500/5 border border-amber-500/20 hover:ring-amber-500/30'}`}
              >
                <p className="text-xs text-slate-500 mb-1">Patch Status</p>
                <p className={`text-sm font-semibold ${cve.patchAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {cve.patchAvailable ? 'Patch Available — See Steps Below ↓' : 'No Patch — See Mitigations Below ↓'}
                </p>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Remediation Steps */}
        <Card className="border-white/5" id="remediation">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Recommended Actions
            </h3>
            <ol className="space-y-3">
              {cve.patchAvailable ? (
                <>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-medium text-white">Update to the latest patched version</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cve.vendor ? `Check ${cve.vendor.charAt(0).toUpperCase() + cve.vendor.slice(1)}'s security advisory for the specific patched version of ${cve.affectedProduct || 'the affected software'}.` : 'Check the vendor\'s security advisory for the specific patched version.'}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm font-medium text-white">Scan your infrastructure for affected instances</p>
                      <p className="text-xs text-slate-400 mt-0.5">Check your cloud accounts for any running instances of {cve.affectedProduct || 'the affected software'}. CloudDory will flag affected resources when cloud scanning is enabled.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-sm font-medium text-white">Apply the patch and verify</p>
                      <p className="text-xs text-slate-400 mt-0.5">After patching, run a verification scan to confirm the vulnerability is remediated. Update the status below to &quot;Mitigated&quot;.</p>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-medium text-white">Apply temporary mitigations</p>
                      <p className="text-xs text-slate-400 mt-0.5">No patch is available yet. Check the vendor&apos;s advisory for workarounds, configuration changes, or WAF rules that can reduce exposure.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm font-medium text-white">Restrict access to affected services</p>
                      <p className="text-xs text-slate-400 mt-0.5">Use network segmentation, security groups, or firewall rules to limit exposure until a patch is released.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-sm font-medium text-white">Monitor for patch release</p>
                      <p className="text-xs text-slate-400 mt-0.5">CloudDory will update this CVE when a patch becomes available. Set the status below to &quot;Reviewing&quot; to track it.</p>
                    </div>
                  </li>
                </>
              )}
              {cve.cisaKev && (
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">!</span>
                  <div>
                    <p className="text-sm font-medium text-red-400">CISA KEV — Priority remediation required</p>
                    <p className="text-xs text-slate-400 mt-0.5">This vulnerability is listed in CISA&apos;s Known Exploited Vulnerabilities catalog. It is being actively exploited in the wild and should be treated as an emergency.</p>
                  </div>
                </li>
              )}
            </ol>
          </CardContent>
        </Card>

        {/* Affected Resources in Your Environment */}
        <Card className="border-white/5">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-400" /> Your Affected Resources
            </h3>
            {scanningResources ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Scan className="w-4 h-4 animate-spin" /> Scanning your cloud inventory...
              </div>
            ) : affectedResources.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  These services in your cloud environment may be affected by this vulnerability. Click to view cost details.
                </p>
                {affectedResources.map((r) => {
                  const slug = r.service.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={r.service}
                      href={`/costs/${encodeURIComponent(slug)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-violet-500/5 border border-violet-500/15 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-violet-400" />
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">{r.service}</p>
                          <p className="text-xs text-slate-500">{r.provider.toUpperCase()} · {r.records} cost records</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-white">${r.cost.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-500">monthly spend</p>
                      </div>
                    </Link>
                  );
                })}
                <p className="text-[10px] text-slate-600 mt-2">
                  Agentless scan — based on service matching. Install the CloudDory agent for deeper CVE scanning of running workloads (coming soon).
                </p>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm text-slate-400">No matching resources found in your cloud accounts.</p>
                <p className="text-xs text-slate-500 mt-1">
                  This CVE affects <span className="text-white">{cve.vendor}/{cve.affectedProduct}</span> which was not detected in your connected cloud accounts. You may still be affected through indirect dependencies.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Org's Response */}
        <Card className="border-white/5">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> Your Response
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        status === opt.value
                          ? `${opt.color} ring-1 ring-current`
                          : 'bg-white/[0.03] text-slate-500 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Assigned To</label>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Team member name or email"
                  className="max-w-md"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes, remediation steps, or context..."
                  className="w-full h-24 rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {saving ? 'Saving...' : 'Save Response'}
                </Button>
                {saved && <span className="text-xs text-emerald-400">Saved!</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <div className="text-xs text-slate-600 flex items-center gap-4 pt-4 border-t border-white/5">
          <span>Data sourced from NIST National Vulnerability Database (NVD) and CISA Known Exploited Vulnerabilities catalog.</span>
          <a
            href={`https://nvd.nist.gov/vuln/detail/${cve.cveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            View on NVD <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </ModuleGate>
  );
}
