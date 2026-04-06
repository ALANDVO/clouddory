'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const faqs = [
  {
    question: 'How does usage-based pricing work?',
    answer:
      'Our pricing scales with your monitored cloud spend. As your cloud footprint grows, your CloudDory subscription adjusts proportionally. This ensures you only pay for the value you receive — the more you monitor, the more savings opportunities we find.',
  },
  {
    question: "What's included in each plan?",
    answer:
      'All plans include access to all four modules: FinOps & Cost Optimization, Cloud Security (CSPM), Threat Intelligence, and SOAR Automation. The difference between plans is in the number of cloud accounts, data retention, integrations, and level of support.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start. You can explore the entire platform and see real savings recommendations before committing.',
  },
  {
    question: 'Can I change plans?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if my cloud spend changes?',
    answer:
      'Your subscription adjusts automatically based on your monitored cloud spend. If your usage decreases, your bill goes down. If it increases, it scales up proportionally. We always notify you before any pricing changes take effect.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'Yes, we offer annual billing with a 20% discount compared to monthly pricing. Annual plans are billed upfront and include all the same features and support as monthly plans.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'CloudDory is open source and free to self-host. For enterprise support and managed hosting, contact us.',
  },
  {
    question: 'How do enterprise contracts work?',
    answer:
      'Enterprise contracts are customized to your organization\'s needs. They include volume-based pricing, dedicated support, custom SLAs, and flexible payment terms. Contact our sales team to discuss your requirements and get a tailored proposal.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-white group-hover:text-cyan-400 transition-colors pr-4">
          {question}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-slate-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-400 leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="relative">
      <Navbar />

      {/* Spacer for navbar */}
      <div className="pt-20" />

      {/* Existing Pricing Component */}
      <Pricing />

      {/* FAQ Section */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              FAQ
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to know about CloudDory pricing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="border-t border-white/5"
          >
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-14 text-center"
          >
            <p className="text-slate-400 mb-4">Still have questions?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Contact our sales team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
