'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Cost Explorer',
    href: '/products/finops/cost-explorer',
    description:
      'Interactive dashboards that break down spend by service, account, region, and tag. Drill into any cost anomaly in seconds.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'AI Recommendations',
    href: '/products/finops/ai-recommendations',
    description:
      'Machine learning analyzes your usage patterns and surfaces actionable savings — reserved instances, spot opportunities, and right-sizing suggestions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Anomaly Detection',
    href: '/products/finops/anomaly-detection',
    description:
      'Get alerted the moment spend deviates from normal patterns. Catch runaway resources, accidental deployments, and billing surprises before they escalate.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Right-Sizing',
    href: '/products/finops/right-sizing',
    description:
      'Identify over-provisioned EC2 instances, RDS databases, and containers. Get specific resize recommendations backed by 30 days of utilization data.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: 'Savings Forecasting',
    href: '/products/finops/savings-forecasting',
    description:
      'Project future cloud costs based on current trends. Model the impact of optimization actions before committing to changes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Resource Inventory',
    href: '/products/finops/resource-inventory',
    description:
      'Complete visibility into every cloud resource across all accounts. Tag compliance tracking, orphaned resource detection, and asset lifecycle management.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: 'Shared Cost Allocation',
    href: '/products/finops/cost-allocation',
    description:
      'Split shared cloud costs across teams and departments using telemetry-based metrics or custom percentage rules.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
  },
  {
    title: 'AiTags',
    href: '/products/finops/aitags',
    description:
      'Unify cloud tagging across AWS, GCP, and Azure with rule-based virtual tags. Create custom cost dimensions without modifying resources.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect',
    description:
      'Link your AWS, GCP, or Azure accounts in minutes using our secure CloudFormation or Terraform templates. Read-only access only — we never modify your infrastructure.',
  },
  {
    number: '02',
    title: 'Scan',
    description:
      'CloudDory automatically inventories your resources, analyzes usage patterns, and maps cost allocation across services, teams, and environments.',
  },
  {
    number: '03',
    title: 'Optimize',
    description:
      'Receive prioritized, dollar-value recommendations. Implement savings with one click or export to your workflow tools. Track realized savings over time.',
  },
];

export default function FinOpsContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
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
            FinOps & Cost Optimization
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Take Control of Your{' '}
            <span className="text-gradient">Cloud Spend</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Most organizations waste 30% or more of their cloud budget. CloudDory uses AI to
            surface hidden costs, recommend optimizations, and forecast savings across AWS, GCP,
            and Azure — so every dollar works harder.
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
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300"
            >
              Back to Overview
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '35%', label: 'Average savings found' },
              { value: '<5 min', label: 'To connect your first account' },
              { value: '$2.1M+', label: 'Saved for customers this quarter' },
              { value: '3 Clouds', label: 'AWS, GCP, Azure supported' },
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

      {/* Features Grid */}
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
              Everything you need for{' '}
              <span className="text-gradient">cloud cost control</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              From granular spend breakdowns to AI-driven savings recommendations, CloudDory gives you
              complete financial visibility across your multi-cloud environment.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300 h-full"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <span className="text-xs text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more &rarr;
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
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
              Start saving in{' '}
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
              Stop overpaying for cloud.{' '}
              <span className="text-gradient">Start today.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Join hundreds of engineering teams who have already reclaimed thousands in wasted
              cloud spend. Free and open source. Self-host or use our hosted demo.
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
