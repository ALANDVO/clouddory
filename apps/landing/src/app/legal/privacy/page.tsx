'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including:

**Account Information:** When you create an account, we collect your name, email address, company name, and password.

**Cloud Account Data:** When you connect your cloud accounts (AWS, GCP, Azure), we collect cost and usage metadata, resource inventories, and billing data through read-only API access. We do not access your application data, customer data, or production workloads.

**Usage Data:** We automatically collect information about how you use CloudDory, including pages visited, features used, and interaction patterns.

**Communication Data:** When you contact us, we collect the content of your messages, email address, and any other information you provide.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

- Provide, maintain, and improve CloudDory services
- Process and analyze your cloud cost and usage data to generate recommendations
- Send you technical notices, updates, security alerts, and administrative messages
- Respond to your comments, questions, and customer service requests
- Monitor and analyze trends, usage, and activities in connection with our services
- Detect, investigate, and prevent fraudulent transactions and other illegal activities
- Personalize and improve your experience`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We may share information in the following circumstances:

**Service Providers:** We share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer support. These providers are bound by contractual obligations to protect your data.

**Legal Requirements:** We may disclose information if required by law, regulation, legal process, or governmental request.

**Business Transfers:** In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.

**With Your Consent:** We may share information with your consent or at your direction.`,
  },
  {
    title: '4. Data Retention',
    content: `We retain your information for as long as your account is active or as needed to provide you services. We also retain information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.

Cloud cost and usage data is retained for up to 13 months to enable year-over-year comparisons. You can request deletion of your data at any time by contacting us.`,
  },
  {
    title: '5. Your Rights (CCPA/GDPR)',
    content: `Depending on your location, you may have the following rights:

**Access:** You can request a copy of the personal information we hold about you.

**Correction:** You can request that we correct inaccurate or incomplete information.

**Deletion:** You can request that we delete your personal information, subject to certain exceptions.

**Portability:** You can request a machine-readable copy of your data.

**Opt-Out:** You can opt out of certain data processing activities, including marketing communications.

**Non-Discrimination:** We will not discriminate against you for exercising your privacy rights.

To exercise these rights, contact us at privacy@clouddory.com.`,
  },
  {
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar tracking technologies to collect information about your browsing activity. These include:

**Essential Cookies:** Required for the operation of our services (authentication, security).

**Analytics Cookies:** Help us understand how visitors interact with our website.

**Preference Cookies:** Remember your settings and preferences.

You can control cookies through your browser settings. Disabling certain cookies may limit functionality.`,
  },
  {
    title: '7. Security',
    content: `We implement appropriate technical and organizational measures to protect your information, including encryption at rest (AES-256), encryption in transit (TLS 1.3), access controls, and regular security assessments. For more details, see our Security page.`,
  },
  {
    title: '8. International Transfers',
    content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) for transfers outside the European Economic Area.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:

**Email:** privacy@clouddory.com

**Mail:** CloudDory, Inc., San Francisco, CA, United States`,
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
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
