import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks';
import { Badge } from '@/components/ui/badge';

export function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { data: categories = [] } = useCategories();

  return (
    <section
      id="categories"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#050505] overflow-hidden"
    >
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.05)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1 px-4 tracking-[0.2em] font-bold text-[10px] uppercase bg-primary/5">
              Curated Experience
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-display font-black text-white mb-6 tracking-tighter"
          >
            DOMAIN <span className="text-white/30 italic">OF</span> <span className="text-primary italic transition-all duration-700 hover:text-white">STYLE</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-xl mx-auto font-light leading-relaxed"
          >
            Navigate through our specialized domains. Each category is a gateway to precision-engineered gear.
          </motion.p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link to={`/shop?category=${category.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer bg-[#111] border border-white/5 transition-all duration-500 hover:border-primary/30 shadow-2xl"
                >
                  {/* Image with zoom and grayscale to color transition */}
                  <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect fill="%230c0c0c" width="400" height="600"/%3E%3Ctext fill="%23333" font-family="sans-serif" font-size="20" font-weight="black" x="50%25" y="50%25" text-anchor="middle"%3E${encodeURIComponent(category.name.toUpperCase())}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>

                  {/* Gradient Layers */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/95 opacity-80" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

                  {/* Top Badge: Product Count */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/10 text-[10px] py-0.5 px-2">
                      {category.productCount} SKUs
                    </Badge>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    <div className="overflow-hidden">
                      <motion.h3
                        className="text-2xl font-display font-black text-white mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors"
                      >
                        {category.name.toUpperCase()}
                      </motion.h3>
                    </div>

                    <div className="h-0 group-hover:h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                      <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="text-[10px] font-black uppercase tracking-widest">Explore Domain</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Interaction Sparkle Effect */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <Sparkles className="h-5 w-5 text-primary/50 animate-pulse" />
                  </div>

                  {/* Glass Highlight */}
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500 rounded-3xl pointer-events-none" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}