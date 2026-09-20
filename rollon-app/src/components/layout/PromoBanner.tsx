import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PromoBanner() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-primary text-black py-2 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] relative z-10">
        <Sparkles className="w-3 h-3 animate-pulse" />
        <span>Eid-ul-Fitr Special Offer: 20% OFF on all Authentic Collection!</span>
        <Link to="/shop" className="flex items-center gap-1 hover:underline group">
          Shop Now
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
