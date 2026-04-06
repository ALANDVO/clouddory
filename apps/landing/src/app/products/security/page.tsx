import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SecurityContent from './SecurityContent';

export const metadata: Metadata = {
  title: 'Cloud Security (CSPM) — CloudDory',
  description:
    'Continuous cloud security posture management across AWS, GCP, and Azure. Detect misconfigurations, enforce compliance, and stop threats in real time.',
};

export default function SecurityPage() {
  return (
    <main className="relative">
      <Navbar />
      <SecurityContent />
      <Footer />
    </main>
  );
}
