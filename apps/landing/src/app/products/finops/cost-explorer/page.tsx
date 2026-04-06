import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CostExplorerContent from './CostExplorerContent';

export const metadata: Metadata = {
  title: 'Cloud Cost Explorer — CloudDory',
  description:
    'Break down cloud spend by service, account, region, and tag with interactive dashboards. Drill into any cost anomaly across AWS, GCP, and Azure in seconds.',
};

export default function CostExplorerPage() {
  return (
    <main className="relative">
      <Navbar />
      <CostExplorerContent />
      <Footer />
    </main>
  );
}
