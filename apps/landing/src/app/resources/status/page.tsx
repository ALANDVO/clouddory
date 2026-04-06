'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  { name: 'Dashboard', status: 'operational', description: 'Web application and user interface' },
  { name: 'API', status: 'operational', description: 'REST API endpoints' },
  { name: 'Cost Sync', status: 'operational', description: 'Cloud cost data ingestion pipeline' },
  { name: 'CVE Feed', status: 'operational', description: 'NVD and CISA KEV vulnerability feeds' },
  { name: 'DoryAI', status: 'operational', description: 'AI-powered assistant and recommendations' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  operational: { label: 'Operational', color: 'text-green-400', bg: 'bg-green-500/10', dot: 'bg-green-400' },
  degraded: { label: 'Degraded', color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  outage: { label: 'Outage', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
};

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Resources
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              System Status
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Real-time status of CloudDory services and infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Current Status */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            {/* Overall Status Banner */}
            <div className={`rounded-2xl p-7 lg:p-8 border mb-10 text-center ${
              allOperational
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-yellow-500/5 border-yellow-500/20'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${allOperational ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                <h2 className={`font-display font-bold text-2xl ${allOperational ? 'text-green-400' : 'text-yellow-400'}`}>
                  {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                </h2>
              </div>
              <p className="text-sm text-slate-400">
                Last checked: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {services.map((service, i) => {
                const config = statusConfig[service.status];
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center justify-between rounded-xl p-5 bg-navy-900/40 border border-white/5"
                  >
                    <div>
                      <h3 className="font-display font-semibold text-white text-base">{service.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Uptime */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 rounded-2xl p-7 bg-navy-900/40 border border-white/5 text-center"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">90-Day Uptime</p>
              <p className="font-display font-extrabold text-5xl text-white">
                99.99<span className="text-cyan-400">%</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Subscribe to status updates
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Get notified when there are incidents or scheduled maintenance.
            </p>
            <form
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 px-4 py-3 rounded-xl bg-navy-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
              />
              <button
                type="submit"
                className="btn-glow px-6 py-3 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-sm hover:bg-cyan-400 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
