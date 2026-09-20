import { Plus, Minus, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isCartOpen = useCartStore((state) => state.isOpen);
  const setIsCartOpen = useCartStore((state) => state.setCartOpen);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg bg-[#050505] border-l border-white/5 p-0 overflow-hidden shadow-2xl shadow-black">
        <SheetHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-display font-black text-white tracking-tight uppercase italic">
                  Shopping Cart
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{totalItems} items</span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 bg-white/[0.02] rounded-[3rem] flex items-center justify-center border border-white/5 border-dashed">
                  <ShoppingBag className="w-12 h-12 text-white/30" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center blur-sm" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-black text-white tracking-tight italic uppercase">
                  Your cart is empty
                </h3>
                <p className="text-white/60 text-lg font-light max-w-[250px] mx-auto leading-relaxed">
                  Your acquisition tray is currently unpopulated. Explore our latest foundry drops.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(false)}
                className="rounded-2xl px-10 py-8 h-auto font-black tracking-widest border-white/10 hover:border-primary text-white/60 hover:text-primary transition-all"
              >
                BEGIN EXPLORATION
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 40 }}
                    transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative flex gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all duration-500"
                  >
                    <div className="relative shrink-0">
                      <div className="w-28 h-28 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23111" width="80" height="80"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-primary text-black font-black">
                        x{item.quantity}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xl font-display font-bold text-white tracking-tight truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => removeItem(item.productId)}
                            className="w-8 h-8 text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mt-1">Foundry ID: #{item.productId.slice(0, 8)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/5 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 rounded-lg text-white/60 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white font-black tabular-nums w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 rounded-lg text-white/60 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <div className="w-full space-y-6">
              {/* Trust Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60 italic">Secure Protocol</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60 italic">Elite Dispatch</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-white/60 text-sm font-medium">
                  <span>Gross Allocation</span>
                  <span className="tabular-nums">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex items-center justify-between text-primary text-xs font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-primary" />
                    <span>Loyalty Credit Applied</span>
                  </div>
                  <span>- 0.00</span>
                </div>

                <Separator className="bg-white/5" />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-white/60 font-black uppercase tracking-widest text-xs italic">Awaiting Settlement</span>
                  <span className="text-4xl font-display font-black text-white tracking-tighter tabular-nums italic">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button className="group w-full py-10 h-auto rounded-[2rem] font-black text-xl italic uppercase tracking-tighter text-black bg-primary hover:bg-white transition-all shadow-2xl shadow-primary/20">
                    Settle Manifest
                    <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="w-full text-white/50 hover:text-red-500 hover:bg-red-500/5 font-black tracking-widest text-[10px] uppercase"
                >
                  PURGE CASE
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}