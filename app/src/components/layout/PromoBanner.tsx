import { motion } from 'framer-motion';
import { Truck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '@/lib/config';

export function PromoBanner() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-primary text-black py-2 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] relative z-10">
        <Truck className="w-3 h-3 animate-pulse" aria-hidden="true" />
        <span>
          Express delivery — order online then call{' '}
          <a href={`tel:${siteConfig.phone}`} className="underline underline-offset-2">
            {siteConfig.phone}
          </a>{' '}
          · Same day in Dhaka
        </span>
        <Link to="/shop" className="flex items-center gap-1 hover:underline group">
          Shop Now
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
