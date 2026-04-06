import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIRecommendationsContent from './AIRecommendationsContent';

export const metadata: Metadata = {
  title: 'AI-Powered Savings Recommendations — CloudDory',
  description:
    'CloudDory AI analyzes your cloud usage patterns and surfaces actionable savings — reserved instances, right-sizing, spot opportunities, and unused resources across AWS, GCP, and Azure.',
};

export default function AIRecommendationsPage() {
  return (
    <main className="relative">
      <Navbar />
      <AIRecommendationsContent />
      <Footer />
    </main>
  );
}
