import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShoppingCart } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';

export function FeaturedProducts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const addItem = useCartStore((state) => state.addItem);

  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-48 bg-[#050505] overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1.5 px-6 text-[10px] font-black uppercase tracking-[0.3em] bg-primary/5 rounded-full">
              Handpicked Selection
            </Badge>
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter leading-[0.9] mb-8">
              The <span className="text-primary italic">Vanguard.</span>
            </h2>
            <p className="text-white/60 max-w-xl text-xl font-light leading-relaxed">
              Curated artifacts of innovation. Engineering precision meets aesthetic transcendence in our most exclusive instruments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button asChild variant="ghost" className="text-white/60 hover:text-white group pr-0 h-16 text-lg font-bold">
              <Link to="/shop" className="flex items-center gap-3">
                View All Products <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn(
                i === 0 && "sm:col-span-2 lg:col-span-2",
                i === 3 && "lg:col-span-2"
              )}>
                <ProductSkeleton />
              </div>
            ))
          ) : (
            featuredProducts.map((product, index) => {
              const isLarge = index === 0;
              const isWide = index === 3;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    "group relative",
                    isLarge && "sm:col-span-2 lg:col-span-2",
                    isWide && "lg:col-span-2"
                  )}
                >
                  <div className="relative h-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
                    {/* Visual Interface */}
                    <Link
                      to={`/product/${product.slug}`}
                      aria-label={`View ${product.name} details`}
                      className={cn(
                      "relative overflow-hidden block bg-white/[0.02]",
                      isLarge ? "aspect-[16/9] sm:aspect-square lg:aspect-[16/9]" : "aspect-[4/5]"
                    )}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%23111" width="800" height="800"/%3E%3C/svg%3E`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20">
                        <Button
                          size="lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product);
                          }}
                          className="rounded-full bg-white text-black hover:bg-primary px-10 font-black tracking-tight"
                        >
                          <ShoppingCart className="w-5 h-5 mr-3" />
                          ACQUIRE NOW
                        </Button>
                      </div>

                      {product.badge && (
                        <div className="absolute top-8 left-8 z-30">
                          <Badge className={cn(
                            "px-4 py-1.5 text-xs font-black tracking-widest rounded-full shadow-lg border-white/10 backdrop-blur-md",
                            product.badge.includes('%') ? 'bg-red-500/90 text-white' : 'bg-primary/90 text-black'
                          )}>
                            {product.badge}
                          </Badge>
                        </div>
                      )}
                    </Link>

                    {/* Operational Data */}
                    <div className="p-8 lg:p-10 space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-black">{product.category}</span>
                          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            <TrendingUp className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-black tabular-nums tracking-widest uppercase">Popular</span>
                          </div>
                        </div>
                        <Link to={`/product/${product.slug}`}>
                          <h3 className={cn(
                            "font-display font-black text-white tracking-tighter leading-tight group-hover:text-primary transition-colors",
                            isLarge ? "text-3xl lg:text-5xl" : "text-2xl"
                          )}>
                            {product.name}
                          </h3>
                        </Link>
                        {isLarge && (
                          <p className="text-white/60 text-lg font-light leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-baseline gap-3">
                          <span className={cn(
                            "font-black text-white tracking-tighter tabular-nums",
                            isLarge ? "text-4xl" : "text-3xl"
                          )}>
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-base text-white/50 line-through font-light tabular-nums">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name} details`}>
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-500">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}