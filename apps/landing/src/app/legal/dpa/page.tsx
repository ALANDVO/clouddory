'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. Scope of Data Processing',
    content: `This Data Processing Agreement ("DPA") applies to the processing of personal data by CloudDory, Inc. ("Processor") on behalf of the Customer ("Controller") in connection with the CloudDory Services.

**Categories of Data Subjects:** Customer employees, end users, and authorized users of the CloudDory platform.

**Types of Personal Data:** Name, email address, IP address, browser information, usage analytics, and cloud account metadata. CloudDory does not process or store customer application data, end-user data, or production workload data from connected cloud accounts.

**Purpose of Processing:** To provide, maintain, and improve the CloudDory Services, including cloud cost analysis, security monitoring, and optimization recommendations.

**Duration:** Processing continues for the duration of the service agreement plus a 30-day data export period following termination.`,
  },
  {
    title: '2. Obligations of the Processor',
    content: `CloudDory shall:

- Process personal data only on documented instructions from the Controller, unless required by applicable law
- Ensure that persons authorized to process personal data have committed themselves to confidentiality
- Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk
- Not engage another processor without prior written authorization of the Controller
- Assist the Controller in responding to data subject requests
- Delete or return all personal data to the Controller after the end of the provision of services
- Make available to the Controller all information necessary to demonstrate compliance with GDPR obligations`,
  },
  {
    title: '3. Sub-Processors',
    content: `CloudDory uses the following categories of sub-processors:

**Infrastructure Providers:** For hosting and computing resources.

**Analytics Providers:** For product analytics and performance monitoring.

**Communication Providers:** For email delivery and customer support.

The Controller has given general authorization for the engagement of sub-processors. CloudDory will inform the Controller of any intended changes concerning the addition or replacement of sub-processors, giving the Controller the opportunity to object within 30 days.

A current list of sub-processors is maintained and available upon request by contacting legal@clouddory.com.`,
  },
  {
    title: '4. Data Subject Rights',
    content: `CloudDory will assist the Controller in fulfilling its obligation to respond to requests for exercising data subject rights under GDPR, including:

- Right of access (Article 15)
- Right to rectification (Article 16)
- Right to erasure (Article 17)
- Right to restriction of processing (Article 18)
- Right to data portability (Article 20)
- Right to object (Article 21)

CloudDory will promptly notify the Controller if it receives a request from a data subject and will not respond to such requests without the Controller\u2019s instructions, unless required by law.`,
  },
  {
    title: '5. Data Breach Notification',
    content: `CloudDory will notify the Controller without undue delay, and in any event within 72 hours, after becoming aware of a personal data breach. The notification will include:

- A description of the nature of the breach, including the categories and approximate number of data subjects and records concerned
- The name and contact details of the data protection point of contact
- A description of the likely consequences of the breach
- A description of the measures taken or proposed to address the breach

CloudDory will cooperate with the Controller and take reasonable commercial steps to assist in the investigation, mitigation, and remediation of each breach.`,
  },
  {
    title: '6. Data Retention and Deletion',
    content: `CloudDory retains personal data for the duration of the service agreement. Upon termination or expiration of the agreement:

- Customer data is available for export for 30 days
- After the 30-day export period, all personal data is securely deleted from active systems within 30 days
- Backups containing personal data are purged within 90 days of termination
- CloudDory will provide written certification of deletion upon request

During the service period, the Controller may request deletion of specific personal data at any time.`,
  },
  {
    title: '7. International Data Transfers',
    content: `Where personal data is transferred outside the European Economic Area (EEA), CloudDory ensures appropriate safeguards are in place:

**Standard Contractual Clauses (SCCs):** CloudDory uses the European Commission\u2019s Standard Contractual Clauses (Module 2: Controller to Processor) for transfers to countries without an adequacy decision.

**Supplementary Measures:** CloudDory implements additional technical measures including encryption in transit and at rest, access controls, and data minimization to supplement the SCCs.

CloudDory will comply with any additional requirements arising from regulatory guidance on international data transfers.`,
  },
  {
    title: '8. Audits and Inspections',
    content: `CloudDory will make available to the Controller, on request, all information necessary to demonstrate compliance with this DPA and GDPR obligations.

CloudDory will allow for and contribute to audits, including inspections, conducted by the Controller or an auditor mandated by the Controller. Such audits will be conducted with reasonable notice and during normal business hours, subject to appropriate confidentiality obligations.

CloudDory\u2019s SOC 2 Type II report may be accepted as a substitute for on-site audits at the Controller\u2019s discretion.`,
  },
  {
    title: '9. Contact',
    content: `For questions about this DPA or to request a signed copy, contact us at:

**Email:** legal@clouddory.com

**Mail:** CloudDory, Inc., San Francisco, CA, United States`,
  },
];

export default function DPAPage() {
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
              Data Processing Agreement
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
