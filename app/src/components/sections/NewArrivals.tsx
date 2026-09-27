import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNewArrivals } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';

/**
 * NewArrivals — "New Range of products, just arrived!" row.
 * One slim page from the API (`?fields=card&inStock=true&limit=4`) — the seed
 * ships newest-first, so the server picks the four newest in-stock products.
 */
export function NewArrivals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { data: newProducts = [], isLoading } = useNewArrivals(4);

  if (!isLoading && newProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-32 bg-[#050505] overflow-hidden">
      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 mb-16">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1.5 px-6 text-[10px] font-black uppercase tracking-[0.3em] bg-primary/5 rounded-full">
              <Sparkles className="w-3 h-3 mr-2" aria-hidden="true" />
              Fresh Off The Shelf
            </Badge>
            <h2 className="text-5xl sm:text-7xl font-display font-black text-white tracking-tighter leading-[0.9]">
              New <span className="text-primary italic">Arrivals.</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/shop?sort=newest"
              className="group flex items-center gap-3 text-white/60 hover:text-white text-lg font-bold"
            >
              View all <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : newProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: index * 0.08 }}
                >
                  <Link
                    to={`/product/${product.slug}`}
                    aria-label={`View ${product.name} details`}
                    className="group block bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.02]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23111" width="400" height="500"/%3E%3C/svg%3E`;
                        }}
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-black font-black text-[10px] tracking-widest uppercase">
                        Just Landed
                      </Badge>
                    </div>
                    <div className="p-6 space-y-2">
                      {product.brand && (
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-black">{product.brand}</p>
                      )}
                      <h3 className="font-display font-bold text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-primary font-black tabular-nums text-lg">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
