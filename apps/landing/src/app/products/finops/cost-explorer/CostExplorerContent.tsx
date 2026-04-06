'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Multi-Cloud Visibility',
    description:
      'Aggregate costs from AWS, GCP, and Azure into a single unified view. No more switching between billing consoles or reconciling spreadsheets from different providers.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    title: 'Group by Any Dimension',
    description:
      'Slice and dice costs by service, account, region, availability zone, tag, resource ID, or any custom dimension. Find the exact source of every dollar spent.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
      </svg>
    ),
  },
  {
    title: 'Date Range Flexibility',
    description:
      'Compare costs across custom date ranges — week-over-week, month-over-month, or year-over-year. Identify trends, seasonal patterns, and growth trajectories at a glance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'CSV & API Export',
    description:
      'Export any view as CSV or pull data via our REST API. Feed cost data into your existing BI tools, Slack bots, or internal dashboards without friction.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

const relatedFeatures = [
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
  { title: 'Anomaly Detection', href: '/products/finops/anomaly-detection' },
  { title: 'Savings Forecasting', href: '/products/finops/savings-forecasting' },
];

export default function CostExplorerContent() {
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
            <span className="text-slate-300">Cost Explorer</span>
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
            Cost Explorer
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            See Every Dollar Your{' '}
            <span className="text-gradient">Cloud Spends</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Your cloud bill is a black box until you can break it open. CloudDory&apos;s Cost Explorer
            gives you interactive, multi-dimensional breakdowns of every cent across AWS, GCP, and Azure
            — so you always know where money is going and why.
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
              Start Exploring Free
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/cost-explorer</span>
              </div>

              <div className="p-6">
                {/* Filters row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400" /> AWS
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                    Group by: Service
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                    Last 30 Days
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <div className="ml-auto px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 cursor-pointer">
                    Export CSV
                  </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Total Spend</div>
                    <div className="text-2xl font-display font-bold text-white">$47,832</div>
                    <div className="text-xs text-rose-400 mt-1">+12% vs last month</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Daily Average</div>
                    <div className="text-2xl font-display font-bold text-white">$1,594</div>
                    <div className="text-xs text-slate-500 mt-1">30-day rolling</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Projected Month</div>
                    <div className="text-2xl font-display font-bold text-white">$52,108</div>
                    <div className="text-xs text-amber-400 mt-1">Over budget by $4,108</div>
                  </div>
                </div>

                {/* Stacked area chart (CSS-only) */}
                <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-medium">Daily Cost Breakdown</span>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" />EC2</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />RDS</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />S3</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Lambda</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-32">
                    {[
                      [58, 18, 12, 12], [55, 20, 13, 12], [60, 17, 11, 12], [62, 16, 12, 10],
                      [57, 19, 13, 11], [53, 22, 14, 11], [59, 18, 12, 11], [65, 15, 11, 9],
                      [63, 17, 11, 9], [60, 19, 12, 9], [58, 20, 13, 9], [56, 21, 14, 9],
                      [61, 17, 12, 10], [64, 16, 11, 9], [67, 14, 10, 9], [62, 18, 11, 9],
                      [59, 19, 12, 10], [57, 20, 13, 10], [55, 22, 14, 9], [58, 19, 13, 10],
                      [63, 17, 11, 9], [66, 15, 10, 9], [70, 14, 9, 7], [68, 15, 10, 7],
                      [65, 16, 11, 8], [62, 18, 12, 8], [60, 19, 12, 9], [58, 20, 13, 9],
                      [61, 18, 12, 9], [64, 16, 11, 9],
                    ].map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col-reverse rounded-t-sm overflow-hidden">
                        <div className="bg-cyan-500/70" style={{ height: `${day[0]}%` }} />
                        <div className="bg-violet-500/70" style={{ height: `${day[1]}%` }} />
                        <div className="bg-amber-500/70" style={{ height: `${day[2]}%` }} />
                        <div className="bg-emerald-500/70" style={{ height: `${day[3]}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                    <span>Feb 14</span>
                    <span>Feb 21</span>
                    <span>Feb 28</span>
                    <span>Mar 7</span>
                    <span>Mar 14</span>
                  </div>
                </div>

                {/* Cost breakdown table */}
                <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500">
                        <th className="text-left px-4 py-3 font-medium">Service</th>
                        <th className="text-right px-4 py-3 font-medium">This Month</th>
                        <th className="text-right px-4 py-3 font-medium">Last Month</th>
                        <th className="text-right px-4 py-3 font-medium">Change</th>
                        <th className="text-right px-4 py-3 font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {[
                        { service: 'Amazon EC2', current: '$28,194', prev: '$24,820', change: '+13.6%', changeColor: 'text-rose-400', pct: '58.9%' },
                        { service: 'Amazon RDS', current: '$8,610', prev: '$8,190', change: '+5.1%', changeColor: 'text-rose-400', pct: '18.0%' },
                        { service: 'Amazon S3', current: '$5,738', prev: '$5,420', change: '+5.9%', changeColor: 'text-rose-400', pct: '12.0%' },
                        { service: 'AWS Lambda', current: '$4,302', prev: '$4,680', change: '-8.1%', changeColor: 'text-emerald-400', pct: '9.0%' },
                        { service: 'Other', current: '$988', prev: '$1,102', change: '-10.3%', changeColor: 'text-emerald-400', pct: '2.1%' },
                      ].map((row) => (
                        <tr key={row.service} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-medium text-white">{row.service}</td>
                          <td className="text-right px-4 py-3">{row.current}</td>
                          <td className="text-right px-4 py-3 text-slate-500">{row.prev}</td>
                          <td className={`text-right px-4 py-3 ${row.changeColor}`}>{row.change}</td>
                          <td className="text-right px-4 py-3 text-slate-500">{row.pct}</td>
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
              Everything you need to{' '}
              <span className="text-gradient">understand your spend</span>
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
              Teams using CloudDory&apos;s Cost Explorer{' '}
              <span className="text-gradient">reduce investigation time by 80%</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Instead of spending hours cross-referencing billing pages across three cloud consoles,
              engineers get instant answers. One search. One dashboard. Every dimension.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '80%', label: 'Faster cost investigation' },
                { value: '100%', label: 'Coverage across all accounts' },
                { value: '< 2 min', label: 'To answer any cost question' },
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
              Your cloud bill has answers.{' '}
              <span className="text-gradient">Start exploring.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Connect your first cloud account in under 5 minutes. See where every dollar goes.
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
