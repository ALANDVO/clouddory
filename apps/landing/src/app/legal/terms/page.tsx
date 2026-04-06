'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. Account Registration',
    content: `To use CloudDory, you must create an account and provide accurate, complete information. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.

You must be at least 18 years old and have the authority to bind your organization to these Terms. By creating an account on behalf of an organization, you represent that you have such authority.`,
  },
  {
    title: '2. Services',
    content: `CloudDory provides cloud cost optimization, security monitoring, threat intelligence, and automation services ("Services"). The Services are provided on a subscription basis as described on our Pricing page.

We reserve the right to modify, suspend, or discontinue any part of the Services at any time. We will provide reasonable notice of any material changes.`,
  },
  {
    title: '3. Acceptable Use',
    content: `You agree not to:

- Use the Services for any unlawful purpose or in violation of any applicable laws
- Attempt to gain unauthorized access to any part of the Services or related systems
- Interfere with or disrupt the integrity or performance of the Services
- Reverse engineer, decompile, or disassemble any part of the Services
- Use the Services to store or transmit malicious code
- Resell, sublicense, or redistribute the Services without our written consent
- Use the Services to compete with CloudDory or to build a similar product`,
  },
  {
    title: '4. Billing and Payments',
    content: `Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as explicitly stated in your subscription agreement.

We may change our pricing with 30 days notice. Price changes will take effect at the start of your next billing cycle. If you do not agree to a price change, you may cancel your subscription before the change takes effect.

Overdue payments may result in suspension of your account. We reserve the right to engage collection agencies for delinquent accounts.`,
  },
  {
    title: '5. Your Data',
    content: `You retain all rights to the data you provide to CloudDory ("Your Data"). You grant us a limited license to use Your Data solely to provide and improve the Services.

We process Your Data in accordance with our Privacy Policy and, where applicable, our Data Processing Agreement (DPA). We implement appropriate security measures to protect Your Data as described in our Security page.`,
  },
  {
    title: '6. Intellectual Property',
    content: `CloudDory and its licensors retain all intellectual property rights in the Services, including all software, algorithms, models, designs, and documentation. Nothing in these Terms grants you any right to use CloudDory trademarks, logos, or brand features.

Feedback you provide about the Services may be used by us without restriction or compensation to improve the Services.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLOUDDORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES.

OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNTS YOU PAID TO CLOUDDORY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.`,
  },
  {
    title: '8. Indemnification',
    content: `You agree to indemnify and hold harmless CloudDory, its officers, directors, employees, and agents from any claims, damages, losses, and expenses (including reasonable attorneys\u2019 fees) arising out of your use of the Services, your violation of these Terms, or your violation of any rights of a third party.`,
  },
  {
    title: '9. Termination',
    content: `Either party may terminate these Terms at any time. You may cancel your subscription through the dashboard or by contacting us.

We may suspend or terminate your access to the Services if you breach these Terms, fail to pay fees when due, or if we are required to do so by law.

Upon termination, your right to use the Services ceases immediately. We will make your data available for export for 30 days following termination, after which it may be deleted.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles. Any disputes arising under these Terms shall be resolved in the state or federal courts located in San Francisco County, California.`,
  },
  {
    title: '11. Changes to These Terms',
    content: `We may update these Terms from time to time. We will notify you of material changes by email or through the Services. Your continued use of the Services after such changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms of Service, contact us at:

**Email:** legal@clouddory.com

**Mail:** CloudDory, Inc., San Francisco, CA, United States`,
  },
];

export default function TermsPage() {
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
              Legal
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg text-slate-400">
              Last updated: March 30, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <h2 className="font-display font-bold text-2xl text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-slate-400 leading-relaxed whitespace-pre-line text-[15px]">
                  {section.content.split('**').map((part, idx) =>
                    idx % 2 === 1 ? (
                      <strong key={idx} className="text-slate-300 font-medium">{part}</strong>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
