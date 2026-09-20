import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBrands } from '@/hooks';
import { Badge } from '@/components/ui/badge';

/**
 * BrandStrip — horizontal scroll of the client's real imported brands,
 * linking into filtered shop views (SSOT §5, §6).
 */
export function BrandStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { data: brands = [] } = useBrands();

  if (brands.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-20 bg-[#050505] border-y border-white/5 overflow-hidden">
      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary py-1 px-4 tracking-[0.2em] font-bold text-[10px] uppercase bg-primary/5">
              You Name It, You Get It
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tighter">
              Shop <span className="text-primary italic">by Brand</span>
            </h2>
          </motion.div>
          <p className="text-white/50 max-w-sm text-sm leading-relaxed">
            RAW, Elements, Juicy Jays, OCB, Roor and more — imported from the UK, 100% authentic, every time.
          </p>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x"
          role="list"
          aria-label="Shop by brand"
        >
          {brands.slice(0, 24).map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4) }}
              role="listitem"
              className="shrink-0 snap-start"
            >
              <Link
                to={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                aria-label={`Shop ${brand.name} products`}
                className="group flex items-center h-24 min-w-[9rem] px-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all duration-300"
              >
                <span className="font-display font-black text-lg text-white/70 group-hover:text-primary tracking-tight transition-colors text-center">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
