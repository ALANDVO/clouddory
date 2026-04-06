'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { value: 'Zero', label: 'Resource modifications needed' },
  { value: 'Unlimited', label: 'Custom dimensions' },
  { value: '3 Clouds', label: 'Cross-cloud unification' },
  { value: 'Rule-Based', label: 'Automated allocation' },
];

const tagTypes = [
  {
    title: 'Custom Rules',
    description:
      'Define conditions based on provider, service, region, account, tags, and resource names. Build a funnel of rules that categorize every resource into the right bucket.',
    badge: 'Available Now',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    title: 'AI-Powered Tags',
    description:
      'Let AI analyze your resource naming patterns, usage telemetry, and existing tags to automatically suggest and maintain AiTag classifications.',
    badge: 'Coming Soon',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Relational Tags',
    description:
      'Create tag hierarchies that inherit values from parent resources. If an account belongs to a team, every resource in that account inherits the team tag.',
    badge: 'Coming Soon',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Sync Tags',
    description:
      'Bidirectional sync between CloudDory AiTags and native cloud tags. Keep your cloud provider tagging in sync without manual effort.',
    badge: 'Coming Soon',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

const useCases = [
  {
    title: 'Team Allocation',
    description:
      'Map every cloud resource to the team that owns it — even when AWS tags say "team", GCP labels say "owner", and Azure has no tag at all.',
    example: 'If Provider = AWS AND Tag:team contains "platform" => "Platform Engineering"',
  },
  {
    title: 'Environment Separation',
    description:
      'Create a unified "Environment" dimension across all accounts. No more guessing if "stg", "staging", and "stage" mean the same thing.',
    example: 'If Tag:env contains "prod" OR Account = "123456789" => "Production"',
  },
  {
    title: 'Application Grouping',
    description:
      'Group resources by business application regardless of which cloud service they use. An API might span EC2, RDS, ElastiCache, and CloudFront.',
    example: 'If Resource Name starts with "api-" OR Tag:app = "gateway" => "API Gateway"',
  },
  {
    title: 'Cost Center Mapping',
    description:
      'Align cloud costs to financial cost centers for accurate chargeback. Use account, tag, and naming patterns to route costs to the right budget.',
    example: 'If Account = "prod-*" AND Region = "us-east-1" => "CC-4200-US-PROD"',
  },
];

const steps = [
  {
    number: '01',
    title: 'Define Your Dimension',
    description:
      'Name your AiTag (e.g., "Team", "Environment", "Application") and choose rule-based or AI-powered classification.',
  },
  {
    number: '02',
    title: 'Build Your Funnel',
    description:
      'Create rules that match resources using conditions like provider, service, region, tags, and resource names. Rules are evaluated top-to-bottom — first match wins.',
  },
  {
    number: '03',
    title: 'Set Defaults',
    description:
      'Assign a default value for resources that do not match any rule. This ensures 100% of your costs are categorized — no blind spots.',
  },
  {
    number: '04',
    title: 'Analyze & Iterate',
    description:
      'Use AiTags in Cost Explorer, reports, and dashboards. Refine rules as your infrastructure evolves — changes apply retroactively.',
  },
];

export default function VirtualTagsContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium tracking-wide uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            FinOps &middot; AiTags
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            One Tag System to{' '}
            <span className="text-gradient">Rule Them All</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Your AWS uses &quot;team&quot; tags, GCP uses &quot;owner&quot; labels, and Azure has
            nothing at all. AiTags create a single, consistent cost dimension across every
            cloud — without touching a single resource.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://dashboard.clouddory.com/register"
              className="btn-glow group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-base hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
            >
              Start Using AiTags
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </a>
            <Link
              href="/products/finops"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300"
            >
              Back to FinOps
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="font-display font-extrabold text-2xl lg:text-3xl text-cyan-400">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              The Problem
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Tagging is <span className="text-gradient">broken</span> across clouds
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              Every cloud provider has its own tagging system, every team follows different
              conventions, and enforcing tag compliance after the fact is nearly impossible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Inconsistent naming',
                desc: '"team", "Team", "owner", "dept" — the same concept tagged differently across providers and accounts.',
              },
              {
                title: 'Untagged resources',
                desc: '40-60% of cloud resources have no meaningful tags. Modifying live resources to add tags is risky and slow.',
              },
              {
                title: 'No unified view',
                desc: 'AWS tags, GCP labels, and Azure tags are fundamentally different systems. No native way to unify them.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 bg-rose-500/5 border border-rose-500/10"
              >
                <h3 className="font-display font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How AiTags Work */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              How It Works
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              The <span className="text-gradient">funnel approach</span> to cost tagging
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              AiTags evaluate your resources through a prioritized chain of rules.
              Each rule catches matching resources and assigns them a value. Unmatched resources
              fall through to the default.
            </p>
          </motion.div>

          {/* Visual funnel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto mb-20"
          >
            <div className="rounded-2xl border border-white/5 bg-navy-900/40 p-8 space-y-4">
              <div className="text-center mb-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AiTag: &quot;Team&quot;</span>
              </div>
              {/* Funnel steps */}
              {[
                { rule: 'Rule 1', condition: 'Tag:team contains "platform" OR Account = prod-infra', value: 'Platform Engineering', color: 'cyan', width: 'w-full' },
                { rule: 'Rule 2', condition: 'Tag:team contains "product" OR Service = CloudFront', value: 'Product', color: 'violet', width: 'w-[90%]' },
                { rule: 'Rule 3', condition: 'Service = SageMaker OR Tag:dept = "ml"', value: 'Data Science', color: 'amber', width: 'w-[80%]' },
                { rule: 'Default', condition: 'Everything else', value: 'Unallocated', color: 'slate', width: 'w-[70%]' },
              ].map((item, i) => (
                <div key={item.rule} className={`${item.width} mx-auto`}>
                  <div className={`rounded-xl border px-4 py-3 transition-all ${
                    item.color === 'cyan' ? 'border-cyan-500/20 bg-cyan-500/5' :
                    item.color === 'violet' ? 'border-violet-500/20 bg-violet-500/5' :
                    item.color === 'amber' ? 'border-amber-500/20 bg-amber-500/5' :
                    'border-white/10 bg-white/[0.02] border-dashed'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        item.color === 'cyan' ? 'text-cyan-400' :
                        item.color === 'violet' ? 'text-violet-400' :
                        item.color === 'amber' ? 'text-amber-400' :
                        'text-slate-500'
                      }`}>{item.rule}</span>
                      <span className={`text-xs font-semibold ${
                        item.color === 'cyan' ? 'text-cyan-300' :
                        item.color === 'violet' ? 'text-violet-300' :
                        item.color === 'amber' ? 'text-amber-300' :
                        'text-slate-400'
                      }`}>{item.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{item.condition}</p>
                  </div>
                  {i < 3 && (
                    <div className="flex justify-center my-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-600">
                        <path d="M6 2 L6 10 M3 7 L6 10 L9 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8 lg:gap-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div className="font-display font-extrabold text-5xl text-cyan-500/10 mb-3">
                  {s.number}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 w-10 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tag Types */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-[150px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Tag Types
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Four ways to <span className="text-gradient">organize costs</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {tagTypes.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-white">{t.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{t.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rule Builder Mockup */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Rule Builder
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Intuitive <span className="text-gradient">rule creation</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              Build rules with a visual editor. Combine conditions with AND/OR logic, preview matches
              in real time, and reorder priorities with drag-and-drop.
            </p>
          </motion.div>

          {/* CSS Mockup of the rule builder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-white/10 bg-navy-950/80 backdrop-blur-sm overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">AiTag: Team</div>
                  <div className="text-[10px] text-slate-500">3 rules &middot; 4 values</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Live</span>
              </div>
            </div>

            {/* Rules */}
            <div className="p-6 space-y-3">
              {[
                {
                  priority: 1,
                  value: 'Platform Engineering',
                  conditions: [
                    { dim: 'Tag Key', op: 'equals', val: 'team' },
                    { dim: 'Tag Value', op: 'contains', val: 'platform' },
                  ],
                  match: '847 resources',
                  cost: '$12,340',
                },
                {
                  priority: 2,
                  value: 'Product',
                  conditions: [
                    { dim: 'Service', op: 'equals', val: 'CloudFront' },
                    { dim: 'Tag Value', op: 'contains', val: 'product' },
                  ],
                  match: '312 resources',
                  cost: '$6,890',
                },
                {
                  priority: 3,
                  value: 'Data Science',
                  conditions: [
                    { dim: 'Service', op: 'equals', val: 'SageMaker' },
                    { dim: 'Resource Type', op: 'contains', val: 'notebook' },
                  ],
                  match: '156 resources',
                  cost: '$8,420',
                },
              ].map((rule) => (
                <div key={rule.priority} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-bold">
                        {rule.priority}
                      </span>
                      <span className="text-sm font-semibold text-white">{rule.value}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-slate-400">{rule.match}</span>
                      <span className="text-cyan-400 font-medium">{rule.cost}</span>
                    </div>
                  </div>
                  <div className="ml-7 space-y-1.5">
                    {rule.conditions.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-1.5 text-[10px]">
                        {ci > 0 && <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">AND</span>}
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{c.dim}</span>
                        <span className="text-slate-500">{c.op}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">{c.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Default */}
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-slate-500 text-[9px] font-bold">*</span>
                    <span className="text-sm text-slate-400 italic">Unallocated</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">default</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-slate-500">142 resources</span>
                    <span className="text-slate-400">$3,210</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-[150px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Use Cases
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Built for <span className="text-gradient">real-world</span> cost management
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-7 bg-navy-900/40 border border-white/5"
              >
                <h3 className="font-display font-semibold text-lg text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{uc.description}</p>
                <div className="rounded-lg bg-navy-950/60 border border-white/5 px-4 py-3">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Example Rule</p>
                  <p className="text-xs text-cyan-300 font-mono leading-relaxed">{uc.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-6">
              Stop fighting with tags.{' '}
              <span className="text-gradient">Start unifying.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Create your first AiTag in under 5 minutes. No resource modifications,
              no deployment risk, no waiting for teams to comply. Just instant cost clarity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
              >
                Start Free Trial
              </a>
              <Link
                href="/products/finops"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300"
              >
                Explore All FinOps Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
