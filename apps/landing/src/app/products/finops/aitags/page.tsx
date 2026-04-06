import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AiTagsContent from './AiTagsContent';

export const metadata: Metadata = {
  title: 'AiTags — CloudDory',
  description:
    'Unify cloud tagging across AWS, GCP, and Azure with rule-based AiTags. Create custom cost dimensions without modifying resources.',
};

export default function VirtualTagsPage() {
  return (
    <main className="relative">
      <Navbar />
      <AiTagsContent />
      <Footer />
    </main>
  );
}
