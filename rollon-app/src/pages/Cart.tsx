import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';

export function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24">
      {/* Header */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1d] to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block text-sm font-medium text-green-400 tracking-widest uppercase mb-4">
              Your Selection
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-white/60 text-lg">
              {totalItems} items in your cart
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center shadow-2xl border border-white/10">
                <ShoppingBag className="w-14 h-14 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              Your Vault is Empty
            </h2>
            <p className="text-white/50 mb-10 text-lg max-w-md text-center">
              Discover our premium selection of artifacts to elevate your collection
            </p>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-[#39FF14] to-green-400 rounded-full text-black font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                Browse Collection
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  {/* Image */}
                  <Link to={`/product/${item.slug}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%231d1d1d" width="96" height="96" rx="12"/%3E%3C/svg%3E';
                      }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="text-white font-medium truncate hover:text-green-400 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-green-400 font-semibold mb-3">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white/10 rounded-full">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </motion.button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>

                      {/* Remove */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-white/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-display font-semibold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Subtotal ({totalItems} items)</span>
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Tax</span>
                    <span className="text-white">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-display font-semibold">Total</span>
                    <span className="text-2xl font-display font-bold gradient-text">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full text-black font-semibold flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <div className="flex items-center justify-center gap-2 mt-4 text-white/60 text-sm">
                  <Truck className="w-4 h-4" />
                  Free delivery in Dhaka
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}