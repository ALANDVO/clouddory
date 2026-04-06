'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const integrations = [
  {
    title: 'Cost Explorer API',
    description: 'Real-time cost and usage data pulled directly from the AWS Cost Explorer API for granular spend visibility.',
  },
  {
    title: 'CloudFormation Setup',
    description: 'One-click CloudFormation stack deploys a read-only IAM role in minutes. No manual configuration required.',
  },
  {
    title: 'STS Cross-Account Access',
    description: 'Secure cross-account access via AWS STS AssumeRole. Your credentials never leave your account.',
  },
  {
    title: 'Cost and Usage Reports (CUR)',
    description: 'Ingest detailed CUR data from S3 for line-item cost analysis across every AWS service.',
  },
  {
    title: 'CloudWatch Metrics',
    description: 'Pull CloudWatch metrics for right-sizing recommendations and anomaly detection on compute, database, and storage.',
  },
];

const services = [
  'EC2', 'RDS', 'S3', 'Lambda', 'EKS', 'DynamoDB', 'CloudFront', 'Route 53',
  'ElastiCache', 'Redshift', 'SageMaker', 'ECS', 'EBS', 'NAT Gateway', 'VPC', 'SNS/SQS',
];

const steps = [
  {
    step: '1',
    title: 'Launch CloudFormation Stack',
    description: 'Click the one-click deploy button to launch our CloudFormation template in your AWS account. It creates a read-only IAM role with least-privilege permissions.',
  },
  {
    step: '2',
    title: 'Read-Only Access Verified',
    description: 'CloudDory assumes a read-only role via STS. We never request write permissions. Your infrastructure is never modified.',
  },
  {
    step: '3',
    title: 'Data Stays in Your Account',
    description: 'CUR data remains in your S3 bucket. We read and analyze it in real time. You retain full ownership and control of your data.',
  },
];

export default function AWSPartnerPage() {
  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-xs uppercase tracking-[0.15em] text-orange-400 font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              AWS Technology Partner
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              CloudDory +{' '}
              <span className="text-orange-400">AWS</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Deep native integration with Amazon Web Services. Get complete cost visibility, security insights, and optimization recommendations across your entire AWS footprint.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
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
              Integrations
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              How CloudDory integrates with AWS
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {integrations.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-hover group relative rounded-2xl p-7 lg:p-8 bg-navy-900/40 border border-white/5 hover:border-orange-500/15 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-orange-500/10 text-orange-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
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

      {/* Supported Services */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Coverage
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Supported AWS services
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              CloudDory tracks cost and usage across all major AWS services, with more added every month.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {services.map((service) => (
              <span
                key={service}
                className="px-4 py-2.5 rounded-lg border border-white/5 bg-navy-900/40 text-sm text-slate-300 hover:border-orange-500/20 hover:text-orange-400 transition-all duration-300"
              >
                {service}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Getting Started
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Connect your AWS account in 3 steps
            </h2>
          </motion.div>

          <div className="space-y-6">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex gap-6 items-start rounded-2xl p-7 bg-navy-900/40 border border-white/5"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-400 font-display font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="section-divider mb-24" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Connect Your{' '}
              <span className="text-orange-400">AWS Account</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400 max-w-xl mx-auto">
              Start saving on your AWS bill in under 5 minutes. One-click CloudFormation deployment, read-only access.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://dashboard.clouddory.com/register"
                className="btn-glow group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,199,0.35)]"
              >
                Connect Your AWS Account
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
