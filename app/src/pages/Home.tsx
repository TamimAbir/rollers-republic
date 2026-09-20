import { Hero } from '@/components/sections/Hero';
import { Categories } from '@/components/sections/Categories';
import { BrandStrip } from '@/components/sections/BrandStrip';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { NewArrivals } from '@/components/sections/NewArrivals';
import { Features } from '@/components/sections/Features';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';
import { Footer } from '@/components/layout/Footer';

export function Home() {
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
