import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FinOpsContent from './FinOpsContent';

export const metadata: Metadata = {
  title: 'FinOps & Cost Optimization — CloudDory',
  description:
    'Take control of your cloud spend with AI-powered cost optimization. Discover hidden savings across AWS, GCP, and Azure with CloudDory FinOps.',
};

export default function FinOpsPage() {
  return (
    <main className="relative">
      <Navbar />
      <FinOpsContent />
      <Footer />
    </main>
  );
}
