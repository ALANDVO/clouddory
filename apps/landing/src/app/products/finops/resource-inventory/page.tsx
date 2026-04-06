import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResourceInventoryContent from './ResourceInventoryContent';

export const metadata: Metadata = {
  title: 'Cloud Resource Inventory — CloudDory',
  description:
    'Complete visibility into every cloud resource across all accounts. Tag compliance tracking, orphaned resource detection, and asset lifecycle management for AWS, GCP, and Azure.',
};

export default function ResourceInventoryPage() {
  return (
    <main className="relative">
      <Navbar />
      <ResourceInventoryContent />
      <Footer />
    </main>
  );
}
