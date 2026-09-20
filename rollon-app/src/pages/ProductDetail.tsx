import { useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Star, Truck, Shield,
  RotateCcw, ChevronLeft, Plus, Minus,
  Heart, Share2, Check, ArrowRight
} from 'lucide-react';
import { useProductBySlug, useProductsByCategory } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { buildProductJsonLd, useDocumentSEO } from '@/lib/seo';
import { toast } from 'sonner';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: categoryProducts = [] } = useProductsByCategory(product?.categoryId || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useWishlistStore((state) => state.items);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const isInWishlist = product ? wishlist.some((item) => item.product.id === product.id) : false;

  const location = useLocation();

  const seoDescription = useMemo(() => {
    if (!product) {
      return 'Premium smoking accessories from RollON Bangladesh.';
    }
    // Defensive: never crash the page on a malformed product payload.
    const desc = product.description || '';
    return `${product.name} - ${desc.slice(0, 140)}${desc.length > 140 ? '…' : ''}`;
  }, [product]);

  const productJsonLd = useMemo(
    () => (product ? buildProductJsonLd(product, location.pathname) : undefined),
    [location.pathname, product],
  );

  useDocumentSEO({
    title: product ? product.name : 'Product',
    description: seoDescription,
    canonicalPath: location.pathname,
    image: product?.image,
    type: 'product',
    jsonLd: productJsonLd,
  });


  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="text-white opacity-50">Loading product...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter">
            Product <span className="text-red-500">Not Found</span>
          </h1>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop">Return to Collection</Link>
          </Button>
        </div>
      </main>
    );
  }

  const relatedProducts = categoryProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] opacity-20" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium tracking-wide border-b border-transparent group-hover:border-white/20">Back to Shop</span>
          </Link>
        </div>

        {/* Product Grid */}
        <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-32"
            >
              <div className="group relative aspect-[4/5] sm:aspect-square bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect fill="%23111" width="600" height="600"/%3E%3Ctext fill="%23333" font-family="sans-serif" font-size="32" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ERollON Premium%3C/text%3E%3C/svg%3E';
                  }}
                />

                {product.badge && (
                  <div className="absolute top-8 left-8">
                    <Badge className={cn(
                      "px-4 py-1.5 text-sm font-bold tracking-tight rounded-full backdrop-blur-md shadow-lg",
                      product.badge.includes('%')
                        ? "bg-red-500/90 text-white border-red-400/50"
                        : "bg-primary/90 text-black border-primary/50"
                    )}>
                      {product.badge}
                    </Badge>
                  </div>
                )}

                {/* Glassmorphic Actions Overlay */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:border-primary/50 hover:text-primary transition-all shadow-xl"
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={() => {
                      if (!product) return;
                      if (isInWishlist) {
                        removeFromWishlist(product.id);
                        toast.success('Removed from wishlist');
                      } else {
                        addToWishlist(product);
                        toast.success('Added to wishlist');
                      }
                    }}
                  >
                    <Heart className={cn("w-5 h-5", isInWishlist && "fill-primary text-primary")} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:border-primary/50 hover:text-primary transition-all shadow-xl"
                    aria-label="Share product"
                    onClick={() => {
                      if (!product) return;
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: product.description,
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Product Configuration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="rounded-full border-primary/20 text-primary uppercase tracking-widest px-4 py-1">
                  {product.category}
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.1]">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(product.rating)
                            ? "text-primary fill-primary"
                            : "text-white/30 fill-white/30"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-white/60 font-medium">{product.rating}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-white/10" />
                  <span className="text-white/60 font-medium tracking-wide">
                    {product.reviewCount} <span className="text-xs uppercase ml-1">Reviews</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-2xl text-white/50 line-through font-light decoration-red-500/30">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-primary/80 text-sm font-medium">VAT inclusive where applicable</p>
              </div>

              <p className="text-white/50 text-xl leading-relaxed font-light font-display">
                {product.description}
              </p>

              {/* Functional Controls */}
              <div className="space-y-8 pt-6 border-t border-white/5">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="space-y-3">
                    <span className="text-xs uppercase tracking-widest text-white/60 font-bold">Quantity</span>
                    <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
                      <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="w-12 text-center font-bold font-mono text-xl">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-primary hover:text-primary hover:border-primary/50"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                    </div>
                  </div>

                  <div className="flex-1 w-full pt-6 sm:pt-0">
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      className={cn(
                        "w-full h-16 rounded-[1.25rem] text-lg font-bold transition-all duration-500 shadow-2xl relative overflow-hidden group/btn",
                        isAdded
                          ? "bg-primary text-black"
                          : "bg-white text-black hover:bg-primary active:scale-[0.98]"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isAdded ? (
                          <motion.div
                            key="added"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Check className="w-6 h-6" />
                            <span>Successfully Added</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="add"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <ShoppingCart className="w-6 h-6 transition-transform group-hover/btn:-rotate-12" />
                            <span>Add to Collection</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                {[
                  { icon: Truck, text: 'Express Logistics', desc: 'Dhaka Delivery 24h' },
                  { icon: Shield, text: 'Secure Integrity', desc: 'Secure Transactions' },
                  { icon: RotateCcw, text: 'Seamless Return', desc: '30-Day Policy' },
                  { icon: Star, text: 'Elite Quality', desc: 'Certified Premium' },
                ].map((feature) => (
                  <div key={feature.text} className="flex gap-4 group/item">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover/item:bg-primary group-hover/item:text-black transition-colors duration-500">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{feature.text}</h4>
                      <p className="text-xs text-white/60">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Context */}
        {relatedProducts.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-32 border-t border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="space-y-4">
                <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-bold">DISCOVER MORE</Badge>
                <h2 className="text-4xl lg:text-5xl font-display font-black text-white tracking-tighter">
                  You May Also <span className="text-primary italic">Like</span>
                </h2>
              </div>
              <Button asChild variant="ghost" className="text-white/60 hover:text-white group pr-0">
                <Link to="/shop" className="flex items-center gap-2">
                  View full collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/product/${related.slug}`} className="group block space-y-4">
                    <div className="aspect-[4/5] bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                      <img
                        src={related.image}
                        alt={related.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%231a1a1a" width="300" height="300"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">{related.category}</p>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                        {related.name}
                      </h3>
                      <p className="text-primary font-black text-xl tracking-tighter">{formatPrice(related.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </main>
  );
}