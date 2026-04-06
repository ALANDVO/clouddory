'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'EC2, RDS & Container Analysis',
    description:
      'Right-sizing isn&apos;t limited to EC2. CloudDory analyzes RDS instances, ECS/EKS containers, and GCP Compute Engine VMs to find waste across every compute layer.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    title: '30-Day Utilization Data',
    description:
      'Recommendations are backed by a full month of CPU, memory, network, and disk IOPS metrics. No guesswork — every suggestion comes with the data to prove it.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Safe Downgrade Paths',
    description:
      'CloudDory considers burstable vs sustained workloads, memory-bound vs CPU-bound profiles, and peak utilization headroom. It only recommends changes that won&apos;t hurt performance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'One-Click Implementation',
    description:
      'Approve a recommendation and CloudDory generates the exact CLI command, Terraform change, or CloudFormation update. For supported resources, apply changes directly from the dashboard.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
  },
];

const resources = [
  {
    name: 'prod-api-server-01',
    type: 'EC2',
    current: 'm5.4xlarge',
    recommended: 'm5.xlarge',
    cpu: 11,
    memory: 18,
    savings: '$648/mo',
    confidence: '97%',
  },
  {
    name: 'staging-db-primary',
    type: 'RDS',
    current: 'db.r5.2xlarge',
    recommended: 'db.r5.large',
    cpu: 8,
    memory: 23,
    savings: '$520/mo',
    confidence: '95%',
  },
  {
    name: 'analytics-worker-03',
    type: 'EC2',
    current: 'c5.9xlarge',
    recommended: 'c5.2xlarge',
    cpu: 22,
    memory: 15,
    savings: '$1,104/mo',
    confidence: '93%',
  },
  {
    name: 'dev-cache-cluster',
    type: 'ElastiCache',
    current: 'cache.r5.xlarge',
    recommended: 'cache.r5.large',
    cpu: 6,
    memory: 31,
    savings: '$187/mo',
    confidence: '98%',
  },
  {
    name: 'batch-processor-fleet',
    type: 'EC2',
    current: 'm5.2xlarge x 6',
    recommended: 'm5.xlarge x 4',
    cpu: 14,
    memory: 19,
    savings: '$936/mo',
    confidence: '91%',
  },
];

const relatedFeatures = [
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
  { title: 'Resource Inventory', href: '/products/finops/resource-inventory' },
  { title: 'Savings Forecasting', href: '/products/finops/savings-forecasting' },
];

export default function RightSizingContent() {
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
            <span className="text-slate-300">Right-Sizing</span>
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
            Right-Sizing Engine
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Stop Paying for Resources{' '}
            <span className="text-gradient">You Don&apos;t Use</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Most cloud instances are provisioned for peak load that rarely comes. CloudDory
            analyzes 30 days of CPU, memory, and network data to find instances running at
            10-20% utilization — and tells you exactly what to downsize to.
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
              Find Oversized Resources
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/right-sizing</span>
              </div>

              <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="text-xs text-slate-500 mb-1">Total Savings Available</div>
                    <div className="text-2xl font-display font-bold text-emerald-400">$3,395/mo</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Oversized Resources</div>
                    <div className="text-2xl font-display font-bold text-white">38</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Avg Utilization</div>
                    <div className="text-2xl font-display font-bold text-amber-400">16%</div>
                  </div>
                </div>

                {/* Resource table */}
                <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500">
                        <th className="text-left px-4 py-3 font-medium">Resource</th>
                        <th className="text-left px-4 py-3 font-medium">Current</th>
                        <th className="text-left px-4 py-3 font-medium">Recommended</th>
                        <th className="text-left px-4 py-3 font-medium">CPU / Memory</th>
                        <th className="text-right px-4 py-3 font-medium">Savings</th>
                        <th className="text-right px-4 py-3 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {resources.map((r) => (
                        <tr key={r.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{r.name}</div>
                            <div className="text-[10px] text-slate-600">{r.type}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{r.current}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-medium">{r.recommended}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-600 w-8">CPU</span>
                                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div className="h-full rounded-full bg-cyan-500/60" style={{ width: `${r.cpu}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-500 w-6 text-right">{r.cpu}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-600 w-8">Mem</span>
                                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div className="h-full rounded-full bg-violet-500/60" style={{ width: `${r.memory}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-500 w-6 text-right">{r.memory}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-right px-4 py-3 font-medium text-emerald-400">{r.savings}</td>
                          <td className="text-right px-4 py-3 text-slate-500">{r.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              Capabilities
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Data-driven downsizing,{' '}
              <span className="text-gradient">zero risk</span>
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
              Typical right-sizing saves{' '}
              <span className="text-gradient">25-40% on compute costs</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Compute is the largest line item on most cloud bills. When 70% of instances
              are running below 20% utilization, right-sizing delivers the highest-impact
              savings with the lowest effort.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '25-40%', label: 'Compute cost reduction' },
                { value: '70%', label: 'Of instances are oversized' },
                { value: '0', label: 'Performance incidents from our recommendations' },
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
              Your instances are bigger than they need to be.{' '}
              <span className="text-gradient">Prove it in 5 minutes.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Connect your cloud accounts and see exactly which resources are oversized.
              Free and open source. Self-host or use our hosted demo.
            </p>
            <a
              href="https://dashboard.clouddory.com/register"
              className="btn-glow inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
            >
              Get Started Free
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
