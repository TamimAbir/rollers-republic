import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const shipping = totalPrice > 3000 ? 0 : 100;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="relative p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-display font-black text-white tracking-tighter mb-8">
        Order Summary
      </h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.name}</p>
              <p className="text-sm text-white/60">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center text-white">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-white/10 my-6" />

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-emerald-400">Free shipping on orders over ৳3,000</p>
        )}
        
        <Separator className="bg-white/10 my-3" />
        
        <div className="flex justify-between text-lg font-bold text-white">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50 mb-4">Your cart is empty</p>
          <Button asChild variant="outline">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
