'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Connect your cloud accounts',
    description:
      'Securely link AWS, GCP, and Azure in minutes with read-only access. No agents to install.',
    visual: (
      <div className="relative flex items-center justify-center gap-6">
        {['AWS', 'GCP', 'Azure'].map((cloud, i) => (
          <motion.div
            key={cloud}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5, type: 'spring' }}
            className="w-16 h-16 rounded-xl bg-navy-800 border border-cyan-500/20 flex items-center justify-center text-xs font-semibold text-cyan-400"
          >
            {cloud}
          </motion.div>
        ))}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
        />
      </div>
    ),
  },
  {
    number: '02',
    title: 'CloudDory scans and maps your spend',
    description:
      'Our AI engine analyzes usage patterns, pricing tiers, and resource relationships to build a complete cost map.',
    visual: (
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Sonar visualization */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-sonar" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-sonar-delayed" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-sonar-delayed-2" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_20px_rgba(0,229,199,0.5)]" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {['Scanning...', '2,847 resources found'].map((text, i) => (
              <motion.span
                key={text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.3 }}
                className="text-xs text-cyan-400/70 font-mono"
              >
                {text}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Get actionable recommendations',
    description:
      'Receive prioritized, one-click optimization suggestions with projected savings — instantly.',
    visual: (
      <div className="space-y-2">
        {[
          { label: 'Downsize db-prod-3', save: '$420/mo', pct: 85 },
          { label: 'Delete unused EBS volumes', save: '$180/mo', pct: 95 },
          { label: 'Switch to reserved pricing', save: '$1,200/mo', pct: 70 },
        ].map((rec, i) => (
          <motion.div
            key={rec.label}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-navy-800/80 border border-cyan-500/10"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{rec.label}</div>
              <div className="mt-1 h-1 rounded-full bg-navy-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${rec.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.15, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-400 whitespace-nowrap">
              {rec.save}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="section-divider mb-24" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
            How It Works
          </span>
          <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Three steps to{' '}
            <span className="text-gradient">clarity</span>
          </h2>
        </motion.div>

        <div className="space-y-16 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className="relative"
            >
              {/* Connecting line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 left-full w-12 h-px bg-gradient-to-r from-cyan-500/30 to-transparent z-10" />
              )}

              <div className="text-center">
                <span className="inline-block font-display text-6xl font-extrabold text-cyan-500/10 mb-4">
                  {step.number}
                </span>
                <h3 className="font-display font-semibold text-xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                  {step.description}
                </p>
                <div className="max-w-xs mx-auto">{step.visual}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
