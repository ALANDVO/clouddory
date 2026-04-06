'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const endpoints = [
  {
    method: 'GET',
    path: '/api/spend',
    description: 'Retrieve cost and usage data for a given time range, grouped by service, account, region, or tag.',
    params: 'start_date, end_date, group_by, connector_id',
    example: `curl -X GET "https://dashboard.clouddory.com/api/spend?start_date=2026-03-01&end_date=2026-03-30&group_by=service" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
  {
    method: 'GET',
    path: '/api/connectors',
    description: 'List all connected cloud accounts with their sync status, provider type, and last sync timestamp.',
    params: 'status, provider',
    example: `curl -X GET "https://dashboard.clouddory.com/api/connectors" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
  {
    method: 'GET',
    path: '/api/cves',
    description: 'Retrieve CVE vulnerability data from NVD and CISA KEV feeds, filtered by severity, date, or keyword.',
    params: 'severity, date_from, keyword, page, limit',
    example: `curl -X GET "https://dashboard.clouddory.com/api/cves?severity=critical&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
  {
    method: 'POST',
    path: '/api/dory-ai/query',
    description: 'Send a natural language query to DoryAI and receive an AI-generated response with cost insights.',
    params: 'query, context (optional)',
    example: `curl -X POST "https://dashboard.clouddory.com/api/dory-ai/query" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What are my top 3 cost drivers this month?"}'`,
  },
];

export default function APIPage() {
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
              CloudDory{' '}
              <span className="text-gradient">API</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Programmatic access to your cloud cost data, connectors, security feeds, and DoryAI. Build custom integrations and workflows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Base URL & Auth */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl p-7 bg-navy-900/40 border border-white/5"
            >
              <h3 className="font-display font-semibold text-lg text-white mb-3">Base URL</h3>
              <code className="block px-4 py-3 rounded-lg bg-navy-950/80 border border-white/5 text-cyan-400 text-sm font-mono">
                https://dashboard.clouddory.com/api
              </code>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-2xl p-7 bg-navy-900/40 border border-white/5"
            >
              <h3 className="font-display font-semibold text-lg text-white mb-3">Authentication</h3>
              <p className="text-sm text-slate-400 mb-3">Bearer token via API key from Settings.</p>
              <code className="block px-4 py-3 rounded-lg bg-navy-950/80 border border-white/5 text-cyan-400 text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Endpoints
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Key API endpoints
            </h2>
          </motion.div>

          <div className="space-y-8">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                    ep.method === 'GET' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-white font-mono text-sm">{ep.path}</code>
                </div>
                <p className="text-sm text-slate-400 mb-3">{ep.description}</p>
                <p className="text-xs text-slate-500 mb-4">
                  <span className="text-slate-400 font-medium">Parameters:</span> {ep.params}
                </p>
                <div className="rounded-lg bg-navy-950/80 border border-white/5 p-4 overflow-x-auto">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre">{ep.example}</pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5"
          >
            <h3 className="font-display font-semibold text-xl text-white mb-4">Rate Limits</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Standard plan</span>
                <span className="text-slate-300 font-medium">100 requests/min</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Pro plan</span>
                <span className="text-slate-300 font-medium">500 requests/min</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Enterprise plan</span>
                <span className="text-slate-300 font-medium">Custom</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Rate limit headers are included in every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Generate{' '}
              <span className="text-gradient">API Key</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Create your API key from the dashboard Settings page and start building integrations.
            </p>
            <div className="mt-10">
              <a
                href="https://dashboard.clouddory.com/settings"
                className="btn-glow group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                Generate API Key
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
