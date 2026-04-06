'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    title: 'Pre-built Playbooks',
    description:
      'Ready-to-deploy automation for common security scenarios — isolate compromised instances, rotate exposed credentials, block malicious IPs, and remediate open storage buckets.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    title: 'Custom Workflows',
    description:
      'Build your own automation workflows with a visual drag-and-drop builder. Chain actions, add conditional logic, and create approval gates for sensitive operations.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Auto-Remediation',
    description:
      'Automatically fix security findings the moment they are detected. Set policies for auto-remediation of low-risk issues while routing critical findings for human review.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Integration Hub',
    description:
      'Connect CloudDory to your existing tools — Slack for alerts, Jira for ticketing, PagerDuty for on-call, and direct AWS/GCP/Azure APIs for cloud-native actions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
];

const integrations = [
  'Slack', 'Jira', 'PagerDuty', 'AWS', 'GCP', 'Azure', 'Terraform', 'Webhook',
];

export default function AutomationPage() {
  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-medium">
              Security Automation (SOAR)
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Respond in Seconds,{' '}
              <span className="text-gradient">Not Hours</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Automated playbooks and orchestration that turn security alerts into resolved incidents faster than any human response team.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-navy-950 font-semibold text-base hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,199,0.3)]"
              >
                Automate Response
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Automate your{' '}
              <span className="text-gradient">security operations</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              From detection to resolution, automate every step of your incident response workflow.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-emerald-500/15 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 bg-white/5 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors duration-300">
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

      {/* Playbook Preview */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Playbook Library
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Pre-built for common scenarios
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-white/10 bg-navy-900/60 p-6 lg:p-8"
          >
            <div className="space-y-3">
              {[
                { name: 'Isolate Compromised EC2 Instance', trigger: 'GuardDuty alert', steps: 5, time: '< 30s' },
                { name: 'Rotate Exposed IAM Credentials', trigger: 'Credential leak detected', steps: 4, time: '< 15s' },
                { name: 'Block Malicious IP at WAF', trigger: 'Threat intel match', steps: 3, time: '< 10s' },
                { name: 'Remediate Public S3 Bucket', trigger: 'CSPM finding', steps: 3, time: '< 10s' },
                { name: 'Escalate to On-Call via PagerDuty', trigger: 'Critical severity alert', steps: 2, time: '< 5s' },
                { name: 'Create Jira Ticket for Findings', trigger: 'Any new finding', steps: 2, time: '< 5s' },
              ].map((playbook, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{playbook.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Trigger: {playbook.trigger}</div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-xs text-slate-500">{playbook.steps} steps</span>
                    <span className="text-xs text-emerald-400 font-medium">{playbook.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative py-20 lg:py-28">
        <div className="section-divider mb-20" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Integrates with your stack
            </h2>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {integrations.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-slate-400 hover:border-cyan-500/20 hover:text-white transition-all duration-300"
              >
                {name}
              </motion.div>
            ))}
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
              Automate your{' '}
              <span className="text-gradient">response</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Stop manually triaging alerts. Let CloudDory handle the routine so your team can focus on what matters.
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
            <p className="mt-5 text-sm text-slate-500">Free 14-day trial. No credit card required.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
