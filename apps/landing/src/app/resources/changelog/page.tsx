'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const entries = [
  {
    date: 'March 2026',
    title: 'CVE Tracking with NVD + CISA KEV Integration',
    type: 'Feature',
    description: 'Real-time vulnerability tracking powered by the National Vulnerability Database and CISA Known Exploited Vulnerabilities catalog. Filter by severity, search by keyword, and track actively exploited CVEs affecting your infrastructure.',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    date: 'March 2026',
    title: 'DoryAI Powered by Gemini with Page-Aware Context',
    type: 'Feature',
    description: 'Conversational AI assistant that understands the page you are viewing and answers questions about your cloud costs, security posture, and optimization opportunities. Powered by Gemini with multi-model fallback.',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    date: 'March 2026',
    title: 'AWS Integration with CloudFormation + CUR Support',
    type: 'Integration',
    description: 'One-click CloudFormation stack for read-only IAM role setup. Full Cost and Usage Report (CUR) ingestion for line-item cost analysis across all AWS services.',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  {
    date: 'March 2026',
    title: 'MegaBill-Style Cost Explorer with 5 Chart Types',
    type: 'Feature',
    description: 'Advanced cost explorer with stacked bar, line, area, pie, and table views. Filter by service, account, region, and tags. Date range picker with daily, weekly, and monthly granularity.',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  {
    date: 'March 2026',
    title: 'AiTags Virtual Tagging Engine',
    type: 'Feature',
    description: 'AI-powered virtual tagging that automatically categorizes untagged cloud resources by team, environment, and project. Works across AWS, GCP, and Azure without modifying your actual cloud tags.',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    date: 'March 2026',
    title: 'Platform Launch — FinOps, Security, Intelligence, SOAR',
    type: 'Launch',
    description: 'CloudDory officially launches with four integrated pillars: FinOps for cost optimization, Security for posture management and CVE tracking, Intelligence for threat awareness, and SOAR for automated response playbooks.',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
];

const typeColors: Record<string, string> = {
  Feature: 'bg-purple-500/10 text-purple-400',
  Integration: 'bg-orange-500/10 text-orange-400',
  Launch: 'bg-cyan-500/10 text-cyan-400',
};

export default function ChangelogPage() {
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
              Changelog
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              What we have been building. Follow along as we ship new features, integrations, and improvements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Entries */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5" />

            <div className="space-y-10">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[15px] top-2 w-[9px] h-[9px] rounded-full bg-cyan-500 ring-4 ring-navy-950" />

                  <div className="rounded-2xl p-7 bg-navy-900/40 border border-white/5">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs text-slate-500 font-medium">{entry.date}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[entry.type] || 'bg-slate-500/10 text-slate-400'}`}>
                        {entry.type}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-white mb-2">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
              See it{' '}
              <span className="text-gradient">in action</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Try CloudDory free and explore everything we have built.
            </p>
            <div className="mt-10">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                Start Free Trial
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
