'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const benefits = [
  {
    title: 'Fair Attribution',
    description:
      'Every team pays their proportional share based on real data — no more guesswork, no more blame games.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
      </svg>
    ),
  },
  {
    title: 'FinOps Maturity',
    description:
      'Move from basic showback to precise chargeback. Demonstrate cost ownership across your organization.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Audit-Ready',
    description:
      'Complete allocation history for compliance and financial reporting. Every split is timestamped and traceable.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Automated Updates',
    description:
      'Allocations recalculate daily as usage patterns change. No manual spreadsheet updates needed.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: 'Define Shared Cost Sources',
    description:
      'Select the cloud services and resources that are shared across teams. Apply filters by account, tag, or resource group to scope exactly which costs to allocate.',
  },
  {
    number: '02',
    title: 'Choose Allocation Method',
    description:
      'Pick telemetry-based allocation for usage-driven splits, or custom percentage allocation for business-agreed distributions. Mix methods across different cost pools.',
  },
  {
    number: '03',
    title: 'View Results & Share',
    description:
      'See real-time allocation breakdowns by team. Export reports, schedule automated email summaries, and share dashboards with stakeholders for full transparency.',
  },
];

const relatedFeatures = [
  { title: 'Cost Explorer', href: '/products/finops/cost-explorer' },
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
  { title: 'Anomaly Detection', href: '/products/finops/anomaly-detection' },
  { title: 'Right-Sizing', href: '/products/finops/right-sizing' },
  { title: 'Resource Inventory', href: '/products/finops/resource-inventory' },
];

const integrations = ['Datadog', 'Prometheus', 'CloudWatch', 'Grafana', 'Snowflake'];

export default function CostAllocationContent() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="relative pt-24 lg:pt-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products/finops" className="hover:text-cyan-400 transition-colors">FinOps</Link>
            <span>/</span>
            <span className="text-slate-300">Cost Allocation</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-8 pb-20 lg:pt-12 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-medium tracking-wide uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            FinOps &amp; Cost Optimization
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Split Shared Costs,{' '}
            <span className="text-gradient">Fairly and Automatically</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Shared Kubernetes clusters, databases, and networking shouldn&apos;t be a black box.
            CloudDory allocates shared costs across teams using real usage data or custom rules
            — so every team knows exactly what they&apos;re paying for.
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
              Start Saving Today
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
            {[
              { value: '100%', label: 'Of shared costs allocated' },
              { value: '2', label: 'Allocation methods' },
              { value: 'Real-time', label: 'Telemetry integration' },
              { value: 'Audit-ready', label: 'Reports included' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="font-display font-extrabold text-3xl lg:text-4xl text-cyan-400">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Methods Section */}
      <section className="relative py-24 lg:py-32">
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
              Two Approaches
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Choose how to{' '}
              <span className="text-gradient">split the bill</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              Different cost pools need different allocation strategies. CloudDory supports both
              data-driven and manual approaches — and you can mix them.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Telemetry-Based */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-cyan-500/10 text-cyan-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-2">
                Telemetry-Based Allocation
              </h3>
              <p className="text-sm text-cyan-400 font-medium mb-4">
                Split costs based on actual usage metrics
              </p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Connect your observability stack (Datadog, Prometheus, CloudWatch) and let real
                usage data drive cost distribution. Each team pays proportionally to their actual
                resource consumption.
              </p>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-medium mb-3">
                  Best for
                </h4>
                <ul className="space-y-2">
                  {[
                    'Shared Kubernetes clusters',
                    'Multi-tenant databases',
                    'Shared networking / CDN',
                    'Cross-team compute pools',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  &ldquo;Like splitting a restaurant bill based on what each person actually ordered
                  — fair, transparent, and data-driven.&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Custom Percentage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-cyan-500/10 text-cyan-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-2">
                Custom Percentage Allocation
              </h3>
              <p className="text-sm text-cyan-400 font-medium mb-4">
                Manually assign percentage splits across teams
              </p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Define custom allocation rules with fixed percentages. Perfect for costs where
                usage tracking isn&apos;t practical or where business agreements determine the split.
              </p>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-medium mb-3">
                  Best for
                </h4>
                <ul className="space-y-2">
                  {[
                    'Corporate IT overhead',
                    'Shared security tools',
                    'Platform team costs',
                    'Management-decided allocations',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  &ldquo;Like splitting rent based on office space used — straightforward agreements
                  that everyone understands.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Mockup */}
      <section className="relative pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Dashboard Preview
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Transparent allocation,{' '}
              <span className="text-gradient">at a glance</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-xl border border-white/10 bg-navy-900/80 overflow-hidden shadow-2xl shadow-black/40">
              {/* Top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-navy-900">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/cost-allocation</span>
              </div>

              <div className="p-6">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Shared Cost Pool</div>
                    <div className="text-lg font-display font-bold text-white">Production K8s Cluster — March 2026</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
                      Telemetry-Based
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                      Export CSV
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-6">
                  <div className="text-xs text-slate-500 mb-1">Total Shared Cost</div>
                  <div className="text-3xl font-display font-bold text-white">$12,000</div>
                  <div className="text-xs text-slate-500 mt-1">Allocated across 3 teams</div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Allocation table */}
                  <div className="md:col-span-2 rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500">
                          <th className="text-left px-4 py-3 font-medium">Team</th>
                          <th className="text-right px-4 py-3 font-medium">Allocated %</th>
                          <th className="text-right px-4 py-3 font-medium">Monthly Cost</th>
                          <th className="text-right px-4 py-3 font-medium">Source</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {[
                          { team: 'Platform Engineering', pct: '35%', cost: '$4,200', source: 'Telemetry', color: 'bg-cyan-500' },
                          { team: 'Product Team', pct: '40%', cost: '$4,800', source: 'Telemetry', color: 'bg-violet-500' },
                          { team: 'Data Science', pct: '25%', cost: '$3,000', source: 'Telemetry', color: 'bg-amber-500' },
                        ].map((row) => (
                          <tr key={row.team} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`} />
                              {row.team}
                            </td>
                            <td className="text-right px-4 py-3">{row.pct}</td>
                            <td className="text-right px-4 py-3 text-cyan-400 font-medium">{row.cost}</td>
                            <td className="text-right px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px]">
                                {row.source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pie chart (CSS-only) */}
                  <div className="rounded-lg bg-white/[0.02] border border-white/5 p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-slate-500 mb-4 font-medium">Distribution</div>
                    <div
                      className="w-32 h-32 rounded-full mb-4"
                      style={{
                        background: 'conic-gradient(#06b6d4 0% 35%, #8b5cf6 35% 75%, #f59e0b 75% 100%)',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-navy-900" />
                      </div>
                    </div>
                    <div className="space-y-2 w-full">
                      {[
                        { label: 'Platform Eng.', pct: '35%', color: 'bg-cyan-500' },
                        { label: 'Product', pct: '40%', color: 'bg-violet-500' },
                        { label: 'Data Science', pct: '25%', color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            {item.label}
                          </span>
                          <span className="text-slate-300">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
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
              Allocate costs in{' '}
              <span className="text-gradient">three steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="font-display font-extrabold text-6xl text-cyan-500/10 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display font-semibold text-xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-12 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-[150px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Benefits
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Why teams choose{' '}
              <span className="text-gradient">CloudDory for allocation</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors duration-300">
                  {benefit.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium mb-8">
              Works with your observability stack
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {integrations.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="px-6 py-3 rounded-xl bg-navy-900/40 border border-white/5 text-sm text-slate-400 font-medium hover:border-cyan-500/20 hover:text-cyan-400 transition-all duration-300"
                >
                  {name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Features */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium mb-6">Related Features</h3>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedFeatures.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group p-5 rounded-xl bg-navy-900/40 border border-white/5 hover:border-cyan-500/20 transition-all duration-300"
              >
                <span className="text-white font-display font-semibold group-hover:text-cyan-400 transition-colors text-sm">{f.title}</span>
                <span className="block text-xs text-slate-500 mt-1">Learn more &rarr;</span>
              </Link>
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
              Stop arguing about shared costs.{' '}
              <span className="text-gradient">Start allocating them.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Connect your cloud accounts and observability tools in minutes. See fair, transparent
              cost allocation across every team. 14-day free trial, no credit card required.
            </p>
            <a
              href="https://dashboard.clouddory.com/register"
              className="btn-glow inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
            >
              Start Free Trial
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
