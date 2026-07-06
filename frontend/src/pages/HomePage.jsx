import { Hero } from '../components/home/Hero';
import { AboutCampaign } from '../components/home/AboutCampaign';
import { MerchandiseShowcase } from '../components/home/MerchandiseShowcase';
import { PricingSection } from '../components/home/PricingSection';

export function HomePage() {
  return (
    <>
      <Hero />
      <AboutCampaign />
      <MerchandiseShowcase />
      <PricingSection />
    </>
  );
}
