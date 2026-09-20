import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ShopProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

export function ShopProductCard({ product, index, onAddToCart }: ShopProductCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="group relative flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
        {/* Visual Interface */}
        <Link 
          to={`/product/${product.slug}`} 
          className="relative aspect-[4/5] block overflow-hidden bg-white/[0.02]"
          aria-label={`View ${product.name} specifications`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23111" width="400" height="500"/%3E%3C/svg%3E`;
            }}
          />

          {/* Interaction Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 z-20">
            <Button
              size="lg"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/product/${product.slug}`);
              }}
              className="rounded-full bg-white text-black hover:bg-primary px-8 font-black tracking-tight"
            >
              VIEW SPECIFICATIONS
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={(e) => { 
                e.preventDefault(); 
                onAddToCart(product); 
              }}
              className="px-8 font-bold text-white hover:text-primary"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              QUICK ADD
            </Button>
          </div>

          {product.badge && (
            <div className="absolute top-6 left-6 z-30">
              <Badge className={cn(
                "px-3 py-1 text-xs font-black tracking-tighter rounded-full shadow-lg border-white/10 backdrop-blur-md",
                product.badge.includes('%') ? 'bg-red-500/90 text-white' : 'bg-primary/90 text-black'
              )}>
                {product.badge}
              </Badge>
            </div>
          )}
        </Link>

        {/* Metadata */}
        <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black">{product.category}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-[10px] text-white/60 font-bold tabular-nums">{product.rating}</span>
              </div>
            </div>
            <Link to={`/product/${product.slug}`}>
              <h3 className="text-xl font-display font-black text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <span className="text-2xl font-black text-white tracking-tighter tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-white/50 line-through font-light tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
