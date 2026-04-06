import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SavingsForecastingContent from './SavingsForecastingContent';

export const metadata: Metadata = {
  title: 'Cloud Savings Forecasting — CloudDory',
  description:
    'Project future cloud costs with AI-powered forecasting. Model the impact of optimization actions, set budget alerts, and track ROI across AWS, GCP, and Azure.',
};

export default function SavingsForecastingPage() {
  return (
    <main className="relative">
      <Navbar />
      <SavingsForecastingContent />
      <Footer />
    </main>
  );
}
