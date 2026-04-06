'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Cross-Cloud Discovery',
    description:
      'Automatically discover and catalog every resource across AWS, GCP, and Azure — EC2 instances, RDS databases, S3 buckets, GCE VMs, Cloud SQL, and 200+ resource types.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: 'Tag Compliance Tracking',
    description:
      'Define tag policies (cost-center, environment, owner) and track compliance in real time. Identify untagged resources costing you money and breaking your allocation model.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: 'Orphaned Resource Detection',
    description:
      'Find EBS volumes with no instance, Elastic IPs with no target, snapshots with no volume, and load balancers with no targets. These ghost resources silently drain your budget.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Asset Lifecycle Management',
    description:
      'Track when resources were created, who created them, their current state, and when they should be retired. Set lifecycle policies to auto-flag stale resources.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
];

const resources = [
  {
    name: 'prod-api-server-01',
    provider: 'AWS',
    providerColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    type: 'EC2 / m5.xlarge',
    region: 'us-east-1',
    utilization: 67,
    tags: 4,
    maxTags: 4,
    status: 'Active',
    idle: false,
  },
  {
    name: 'analytics-db-replica',
    provider: 'AWS',
    providerColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    type: 'RDS / db.r5.large',
    region: 'us-east-1',
    utilization: 12,
    tags: 3,
    maxTags: 4,
    status: 'Active',
    idle: true,
  },
  {
    name: 'gce-web-frontend-03',
    provider: 'GCP',
    providerColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    type: 'Compute / n2-standard-4',
    region: 'us-central1',
    utilization: 45,
    tags: 2,
    maxTags: 4,
    status: 'Active',
    idle: false,
  },
  {
    name: 'vol-0f8a2e1b3c4d5',
    provider: 'AWS',
    providerColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    type: 'EBS / gp3 / 200GB',
    region: 'eu-west-1',
    utilization: 0,
    tags: 0,
    maxTags: 4,
    status: 'Orphaned',
    idle: true,
  },
  {
    name: 'staging-aks-cluster',
    provider: 'Azure',
    providerColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    type: 'AKS / Standard_D4s_v3 x 3',
    region: 'eastus',
    utilization: 8,
    tags: 4,
    maxTags: 4,
    status: 'Active',
    idle: true,
  },
  {
    name: 'eip-198.51.100.42',
    provider: 'AWS',
    providerColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    type: 'Elastic IP',
    region: 'us-west-2',
    utilization: 0,
    tags: 1,
    maxTags: 4,
    status: 'Orphaned',
    idle: true,
  },
];

const relatedFeatures = [
  { title: 'Right-Sizing Engine', href: '/products/finops/right-sizing' },
  { title: 'Cost Explorer', href: '/products/finops/cost-explorer' },
  { title: 'AI Recommendations', href: '/products/finops/ai-recommendations' },
];

export default function ResourceInventoryContent() {
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
            <span className="text-slate-300">Resource Inventory</span>
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
            Resource Inventory
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-white leading-[1.08]"
          >
            Every Resource, Every Account,{' '}
            <span className="text-gradient">One View</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            You can&apos;t optimize what you can&apos;t see. CloudDory automatically discovers and catalogs
            every resource across your multi-cloud environment — including the orphaned volumes,
            idle instances, and untagged assets that silently drain your budget.
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
              Discover Your Resources
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
                <span className="text-xs text-slate-500 ml-2">dashboard.clouddory.com/inventory</span>
              </div>

              <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Total Resources</div>
                    <div className="text-2xl font-display font-bold text-white">1,247</div>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="text-xs text-slate-500 mb-1">Idle / Low Usage</div>
                    <div className="text-2xl font-display font-bold text-amber-400">183</div>
                  </div>
                  <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <div className="text-xs text-slate-500 mb-1">Orphaned</div>
                    <div className="text-2xl font-display font-bold text-rose-400">34</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-500 mb-1">Tag Compliance</div>
                    <div className="text-2xl font-display font-bold text-white">72%</div>
                  </div>
                </div>

                {/* Resource table */}
                <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500">
                        <th className="text-left px-4 py-3 font-medium">Resource</th>
                        <th className="text-left px-4 py-3 font-medium">Provider</th>
                        <th className="text-left px-4 py-3 font-medium">Region</th>
                        <th className="text-left px-4 py-3 font-medium">Utilization</th>
                        <th className="text-left px-4 py-3 font-medium">Tags</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {resources.map((r) => (
                        <tr key={r.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{r.name}</div>
                            <div className="text-[10px] text-slate-600">{r.type}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${r.providerColor}`}>
                              {r.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{r.region}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden max-w-[80px]">
                                <div
                                  className={`h-full rounded-full ${
                                    r.utilization >= 50 ? 'bg-emerald-500/60' :
                                    r.utilization >= 20 ? 'bg-amber-500/60' :
                                    'bg-rose-500/60'
                                  }`}
                                  style={{ width: `${Math.max(r.utilization, 2)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 w-6">{r.utilization}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: r.maxTags }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-4 rounded-sm ${
                                    i < r.tags ? 'bg-emerald-500/40' : 'bg-rose-500/20'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-slate-600 ml-1">{r.tags}/{r.maxTags}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {r.status === 'Orphaned' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400">Orphaned</span>
                            ) : r.idle ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">Idle</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Active</span>
                            )}
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
              Complete visibility,{' '}
              <span className="text-gradient">zero blind spots</span>
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
              Discover an average of 15% more resources{' '}
              <span className="text-gradient">than customers knew they had</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Shadow IT, forgotten dev environments, orphaned storage, and untagged resources
              accumulate over time. CloudDory surfaces everything — so you can decide what
              stays, what goes, and what needs a tag.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { value: '15%', label: 'More resources discovered vs expected' },
                { value: '200+', label: 'Resource types cataloged' },
                { value: '100%', label: 'Tag policy compliance achievable' },
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
              You have more cloud resources than you think.{' '}
              <span className="text-gradient">Find them all.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Connect your cloud accounts and see your complete resource inventory in minutes.
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
