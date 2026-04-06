'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Right-Sizing Suggestions',
    description:
      'Our AI analyzes CPU, memory, network, and disk utilization over 30+ days to recommend the optimal instance type. Never pay for idle capacity again.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: 'Reserved Instance Opportunities',
    description:
      'Identify workloads with stable, predictable usage that qualify for 1-year or 3-year reserved pricing. CloudDory calculates exact break-even points and ROI.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: 'Spot Instance Candidates',
    description:
      'Pinpoint fault-tolerant workloads — batch jobs, dev/test environments, CI/CD pipelines — that can safely run on spot instances for up to 90% savings.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Unused Resource Detection',
    description:
      'Automatically flag idle load balancers, unattached EBS volumes, orphaned snapshots, and unused Elastic IPs. Stop paying for resources nobody is using.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
];

const recommendations = [
  {
    type: 'Right-Size',
    severity: 'high',
    resource: 'prod-api-server-03',
    resourceType: 'EC2 / m5.2xlarge',
    recommendation: 'Downsize to m5.xlarge',
    savings: '$312/mo',
    confidence: '96%',
    reason: 'Avg CPU: 14% | Avg Memory: 22% over 30 days',
  },
  {
    type: 'Reserved Instance',
    severity: 'high',
    resource: 'prod-rds-primary',
    resourceType: 'RDS / db.r5.2xlarge',
    recommendation: '1-year reserved (All Upfront)',
    savings: '$840/mo',
    confidence: '99%',
    reason: 'Steady 24/7 usage for 11 months. Break-even: 4.2 months.',
  },
  {
    type: 'Unused Resource',
    severity: 'medium',
    resource: 'vol-0a3f8e2b1c9d4',
    resourceType: 'EBS / gp3 / 500GB',
    recommendation: 'Delete unattached volume',
    savings: '$40/mo',
    confidence: '100%',
    reason: 'Unattached for 47 days. No read/write activity detected.',
  },
  {
    type: 'Spot Instance',
    severity: 'medium',
    resource: 'batch-worker-fleet',
    resourceType: 'EC2 / c5.4xlarge x 8',
    recommendation: 'Switch to Spot with fallback',
    savings: '$2,160/mo',
    confidence: '87%',
    reason: 'Fault-tolerant batch workload. Avg spot discount: 68% in us-east-1.',
  },
];

const relatedFeatures = [
  { title: 'Right-Sizing Engine', href: '/products/finops/right-sizing' },
  { title: 'Cost Explorer', href: '/products/finops/cost-explorer' },
  { title: 'Savings Forecasting', href: '/products/finops/savings-forecasting' },
];

export default function AIRecommendationsContent() {
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
            <span className="text-slate-300">AI Recommendations</span>
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
            AI Recommendations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            AI That Finds Money{' '}
            <span className="text-gradient">You&apos;re Wasting</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            CloudDory&apos;s AI engine continuously analyzes your cloud usage patterns across every
            service and account. It surfaces prioritized, dollar-value recommendations you can
            implement in minutes — not weeks.
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
              See Your Savings
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </a>
            <Link
              href="/products/finops"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300"
            >
              All FinOps Features
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Mockup */}
      <section className="relative pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/recommendations</span>
              </div>

              <div className="p-6">
                {/* Summary bar */}
                <div className="flex flex-wrap items-center gap-6 mb-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Total Identified Savings</div>
                    <div className="text-3xl font-display font-bold text-emerald-400">$3,352/mo</div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-white/10" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Recommendations</div>
                    <div className="text-xl font-display font-bold text-white">24 active</div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-white/10" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Avg Confidence</div>
                    <div className="text-xl font-display font-bold text-white">93%</div>
                  </div>
                </div>

                {/* Recommendation cards */}
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          rec.type === 'Right-Size' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                          rec.type === 'Reserved Instance' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          rec.type === 'Spot Instance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {rec.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          rec.severity === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'
                        }`}>
                          {rec.severity === 'high' ? 'High Impact' : 'Medium Impact'}
                        </span>
                        <span className="ml-auto text-lg font-display font-bold text-emerald-400">{rec.savings}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                        <span className="text-sm font-medium text-white">{rec.resource}</span>
                        <span className="text-xs text-slate-500">{rec.resourceType}</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">{rec.recommendation}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-600">{rec.reason}</span>
                        <span className="text-[11px] text-slate-500">Confidence: <span className="text-cyan-400 font-medium">{rec.confidence}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Details */}
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
              How It Works
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Four engines, one{' '}
              <span className="text-gradient">savings pipeline</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Helps */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Results
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-8">
              Average customer implements{' '}
              <span className="text-gradient">$4,200/mo in savings within 30 days</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Our AI doesn&apos;t just find waste — it prioritizes by dollar impact, gives you
              confidence scores, and provides one-click implementation. The savings start
              accumulating from day one.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '$4,200', label: 'Avg monthly savings found in 30 days' },
                { value: '93%', label: 'Average recommendation confidence' },
                { value: '< 5 min', label: 'To implement each recommendation' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-navy-900/40 border border-white/5"
                >
                  <div className="font-display font-extrabold text-3xl text-cyan-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
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
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedFeatures.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group p-5 rounded-xl bg-navy-900/40 border border-white/5 hover:border-cyan-500/20 transition-all duration-300"
              >
                <span className="text-white font-display font-semibold group-hover:text-cyan-400 transition-colors">{f.title}</span>
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
              Your cloud is hiding money.{' '}
              <span className="text-gradient">Let AI find it.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Connect your cloud accounts and get your first recommendations within minutes.
              14-day free trial, no credit card required.
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
