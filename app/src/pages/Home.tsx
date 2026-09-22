import { Hero } from '@/components/sections/Hero';
import { Categories } from '@/components/sections/Categories';
import { BrandStrip } from '@/components/sections/BrandStrip';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { NewArrivals } from '@/components/sections/NewArrivals';
import { Features } from '@/components/sections/Features';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';
import { Footer } from '@/components/layout/Footer';
import { useDocumentSEO } from '@/lib/seo';

export function Home() {
  useDocumentSEO({
    title: 'Smoking Headshop · Rolling Papers, Bongs & Vapes in Dhaka',
    description:
      '100% authentic rolling papers, blunts, filter tips, waterpipes, bongs and vapes imported from the UK. Same-day delivery in Dhaka — order online then call 01330005300.',
    canonicalPath: '/',
    keywords:
      'rolling paper bangladesh, bong bd, vape dhaka, RAW bangladesh, smoking headshop dhaka, rollers republic, rollers pub',
  });

  return (
    <main>
      <Hero />
      <Categories />
      <BrandStrip />
      <FeaturedProducts />
      <NewArrivals />
      <Features />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
