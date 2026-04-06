'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Trend-Based Forecasting',
    description:
      'CloudDory analyzes 90 days of historical spend patterns, factoring in growth rates, seasonal cycles, and recent changes to project costs 30, 60, and 90 days out.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'What-If Modeling',
    description:
      'Model the financial impact of optimization actions before committing. See how implementing right-sizing, reserved instances, or spot adoption shifts your cost trajectory.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Budget Alerts',
    description:
      'Set monthly or quarterly budgets per account, team, or service. Get alerted at 50%, 80%, and 100% thresholds — with projected overage warnings days in advance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    title: 'ROI Tracking',
    description:
      'Track the real-dollar impact of every optimization you implement. CloudDory measures actual savings against projections, so you can prove FinOps ROI to leadership.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const relatedFeatures = [
  { title: 'Cost Explorer', href: '/products/finops/cost-explorer' },
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
  { title: 'Anomaly Detection', href: '/products/finops/anomaly-detection' },
];

export default function SavingsForecastingContent() {
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
            <span className="text-slate-300">Savings Forecasting</span>
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
            Savings Forecasting
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Know What Your Cloud{' '}
            <span className="text-gradient">Will Cost Tomorrow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Stop budgeting in the dark. CloudDory projects your cloud spend 30, 60, and 90 days
            out — and shows you exactly how much you&apos;ll save by implementing each optimization.
            Plan with confidence, not guesswork.
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
              See Your Forecast
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/forecasting</span>
              </div>

              <div className="p-6">
                {/* Projection summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Current Monthly</div>
                    <div className="text-xl font-display font-bold text-white">$47,832</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">30-Day Projection</div>
                    <div className="text-xl font-display font-bold text-rose-400">$52,108</div>
                    <div className="text-[10px] text-rose-400 mt-0.5">+8.9% growth</div>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="text-xs text-slate-500 mb-1">Optimized Projection</div>
                    <div className="text-xl font-display font-bold text-emerald-400">$36,240</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">-24.2% with changes</div>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="text-xs text-slate-500 mb-1">Projected Savings</div>
                    <div className="text-xl font-display font-bold text-emerald-400">$15,868</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">over next 30 days</div>
                  </div>
                </div>

                {/* Forecast chart (CSS-only) */}
                <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-medium">90-Day Cost Projection</span>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" />Historical</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />Current Trajectory</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Optimized</span>
                    </div>
                  </div>
                  <div className="relative h-36">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-600 pr-2">
                      <span>$60k</span>
                      <span>$45k</span>
                      <span>$30k</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-8 h-full flex items-end gap-[2px]">
                      {/* Historical (12 bars) */}
                      {[62, 60, 64, 63, 65, 62, 67, 66, 70, 72, 75, 78].map((v, i) => (
                        <div key={`h-${i}`} className="flex-1 rounded-t-sm bg-slate-600/40" style={{ height: `${v}%` }} />
                      ))}
                      {/* Divider */}
                      <div className="w-px bg-white/20 h-full mx-0.5" />
                      {/* Current trajectory (6 bars) */}
                      {[80, 82, 84, 86, 88, 90].map((v, i) => (
                        <div key={`c-${i}`} className="flex-1 rounded-t-sm bg-rose-500/30 border-t-2 border-rose-500/50" style={{ height: `${v}%` }} />
                      ))}
                      {/* Optimized trajectory overlay */}
                      {[72, 68, 64, 60, 58, 56].map((v, i) => (
                        <div key={`o-${i}`} className="flex-1 rounded-t-sm bg-emerald-500/30 border-t-2 border-emerald-500/50 -ml-[calc(100%/18+2px)]" style={{ height: `${v}%`, marginLeft: i === 0 ? undefined : undefined }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 ml-8 text-[10px] text-slate-600">
                    <span>3 months ago</span>
                    <span>Today</span>
                    <span>+30 days</span>
                    <span>+90 days</span>
                  </div>
                </div>

                {/* Savings breakdown */}
                <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 text-xs text-slate-400 font-medium">
                    Savings Breakdown by Action
                  </div>
                  <table className="w-full text-xs">
                    <tbody className="text-slate-300">
                      {[
                        { action: 'Right-size 12 EC2 instances', monthly: '$3,420', quarterly: '$10,260', status: 'Ready' },
                        { action: 'Convert 4 workloads to Reserved', monthly: '$2,840', quarterly: '$8,520', status: 'Ready' },
                        { action: 'Migrate batch jobs to Spot', monthly: '$2,160', quarterly: '$6,480', status: 'Review' },
                        { action: 'Delete 18 unused resources', monthly: '$680', quarterly: '$2,040', status: 'Ready' },
                        { action: 'Optimize S3 storage tiers', monthly: '$420', quarterly: '$1,260', status: 'Review' },
                      ].map((row) => (
                        <tr key={row.action} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-white">{row.action}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-medium">{row.monthly}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{row.quarterly}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              row.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>{row.status}</span>
                          </td>
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
              Predict, plan, and{' '}
              <span className="text-gradient">prove ROI</span>
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
              Plan with confidence —{' '}
              <span className="text-gradient">forecasts accurate to within 5%</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Finance teams need predictability. Engineering teams need flexibility. CloudDory&apos;s
              forecasting gives both — accurate projections that account for growth, optimization
              actions, and seasonal patterns.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '95%', label: 'Forecast accuracy (30-day)' },
                { value: '$15k+', label: 'Avg projected quarterly savings' },
                { value: '3 days', label: 'Early warning before budget overage' },
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
              Stop guessing what cloud will cost.{' '}
              <span className="text-gradient">Start forecasting.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Get your 90-day forecast within minutes of connecting.
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
