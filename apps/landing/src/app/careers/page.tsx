'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const openPositions = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Build the core data pipeline and API infrastructure that powers CloudDory\'s FinOps and security modules. You\'ll work with AWS Cost Explorer APIs, real-time data processing, and our Gemini-powered AI assistant.',
  },
  {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Own features end-to-end across our Next.js dashboard and Node.js backend. From the Cost Explorer UI to the CVE detection pipeline, you\'ll ship code that helps teams save money and stay secure.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Design the experience for a platform that replaces 5+ tools. You\'ll craft intuitive interfaces for complex data — cost breakdowns, security posture scores, threat intelligence feeds — making them accessible to every team.',
  },
  {
    title: 'DevOps / Site Reliability Engineer',
    department: 'Infrastructure',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Keep CloudDory running at 99.99% uptime. Manage our multi-cloud infrastructure, CI/CD pipelines, monitoring, and incident response. Dogfood our own product to optimize our cloud costs.',
  },
  {
    title: 'Solutions Engineer',
    department: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Help enterprise customers get the most out of CloudDory. Run technical demos, architect integrations, and work with product to turn customer feedback into features.',
  },
];

const perks = [
  { title: 'Fully Remote', description: 'Work from anywhere in the US. We\'re async-first with overlap hours.' },
  { title: 'Competitive Equity', description: 'Meaningful ownership in a company building the future of cloud operations.' },
  { title: 'Health & Wellness', description: 'Medical, dental, vision for you and your family. Plus wellness stipend.' },
  { title: 'Learning Budget', description: '$2,000/year for conferences, courses, certifications, or books.' },
  { title: 'Latest Hardware', description: 'MacBook Pro, 4K monitor, and any tools you need to do your best work.' },
  { title: 'Unlimited PTO', description: 'We trust you to manage your time. Minimum 3 weeks encouraged.' },
];

export default function CareersPage() {
  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Careers
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Build the future of{' '}
              <span className="text-gradient">cloud operations</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re replacing 5+ tools with one unified platform. Join us and help every cloud team find what their infrastructure is hiding.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="relative py-20 lg:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl text-white">Why CloudDory</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl bg-navy-900/40 border border-white/5 p-6"
              >
                <h3 className="font-display font-semibold text-white mb-1">{perk.title}</h3>
                <p className="text-sm text-slate-400">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative py-20 lg:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl text-white">Open Positions</h2>
            <p className="mt-3 text-slate-400">
              Don&apos;t see a fit? Email <a href="mailto:careers@clouddory.com" className="text-cyan-400 hover:underline">careers@clouddory.com</a> — we&apos;re always looking for exceptional people.
            </p>
          </motion.div>

          <div className="space-y-4">
            {openPositions.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl bg-navy-900/40 border border-white/5 p-6 hover:border-cyan-500/20 hover:bg-cyan-500/[0.02] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h3 className="font-display font-semibold text-lg text-white">{job.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium">{job.department}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-400 text-xs">{job.location}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-400 text-xs">{job.type}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{job.description}</p>
                <a
                  href={`mailto:careers@clouddory.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section-divider mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl text-white">
            Don&apos;t see the right role?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            We&apos;re growing fast. Send us your resume and tell us what you&apos;d build.
          </p>
          <a
            href="mailto:careers@clouddory.com"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-navy-950 font-semibold hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
          >
            careers@clouddory.com
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
