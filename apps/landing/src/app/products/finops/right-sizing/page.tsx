import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RightSizingContent from './RightSizingContent';

export const metadata: Metadata = {
  title: 'Cloud Right-Sizing Engine — CloudDory',
  description:
    'Identify over-provisioned EC2 instances, RDS databases, and containers. Get specific resize recommendations backed by 30 days of utilization data across AWS, GCP, and Azure.',
};

export default function RightSizingPage() {
  return (
    <main className="relative">
      <Navbar />
      <RightSizingContent />
      <Footer />
    </main>
  );
}
