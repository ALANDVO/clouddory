import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnomalyDetectionContent from './AnomalyDetectionContent';

export const metadata: Metadata = {
  title: 'Cost Anomaly Detection — CloudDory',
  description:
    'Catch cloud cost spikes in real time with AI-powered anomaly detection. Get Slack and email alerts within minutes, with root cause analysis across AWS, GCP, and Azure.',
};

export default function AnomalyDetectionPage() {
  return (
    <main className="relative">
      <Navbar />
      <AnomalyDetectionContent />
      <Footer />
    </main>
  );
}
