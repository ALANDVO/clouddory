'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '32%', label: 'Average cost savings' },
  { value: '200+', label: 'Security checks' },
  { value: '< 10 min', label: 'Setup time' },
  { value: '4', label: 'Integrated modules' },
];

/* ---------- FinOps feature cards ---------- */
interface FinOpsFeature {
  title: string;
  href: string;
  description: string;
  comingSoon?: boolean;
  mockup: React.ReactNode;
}

const finopsFeatures: FinOpsFeature[] = [
  {
    title: 'CloudLens Cost Explorer',
    href: '/products/finops/cost-explorer/',
    description:
      'Your unified cost command center. 5 chart types, multi-dimension grouping, smart filters, trend projections, anomaly markers, CSV export — all in one view.',
    mockup: (
      <div className="space-y-2">
        {/* Filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {['AWS', 'us-east-1', 'EC2'].map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{c}</span>
          ))}
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-[3px] h-16">
          {[35, 50, 42, 68, 55, 72, 40, 80, 62, 75, 48, 85].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/50 to-cyan-400/20" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'AI Recommendations',
    href: '/products/finops/ai-recommendations/',
    description:
      'Machine learning analyzes usage patterns and surfaces $4,200+/mo in average savings — right-sizing, reserved instances, idle resources.',
    mockup: (
      <div className="space-y-1.5">
        {[
          { label: 'Right-size i3.xlarge', save: '$820/mo' },
          { label: 'Convert to Reserved', save: '$2,100/mo' },
          { label: 'Delete idle EBS', save: '$340/mo' },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5">
            <span className="text-[10px] text-slate-300 truncate mr-2">{r.label}</span>
            <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">{r.save}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Anomaly Detection',
    href: '/products/finops/anomaly-detection/',
    description:
      'Catch cost spikes within 15 minutes. AI explains why costs spiked and what to do about it.',
    mockup: (
      <div className="relative h-16">
        {/* Baseline */}
        <div className="absolute bottom-4 left-0 right-0 h-[1px] bg-slate-600" />
        {/* Line path approximation */}
        <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points="0,30 15,28 30,29 45,27 55,26 60,8 65,10 75,28 90,27 105,28 120,29"
            fill="none"
            stroke="rgb(34,211,238)"
            strokeWidth="2"
          />
          <circle cx="60" cy="8" r="4" fill="rgb(239,68,68)" />
        </svg>
        <div className="absolute top-0 right-4 text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">+340%</div>
      </div>
    ),
  },
  {
    title: 'Right-Sizing Engine',
    href: '/products/finops/right-sizing/',
    description:
      '30 days of utilization data backs every recommendation. EC2, RDS, containers — with safe downgrade paths.',
    mockup: (
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-500 font-medium px-1">
          <span>Resource</span><span>Current</span><span>Recommended</span>
        </div>
        {[
          { res: 'web-prod', cur: 'm5.2xl', rec: 'm5.xl' },
          { res: 'api-srv', cur: 'c5.4xl', rec: 'c5.2xl' },
        ].map((r) => (
          <div key={r.res} className="grid grid-cols-3 gap-1 text-[10px] rounded bg-white/5 px-1 py-1">
            <span className="text-slate-300 truncate">{r.res}</span>
            <span className="text-red-400">{r.cur}</span>
            <span className="text-emerald-400">{r.rec}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Shared Cost Allocation',
    href: '/products/finops/cost-allocation/',
    description:
      'Split shared Kubernetes, database, and networking costs using telemetry data or custom rules. Fair chargeback that teams trust.',
    mockup: (
      <div className="flex items-center gap-3">
        {/* Pie chart approximation */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(34,211,238)" strokeWidth="5" strokeDasharray="35 65" strokeDashoffset="0" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(139,92,246)" strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="-35" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(251,191,36)" strokeWidth="5" strokeDasharray="22 78" strokeDashoffset="-60" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(52,211,153)" strokeWidth="5" strokeDasharray="18 82" strokeDashoffset="-82" />
          </svg>
        </div>
        <div className="space-y-1 text-[10px]">
          {[
            { team: 'Platform', pct: '35%', color: 'bg-cyan-400' },
            { team: 'Backend', pct: '25%', color: 'bg-violet-400' },
            { team: 'ML Infra', pct: '22%', color: 'bg-amber-400' },
            { team: 'Frontend', pct: '18%', color: 'bg-emerald-400' },
          ].map((t) => (
            <div key={t.team} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
              <span className="text-slate-300">{t.team}</span>
              <span className="text-slate-500">{t.pct}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Savings Forecasting',
    href: '/products/finops/savings-forecasting/',
    description:
      'Project future costs, model what-if scenarios, and track ROI on optimizations.',
    mockup: (
      <div className="h-16">
        <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="none">
          {/* Actual */}
          <polyline points="0,35 20,30 40,28 60,25" fill="none" stroke="rgb(34,211,238)" strokeWidth="2" />
          {/* Projected (dashed) */}
          <polyline points="60,25 80,20 100,16 120,12" fill="none" stroke="rgb(34,211,238)" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
          {/* Savings area */}
          <polygon points="60,25 80,20 100,16 120,12 120,35 100,32 80,30 60,28" fill="rgb(52,211,153)" opacity="0.15" />
          <polyline points="60,28 80,30 100,32 120,35" fill="none" stroke="rgb(52,211,153)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Resource Inventory',
    href: '/products/finops/resource-inventory/',
    description:
      'Every resource across every cloud account. Tag compliance, orphaned detection, lifecycle tracking.',
    mockup: (
      <div className="space-y-1.5">
        {[
          { name: 'i-0a3f...', provider: 'AWS', tag: true },
          { name: 'vm-prod-2', provider: 'GCP', tag: true },
          { name: 'disk-orphan', provider: 'Azure', tag: false },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
            <div className="flex items-center gap-2">
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                r.provider === 'AWS' ? 'bg-orange-500/20 text-orange-400' :
                r.provider === 'GCP' ? 'bg-blue-500/20 text-blue-400' :
                'bg-sky-500/20 text-sky-400'
              }`}>{r.provider}</span>
              <span className="text-[10px] text-slate-300 font-mono">{r.name}</span>
            </div>
            <span className={`text-[9px] ${r.tag ? 'text-emerald-400' : 'text-red-400'}`}>
              {r.tag ? 'Tagged' : 'Untagged'}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'AiTags',
    href: '/products/finops/aitags',
    description:
      'Unify tagging across AWS, GCP, Azure. Create custom cost dimensions without modifying resources.',
    mockup: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">env:prod</span>
          <span className="text-[10px] text-slate-500">+</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">team:platform</span>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="text-amber-400">=</span> Virtual dimension: &quot;cost-center&quot;
        </div>
      </div>
    ),
  },
  {
    title: 'Custom Drilldowns',
    href: '#',
    description:
      'Create custom analysis pathways. Drill from any dimension to any other for organization-specific cost analysis.',
    comingSoon: true,
    mockup: (
      <div className="flex items-center gap-1 text-[10px]">
        <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300">Account</span>
        <span className="text-slate-500">&rarr;</span>
        <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300">Service</span>
        <span className="text-slate-500">&rarr;</span>
        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">Region</span>
      </div>
    ),
  },
  {
    title: 'Data Explorer',
    href: '#',
    description:
      'Build custom reports with flexible aggregations, dimensional analysis, and predefined query templates.',
    comingSoon: true,
    mockup: (
      <div className="space-y-1.5 text-[10px]">
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">SELECT</span>
          <span className="text-cyan-300">sum(cost)</span>
        </div>
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">GROUP BY</span>
          <span className="text-violet-300">service, region</span>
        </div>
      </div>
    ),
  },
];

/* ---------- Security features ---------- */
const securityFeatures = [
  {
    title: 'Security Posture (CSPM)',
    description: 'Continuous scanning of your cloud infrastructure against 200+ security checks. Identify misconfigurations, excessive permissions, and compliance gaps before they become breaches.',
  },
  {
    title: 'Threat Detection',
    description: 'Real-time alerts for suspicious activity across your cloud accounts. Full MITRE ATT&CK mapping helps your team understand attacker techniques and respond faster.',
  },
  {
    title: 'Compliance Monitoring',
    description: 'Automated compliance checks against SOC2, CIS Benchmarks, PCI-DSS, and custom frameworks. Generate audit-ready reports with one click.',
  },
  {
    title: 'Vulnerability Assessment',
    description: 'Prioritized vulnerability findings ranked by risk score and blast radius. Know which vulnerabilities matter most based on your specific environment.',
  },
];

/* ---------- Threat Intel features ---------- */
const intelFeatures = [
  {
    title: 'IOC Management',
    description: 'Track and manage indicators of compromise — IPs, domains, file hashes, and URLs — across your entire infrastructure with automated enrichment.',
  },
  {
    title: 'Threat Feeds',
    description: 'Aggregated intelligence from CISA, NIST NVD, MITRE ATT&CK, and premium commercial sources. Automatically correlated with your cloud assets.',
  },
  {
    title: 'Adversary Profiles',
    description: 'Detailed TTP mapping for threat groups targeting your industry. Understand campaigns, tooling, and infrastructure used by known adversaries.',
  },
  {
    title: 'Intel Reports',
    description: 'TLP-marked, actionable intelligence reports that correlate external threats with your environment. Share safely with stakeholders and peers.',
  },
];

/* ---------- SOAR features ---------- */
const soarFeatures = [
  {
    title: 'Automated Playbooks',
    description: 'Pre-built response playbooks for common incidents — compromised credentials, open S3 buckets, malicious IPs. Execute in seconds with full audit trail.',
  },
  {
    title: 'Custom Workflows',
    description: 'Drag-and-drop workflow builder lets you design multi-step automations tailored to your organization\'s incident response procedures.',
    comingSoon: true,
  },
  {
    title: 'Integration Hub',
    description: 'Connect CloudDory to Slack, Jira, PagerDuty, AWS, GCP, and Azure. Bi-directional sync keeps your team informed across every tool they already use.',
  },
  {
    title: 'Audit Trail',
    description: 'Complete execution history for every automated action. Who triggered it, what happened, and when — for compliance and post-incident review.',
  },
];

/* ---------- Cross-platform features ---------- */
const crossPlatformFeatures = [
  { title: 'Multi-Cloud', description: 'AWS, GCP, and Azure in one unified view. No switching between consoles.', icon: '☁' },
  { title: 'Role-Based Access', description: 'Granular permissions by team, project, or cloud account. Admins, viewers, and everything in between.', icon: '🔐' },
  { title: 'Slack & Jira', description: 'Real-time alerts in Slack. Auto-create Jira tickets from findings and recommendations.', icon: '🔗' },
  { title: 'CSV & API Export', description: 'Export any data set to CSV or pull it via our REST API for custom dashboards and pipelines.', icon: '📊' },
  { title: 'SSO / SAML', description: 'Enterprise single sign-on with SAML 2.0 and OIDC. Connect your existing identity provider.', icon: '🔑' },
  { title: '14-Day Free Trial', description: 'Full platform access. No credit card required. Cancel anytime.', icon: '🚀' },
];

/* ---------- Comparison ---------- */
const comparisonRows = [
  { feature: 'Platform', clouddory: 'One unified platform', legacy: '5+ separate tools' },
  { feature: 'Analysis', clouddory: 'AI-powered insights', legacy: 'Manual spreadsheet analysis' },
  { feature: 'Alerting', clouddory: 'Real-time (< 15 min)', legacy: 'Daily or weekly reports' },
  { feature: 'Starting price', clouddory: '$149/mo', legacy: '$2,000+/mo combined' },
  { feature: 'Setup', clouddory: '< 10 minutes', legacy: 'Days to weeks' },
  { feature: 'Multi-cloud', clouddory: 'AWS + GCP + Azure', legacy: 'Usually single-cloud' },
];


/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function FeaturesPage() {
  return (
    <main className="relative">
      <Navbar />

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5">
              Platform Overview
            </span>
            <h1 className="mt-6 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Every Feature Your Cloud<br className="hidden sm:block" /> Operations Team Needs
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              From cost optimization to security posture to automated incident response — CloudDory replaces 5+ tools with one unified platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-base hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                Start Free Trial
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" /></svg>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:bg-white/5 transition-all duration-300"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────────── QUICK STATS ───────────────────── */}
      <section className="relative py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeUp}
                className="text-center rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-6 px-4"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-white">{s.value}</div>
                <div className="mt-1 text-sm text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  FINOPS SECTION                                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5">
              FinOps &amp; Cost Optimization
            </span>
            <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Complete Cloud Financial Management
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              Get full visibility into every dollar your cloud spends. CloudDory aggregates billing data across AWS, GCP, and Azure, surfaces hidden waste, and delivers AI-powered recommendations that save teams an average of 32% on their cloud bills. From executive summaries to granular resource-level analysis — everything your FinOps practice needs in one platform.
            </p>
          </motion.div>

          {/* Feature cards grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {finopsFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
              >
                {f.comingSoon ? (
                  <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_0_30px_rgba(0,229,199,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">Coming Soon</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                    {/* Mini mockup */}
                    <div className="mt-4 rounded-lg border border-white/[0.06] bg-navy-900/60 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                      </div>
                      {f.mockup}
                    </div>
                  </div>
                ) : (
                  <Link href={f.href} className="group relative block h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_0_30px_rgba(0,229,199,0.06)]">
                    <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                    {/* Mini mockup */}
                    <div className="mt-4 rounded-lg border border-white/[0.06] bg-navy-900/60 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                      </div>
                      {f.mockup}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      Learn more
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" /></svg>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  CLOUD SECURITY SECTION                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-violet-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            {/* Left: text + cards */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
              <motion.div variants={fadeUp}>
                <span className="inline-block text-xs uppercase tracking-[0.2em] text-violet-400 font-medium bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
                  Cloud Security
                </span>
                <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Find Threats Before They Find You
                </h2>
              </motion.div>

              <div className="mt-8 space-y-4">
                {securityFeatures.map((f, i) => (
                  <motion.div
                    key={f.title}
                    custom={i + 1}
                    variants={fadeUp}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:border-violet-500/20"
                  >
                    <h3 className="text-base font-semibold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: CSS mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:sticky lg:top-32"
            >
              <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-500">Security Dashboard</span>
                </div>
                {/* Score ring */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(255,255,255)" strokeWidth="2" opacity="0.05" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(139,92,246)" strokeWidth="3" strokeDasharray="82 18" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">87</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Security Score</div>
                    <div className="text-xs text-emerald-400 mt-1">+5 from last week</div>
                  </div>
                </div>
                {/* Findings */}
                {[
                  { label: 'Critical', count: 2, color: 'bg-red-500', bar: 'w-[8%]' },
                  { label: 'High', count: 5, color: 'bg-orange-500', bar: 'w-[20%]' },
                  { label: 'Medium', count: 12, color: 'bg-yellow-500', bar: 'w-[48%]' },
                  { label: 'Low', count: 23, color: 'bg-blue-500', bar: 'w-[92%]' },
                ].map((item) => (
                  <div key={item.label} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-xs text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-xs font-medium text-white">{item.count}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${item.color} opacity-40 ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  THREAT INTELLIGENCE SECTION                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            {/* Right mockup first on mobile, but left visually on lg via order */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:sticky lg:top-32 lg:order-1"
            >
              <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-500">Threat Feed — Live</span>
                </div>
                <div className="space-y-3">
                  {[
                    { ioc: '185.220.101.xxx', type: 'IP Address', severity: 'Critical', actor: 'APT29', time: '2 min ago' },
                    { ioc: 'malware-c2.example.net', type: 'Domain', severity: 'High', actor: 'Lazarus Group', time: '8 min ago' },
                    { ioc: 'a3f8d2e1...c9b4', type: 'SHA-256', severity: 'High', actor: 'FIN7', time: '15 min ago' },
                    { ioc: 'phish-kit.example.org/login', type: 'URL', severity: 'Medium', actor: 'TA505', time: '32 min ago' },
                    { ioc: '91.215.85.xxx', type: 'IP Address', severity: 'Critical', actor: 'Sandworm', time: '1 hr ago' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono text-slate-300">{item.ioc}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          item.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{item.severity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{item.type}</span>
                          <span className="text-[10px] text-amber-400 font-medium">{item.actor}</span>
                        </div>
                        <span className="text-[10px] text-slate-600">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Text + cards */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="lg:order-2">
              <motion.div variants={fadeUp}>
                <span className="inline-block text-xs uppercase tracking-[0.2em] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5">
                  Threat Intelligence
                </span>
                <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Know Your Adversary
                </h2>
              </motion.div>

              <div className="mt-8 space-y-4">
                {intelFeatures.map((f, i) => (
                  <motion.div
                    key={f.title}
                    custom={i + 1}
                    variants={fadeUp}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:border-amber-500/20"
                  >
                    <h3 className="text-base font-semibold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  SOAR / AUTOMATION SECTION                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            {/* Left: text + cards */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
              <motion.div variants={fadeUp}>
                <span className="inline-block text-xs uppercase tracking-[0.2em] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
                  Security Automation
                </span>
                <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Respond in Seconds, Not Hours
                </h2>
              </motion.div>

              <div className="mt-8 space-y-4">
                {soarFeatures.map((f, i) => (
                  <motion.div
                    key={f.title}
                    custom={i + 1}
                    variants={fadeUp}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{f.title}</h3>
                      {f.comingSoon && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">Coming Soon</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: CSS mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:sticky lg:top-32"
            >
              <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-500">Active Playbooks</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Isolate Compromised EC2', status: 'Active', runs: 24, lastRun: '3 min ago' },
                    { name: 'Rotate Exposed Credentials', status: 'Active', runs: 18, lastRun: '1 hr ago' },
                    { name: 'Block Malicious IP', status: 'Active', runs: 156, lastRun: '12 min ago' },
                    { name: 'Remediate Open S3 Bucket', status: 'Paused', runs: 7, lastRun: '2 days ago' },
                    { name: 'Quarantine Infected Instance', status: 'Active', runs: 31, lastRun: '45 min ago' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-200 font-medium">{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>{item.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{item.runs} runs this month</span>
                        <span className="text-[10px] text-slate-600">Last: {item.lastRun}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  CROSS-PLATFORM FEATURES                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Works Across All Modules
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Platform-wide capabilities that power every pillar of CloudDory.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {crossPlatformFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
              >
                <div className="text-3xl mb-3" role="img" aria-label={f.title}>{f.icon}</div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  COMPARISON TABLE                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Why Teams Switch to CloudDory
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              One platform that does what used to take five.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-3 text-sm font-medium border-b border-white/[0.06]">
              <div className="p-4 text-slate-500">Feature</div>
              <div className="p-4 text-cyan-400 text-center bg-cyan-500/[0.03]">CloudDory</div>
              <div className="p-4 text-slate-500 text-center">Legacy Tools</div>
            </div>
            {/* Table rows */}
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-sm ${i < comparisonRows.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <div className="p-4 text-slate-300 font-medium">{row.feature}</div>
                <div className="p-4 text-center text-white bg-cyan-500/[0.03]">{row.clouddory}</div>
                <div className="p-4 text-center text-slate-500">{row.legacy}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  FINAL CTA                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              See Every Feature in Action
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Start your free trial and explore the full platform across all four pillars. No credit card required.
            </p>
            <div className="mt-10">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                Start Free Trial
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Free 14-day trial. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
