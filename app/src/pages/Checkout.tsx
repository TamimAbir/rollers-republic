import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, CreditCard, Truck,
  Check, Lock, ShieldCheck, ArrowRight,
  MapPin, CreditCard as CardIcon, ShoppingCart
} from 'lucide-react';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, cn } from '@/lib/utils';
import { checkoutSchema, type CheckoutForm } from '@/lib/checkoutSchema';
import { Footer } from '@/components/layout/Footer';
import { useCreateOrder } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function Checkout() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const user = useAuthStore((state) => state.user);
  const createOrderMutation = useCreateOrder();

  const { register, trigger, handleSubmit, control, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
    mode: 'onTouched',
  });

  const paymentMethod = useWatch({
    control,
    name: 'paymentMethod',
  });

  const city = useWatch({
    control,
    name: 'city',
  });

  const processOrder = async (data: CheckoutForm) => {
    setIsProcessing(true);

    const customerName = `${data.firstName} ${data.lastName}`.trim();

    try {
      await createOrderMutation.mutateAsync({
        customerId: user?.id ?? `guest-${Date.now()}`,
        customerName,
        total: totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: data.paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: {
          name: customerName,
          address: data.address,
          city: data.city,
          phone: data.phone,
          zone: city || undefined,
        },
      });

      setIsComplete(true);
      clearCart();
      toast.success('Order placed successfully.');
    } catch (error) {
      console.error('Order processing failed:', error);
      toast.error('Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const fields: (keyof CheckoutForm)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
      const valid = await trigger(fields);
      if (valid) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  if (items.length === 0 && !isComplete) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center px-4">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <ShoppingCart className="w-10 h-10 text-white/50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black text-white tracking-tighter">Your Vault is Empty</h1>
            <p className="text-white/60 text-lg">You haven't added any premium artifacts to your collection yet.</p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-primary px-12 h-14 font-black">
            <Link to="/shop">Explore Collection</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full text-center space-y-10 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl shadow-2xl"
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(74,222,128,0.3)]">
            <Check className="w-12 h-12 text-black stroke-[3px]" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-black text-white tracking-tighter">Order Confirmed</h1>
            <p className="text-white/60 text-xl font-light leading-relaxed">
              Your acquisition has been logged. Our logistics team is preparing your premium items for dispatch.
            </p>
          </div>
          <div className="pt-6 border-t border-white/5">
            <Button asChild size="lg" className="w-full h-16 rounded-2xl bg-primary text-black hover:bg-white transition-all font-black text-lg">
              <Link to="/shop">View More Artifacts</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] opacity-10" />
      </div>

      <div className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <Link to="/cart" className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-widest uppercase">Review Cart</span>
          </Link>
        </div>

        <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Elegant Progress Sequence */}
            <div className="flex items-center justify-center gap-4 mb-24 hidden sm:flex">
              {[
                { label: 'Logistics', icon: Truck },
                { label: 'Payment', icon: CreditCard },
                { label: 'Review', icon: ShieldCheck }
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500",
                    step > index + 1 ? "bg-primary border-primary text-black" :
                      step === index + 1 ? "bg-white/5 border-white/20 text-white" :
                        "bg-transparent border-white/5 text-white/50"
                  )}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  {index < 2 && <div className={cn("w-12 h-px transition-colors duration-500", step > index + 1 ? "bg-primary/50" : "bg-white/5")} />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(processOrder)}>
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                {/* Form Vector */}
                <div className="lg:col-span-7 space-y-12">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-2">
                          <h2 className="text-4xl font-display font-black text-white tracking-tighter">Shipping Architecture</h2>
                          <p className="text-white/60 font-light">Specify the destination for your acquisition.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="firstName" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">First Name</Label>
                            <Input id="firstName" {...register('firstName')} placeholder="John" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.firstName && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.firstName.message}</p>}
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="lastName" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Last Name</Label>
                            <Input id="lastName" {...register('lastName')} placeholder="Doe" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.lastName && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.lastName.message}</p>}
                          </div>
                          <div className="sm:col-span-2 space-y-3">
                            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Secure Email</Label>
                            <Input id="email" {...register('email')} type="email" placeholder="john@example.com" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.email && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.email.message}</p>}
                          </div>
                          <div className="sm:col-span-2 space-y-3">
                            <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Phone Number</Label>
                            <Input id="phone" {...register('phone')} type="tel" placeholder="+880 1XXX XXXXXX" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.phone && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.phone.message}</p>}
                          </div>
                          <div className="sm:col-span-2 space-y-3">
                            <Label htmlFor="address" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Precise Address</Label>
                            <Input id="address" {...register('address')} placeholder="House, Road, Area" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.address && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.address.message}</p>}
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="city" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">City Hub</Label>
                            <Input id="city" {...register('city')} placeholder="Dhaka" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.city && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.city.message}</p>}
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="postalCode" className="text-xs uppercase tracking-widest text-white/60 font-bold ml-1">Postal Code</Label>
                            <Input id="postalCode" {...register('postalCode')} placeholder="1212" className="h-14 bg-white/[0.03] border-white/10 rounded-2xl focus-visible:ring-primary/20 text-white" />
                            {errors.postalCode && <p className="text-red-500/80 text-[10px] uppercase font-bold tracking-wider ml-1">{errors.postalCode.message}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-2">
                          <h2 className="text-4xl font-display font-black text-white tracking-tighter">Payment Protocol</h2>
                          <p className="text-white/60 font-light">Select your preferred transaction gateway.</p>
                        </div>

                        <RadioGroup
                          onValueChange={(v: string) => setValue('paymentMethod', v as CheckoutForm['paymentMethod'])}

                          defaultValue={paymentMethod}
                          className="grid gap-4"
                        >
                          {[
                            { id: 'cod', label: 'Cash on Delivery', desc: 'Secure liquid transaction upon arrival', icon: Truck },
                            { id: 'bkash', label: 'bKash Merchant', desc: 'Instant mobile acquisition via bKash', icon: CardIcon },
                            { id: 'nagad', label: 'Nagad Terminal', desc: 'Digital finance processing via Nagad', icon: ShieldCheck }
                          ].map((pm) => (
                            <Label
                              key={pm.id}
                              htmlFor={pm.id}
                              className={cn(
                                "flex items-center gap-6 p-8 rounded-3xl border transition-all cursor-pointer group",
                                paymentMethod === pm.id
                                  ? "bg-primary/5 border-primary shadow-[0_0_30px_rgba(74,222,128,0.05)]"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/20"
                              )}
                            >
                              <RadioGroupItem value={pm.id} id={pm.id} className="sr-only" />
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500",
                                paymentMethod === pm.id ? "bg-primary text-black" : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white"
                              )}>
                                <pm.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className={cn("text-lg font-black tracking-tight transition-colors", paymentMethod === pm.id ? "text-white" : "text-white/60")}>
                                  {pm.label}
                                </p>
                                <p className="text-sm text-white/60 font-light">{pm.desc}</p>
                              </div>
                              <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                paymentMethod === pm.id ? "border-primary bg-primary" : "border-white/10"
                              )}>
                                {paymentMethod === pm.id && <Check className="w-3 h-3 text-black stroke-[4px]" />}
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-10"
                      >
                        <div className="space-y-2">
                          <h2 className="text-4xl font-display font-black text-white tracking-tighter">Final Verification</h2>
                          <p className="text-white/60 font-light">Confirm the details of your order.</p>
                        </div>

                        <div className="space-y-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-sm">
                          {items.map((item) => (
                            <div key={item.productId} className="flex items-center gap-6 group">
                              <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden shrink-0">
                                <img src={item.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="text-white font-bold tracking-tight">{item.name}</h4>
                                <p className="text-white/60 text-xs tracking-widest uppercase font-black">Quantity: {item.quantity}</p>
                              </div>
                              <p className="text-white font-black tracking-tighter text-lg">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                              <MapPin className="w-4 h-4" />
                              <span className="text-[10px] uppercase font-black tracking-widest">Delivery Route</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium leading-relaxed">
                              Verified Address in {city || 'N/A'}
                            </p>
                          </div>
                          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                              <CardIcon className="w-4 h-4" />
                              <span className="text-[10px] uppercase font-black tracking-widest">Selected Protocol</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium leading-relaxed uppercase">
                              {paymentMethod} Processing
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5">
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 backdrop-blur-sm">
                    <h3 className="text-2xl font-display font-black text-white tracking-tighter mb-8">Order Summary</h3>

                    <div className="space-y-6 mb-10">
                      <div className="flex justify-between items-center group/line">
                        <span className="text-white/60 text-sm font-medium tracking-wide">Artifact Subtotal</span>
                        <div className="flex-1 border-b border-white/5 mx-4 border-dotted" />
                        <span className="text-white font-bold tabular-nums tracking-tight">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center group/line">
                        <span className="text-white/60 text-sm font-medium tracking-wide">Logistics & Handling</span>
                        <div className="flex-1 border-b border-white/5 mx-4 border-dotted" />
                        <Badge variant="outline" className="text-[10px] font-black tracking-[0.2em] border-primary/20 text-primary bg-primary/5 uppercase px-3">Complimentary</Badge>
                      </div>

                      <Separator className="bg-white/5" />

                      <div className="flex justify-between items-end pt-4">
                        <div className="space-y-1">
                          <span className="text-xs uppercase font-black tracking-[0.3em] text-white/50">Final Valuation</span>
                          <h4 className="text-white font-display text-base font-bold">Total Investment</h4>
                        </div>
                        <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full h-16 rounded-2xl bg-white text-black hover:bg-primary transition-all duration-500 font-black text-lg shadow-xl active:scale-[0.98] group/nav"
                        >
                          Next Phase
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-16 rounded-2xl bg-primary text-black hover:bg-white transition-all duration-500 font-black text-lg shadow-[0_0_40px_rgba(74,222,128,0.2)] disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing Securely...' : 'Authorize Transaction'}
                        </Button>
                      )}

                      <div className="flex items-center justify-center gap-2 text-white/50">
                        <Lock className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">End-to-End Encryption Active</span>
                      </div>
                    </div>

                    {/* Security Trust Vector */}
                    <div className="mt-12 p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight">Purchase Integrity</p>
                        <p className="text-[10px] text-white/60 leading-relaxed font-light">All acquisitions are protected by our elite buyer integrity protocol and 30-day seamless reconciliation policy.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
