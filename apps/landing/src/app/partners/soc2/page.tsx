'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const protections = [
  {
    title: 'Encryption at Rest',
    description: 'All data stored by CloudDory is encrypted with AES-256. Database fields containing sensitive information use additional application-layer encryption.',
  },
  {
    title: 'Encryption in Transit',
    description: 'All connections use TLS 1.3. API endpoints enforce HTTPS. Internal service-to-service communication is encrypted.',
  },
  {
    title: 'Read-Only Cloud Access',
    description: 'CloudDory only requests read-only permissions to your cloud accounts. We never request write, delete, or modify access to your infrastructure.',
  },
  {
    title: 'No Write Permissions',
    description: 'Our IAM roles, service accounts, and app registrations are scoped to the minimum permissions needed for cost and metadata reads.',
  },
  {
    title: 'Data Isolation Per Org',
    description: 'Every organization has isolated data storage. Row-level security and org_id isolation ensure no cross-tenant data leakage.',
  },
  {
    title: 'Access Controls',
    description: 'Role-based access control (RBAC) with audit logging. All admin actions are logged and retained for compliance review.',
  },
];

const frameworks = [
  {
    title: 'SOC 2 Type II',
    status: 'Certified',
    description: 'Independent third-party audit of our security, availability, and confidentiality controls. Report available under NDA.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    title: 'GDPR Ready',
    status: 'Compliant',
    description: 'Full GDPR compliance with data subject rights, DPA available, EU data processing options, and breach notification procedures.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    title: 'ISO 27001',
    status: 'Roadmap',
    description: 'ISO 27001 certification is on our roadmap. Our security practices already align with ISO 27001 control objectives.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
  },
];

export default function SOC2Page() {
  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-xs uppercase tracking-[0.15em] text-green-400 font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              SOC 2 Type II Certified
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Security &{' '}
              <span className="text-green-400">Compliance</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              CloudDory is SOC 2 Type II certified. We take the security of your cloud data seriously, with independent audits and enterprise-grade controls.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What SOC 2 Means */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              What It Means
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Independent audit of our security controls
            </h2>
            <div className="mt-8 space-y-5 text-lg text-slate-400 leading-relaxed">
              <p>
                SOC 2 Type II is an auditing standard developed by the American Institute of CPAs (AICPA). Unlike Type I, which evaluates controls at a point in time, Type II verifies that controls are operating effectively over a sustained period (typically 6-12 months).
              </p>
              <p>
                Our SOC 2 Type II report covers the Trust Services Criteria for Security, Availability, and Confidentiality. An independent third-party auditor evaluates our infrastructure, processes, and controls to ensure they meet the highest standards.
              </p>
              <p>
                The full SOC 2 Type II report is available under NDA for enterprise customers and prospects. Contact our sales team to request a copy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We Protect Data */}
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
              Data Protection
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              How CloudDory protects your data
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {protections.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-green-500/15 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-green-500/10 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Frameworks */}
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
              Frameworks
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Compliance frameworks
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 lg:gap-6">
            {frameworks.map((fw, i) => (
              <motion.div
                key={fw.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl p-7 lg:p-8 bg-navy-900/40 border ${fw.borderColor} transition-all duration-300`}
              >
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${fw.color} ${fw.bgColor} mb-4`}>
                  {fw.status}
                </div>
                <h3 className="font-display font-semibold text-xl text-white mb-2">
                  {fw.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {fw.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-green-500/5 rounded-full blur-[150px]" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              View{' '}
              <span className="text-green-400">Trust Center</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Need our SOC 2 report, DPA, or security questionnaire? Reach out to our team.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/contact"
                className="btn-glow group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                View Trust Center
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </a>
              <a
                href="/legal/dpa"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white font-medium text-base hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300"
              >
                Request DPA
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
