'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Real-Time Monitoring',
    description:
      'CloudDory ingests billing data every hour and compares it against learned baselines. The moment spend deviates beyond normal variance, you know about it.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'AI-Powered Root Cause Analysis',
    description:
      'Don&apos;t just know something spiked — know exactly why. CloudDory traces anomalies to the specific service, resource, region, and even the deployment that caused them.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: 'Slack & Email Alerts',
    description:
      'Route alerts where your team already works. Configure per-channel routing by severity, service, or account. Integrate with PagerDuty, Opsgenie, and webhooks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    title: 'Custom Thresholds',
    description:
      'Set dollar-amount or percentage-based thresholds per service, account, or tag. CloudDory adapts to your tolerance levels — alert on $50 spikes or $5,000 ones.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const anomalyAlerts = [
  {
    time: '14 min ago',
    severity: 'critical',
    title: 'EC2 spend spike in us-east-1',
    expected: '$1,240/day',
    actual: '$3,870/day',
    delta: '+$2,630',
    rootCause: 'Auto-scaling group prod-web-asg launched 47 additional c5.2xlarge instances after failed health checks.',
    status: 'Investigating',
  },
  {
    time: '2 hours ago',
    severity: 'warning',
    title: 'S3 data transfer surge',
    expected: '$85/day',
    actual: '$340/day',
    delta: '+$255',
    rootCause: 'New ETL pipeline copying 2.4TB cross-region from us-east-1 to eu-west-1 daily.',
    status: 'Acknowledged',
  },
  {
    time: '6 hours ago',
    severity: 'info',
    title: 'Lambda invocations above baseline',
    expected: '4.2M/day',
    actual: '6.1M/day',
    delta: '+45%',
    rootCause: 'Marketing campaign spike driving 45% more API Gateway requests to order-processor function.',
    status: 'Resolved',
  },
];

const relatedFeatures = [
  { title: 'Cost Explorer', href: '/products/finops/cost-explorer' },
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
  { title: 'Savings Forecasting', href: '/products/finops/savings-forecasting' },
];

export default function AnomalyDetectionContent() {
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
            <span className="text-slate-300">Anomaly Detection</span>
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
            Anomaly Detection
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Catch Cost Spikes Before{' '}
            <span className="text-gradient">They Become Surprises</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            A runaway auto-scaling group. An accidental cross-region transfer. A forgotten
            GPU instance left running over the weekend. CloudDory detects anomalies as they
            happen — not when the bill arrives 30 days later.
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
              Enable Anomaly Alerts
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/anomalies</span>
              </div>

              <div className="p-6">
                {/* Expected vs Actual bar chart */}
                <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-medium">Daily Spend: Expected vs Actual (Last 14 Days)</span>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" />Expected</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" />Actual</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />Anomaly</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-28">
                    {[
                      { expected: 60, actual: 62, anomaly: false },
                      { expected: 60, actual: 58, anomaly: false },
                      { expected: 61, actual: 63, anomaly: false },
                      { expected: 60, actual: 59, anomaly: false },
                      { expected: 61, actual: 60, anomaly: false },
                      { expected: 60, actual: 64, anomaly: false },
                      { expected: 61, actual: 62, anomaly: false },
                      { expected: 61, actual: 58, anomaly: false },
                      { expected: 60, actual: 61, anomaly: false },
                      { expected: 61, actual: 63, anomaly: false },
                      { expected: 60, actual: 59, anomaly: false },
                      { expected: 61, actual: 95, anomaly: true },
                      { expected: 60, actual: 88, anomaly: true },
                      { expected: 61, actual: 65, anomaly: false },
                    ].map((day, i) => (
                      <div key={i} className="flex-1 flex items-end gap-px">
                        <div
                          className="flex-1 rounded-t-sm bg-slate-700/50"
                          style={{ height: `${day.expected}%` }}
                        />
                        <div
                          className={`flex-1 rounded-t-sm ${day.anomaly ? 'bg-rose-500/70' : 'bg-cyan-500/50'}`}
                          style={{ height: `${day.actual}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                    <span>Mar 1</span>
                    <span>Mar 7</span>
                    <span>Mar 14</span>
                  </div>
                </div>

                {/* Anomaly timeline */}
                <div className="space-y-3">
                  {anomalyAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border transition-colors ${
                        alert.severity === 'critical'
                          ? 'bg-rose-500/[0.03] border-rose-500/20'
                          : alert.severity === 'warning'
                          ? 'bg-amber-500/[0.03] border-amber-500/15'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-500">{alert.time}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${
                          alert.status === 'Investigating' ? 'bg-rose-500/10 text-rose-400' :
                          alert.status === 'Acknowledged' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white mb-2">{alert.title}</div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-[10px] text-slate-600 mb-0.5">Expected</div>
                          <div className="text-xs text-slate-400">{alert.expected}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-600 mb-0.5">Actual</div>
                          <div className="text-xs text-white font-medium">{alert.actual}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-600 mb-0.5">Delta</div>
                          <div className="text-xs text-rose-400 font-medium">{alert.delta}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <span className="text-slate-600">Root cause:</span> {alert.rootCause}
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
              Capabilities
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              From detection to resolution,{' '}
              <span className="text-gradient">in minutes</span>
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
              Detect 95% of cost anomalies{' '}
              <span className="text-gradient">within 15 minutes</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Without anomaly detection, the average surprise cost spike goes unnoticed for
              72 hours. With CloudDory, teams catch and contain issues before they multiply
              into five-figure billing surprises.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '95%', label: 'Anomalies detected automatically' },
                { value: '15 min', label: 'Average detection time' },
                { value: '72x', label: 'Faster than manual discovery' },
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
              Never be blindsided by a bill again.{' '}
              <span className="text-gradient">Start monitoring.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Set up anomaly detection in minutes. Get your first alert before your next coffee.
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
