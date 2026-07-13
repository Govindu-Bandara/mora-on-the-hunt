import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { AboutCampaign } from '../components/home/AboutCampaign';
import { MerchandiseShowcase } from '../components/home/MerchandiseShowcase';
import { PricingSection } from '../components/home/PricingSection';

export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  return (
    <>
      <Hero />
      <AboutCampaign />
      <MerchandiseShowcase />
      <PricingSection />
    </>
  );
}
