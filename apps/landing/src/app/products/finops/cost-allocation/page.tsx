import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CostAllocationContent from './CostAllocationContent';

export const metadata: Metadata = {
  title: 'Shared Cost Allocation — CloudDory',
  description:
    'Split shared cloud costs across teams, projects, and departments with telemetry-based or custom percentage allocation. Fair, transparent cost distribution.',
};

export default function CostAllocationPage() {
  return (
    <main className="relative">
      <Navbar />
      <CostAllocationContent />
      <Footer />
    </main>
  );
}
