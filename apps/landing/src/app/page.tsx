import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LogosBar from '@/components/LogosBar';
import Problem from '@/components/Problem';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Stats from '@/components/Stats';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <LogosBar />
      <Problem />
      <HowItWorks />
      <Features />
      <Stats />
      <Pricing />
      <FinalCTA />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
