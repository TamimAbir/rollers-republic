import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Printer, Share2, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function Success() {
    const [searchParams] = useSearchParams();
    // Order ID comes from the checkout flow via the URL query param.
    // Fall back to a fixed placeholder (avoid impure Date.now() during render).
    const orderId = searchParams.get('id') || 'RON-NEW';

    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        clearCart();
        window.scrollTo(0, 0);
    }, [clearCart]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'RollON Order Confirmation',
                    text: `Your RollON order ${orderId} is confirmed!`,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Order link copied to clipboard');
            }
        } catch {
            // User cancelled share — no-op
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 overflow-hidden relative">
            {/* Cinematic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full opacity-20" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full opacity-10" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center space-y-8"
                >
                    {/* Success Icon */}
                    <div className="relative inline-block">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                            className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(74,222,128,0.3)]"
                        >
                            <CheckCircle2 className="w-12 h-12 text-black stroke-[3px]" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4 border border-primary/20 rounded-[3rem] border-dashed"
                        />
                    </div>

                    <div className="space-y-4">
                        <Badge variant="outline" className="border-primary/20 text-primary py-1.5 px-6 text-[10px] font-black uppercase tracking-[0.4em] bg-primary/5 rounded-full">
                            Mission Accomplished
                        </Badge>
                        <h1 className="text-6xl sm:text-8xl font-display font-black text-white tracking-tighter italic leading-none">
                            ACQUISITION <span className="text-primary underline decoration-primary/20 underline-offset-8">SECURED.</span>
                        </h1>
                        <p className="text-white/60 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                            Your artifacts have been authenticated and added to the dispatch queue. A confirmation certificate has been sent to your terminal.
                        </p>
                    </div>

                    {/* Tactical Receipt Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 lg:p-16 backdrop-blur-3xl relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="grid md:grid-cols-2 gap-12 relative z-10 text-left">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-2 italic">Foundry Manifest ID</h3>
                                    <p className="text-3xl font-display font-black text-white tracking-tight tabular-nums">{orderId}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Status</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-sm font-bold text-primary uppercase tracking-widest">In Foundry</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Dispatch</h3>
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Global Priority</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 flex flex-col justify-between group-hover:bg-white/[0.05] transition-all duration-500">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <Package className="w-6 h-6 text-white/60" />
                                    </div>
                                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-1 italic">ETA Terminal</h3>
                                    <p className="text-2xl font-display font-black text-white tracking-tight uppercase">24 - 48 Hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <Button variant="ghost" onClick={handlePrint} className="text-white/60 hover:text-white gap-2 font-black tracking-widest text-[10px] uppercase h-12 px-6 bg-white/5 rounded-2xl">
                                    <Printer className="w-4 h-4" /> Print Receipt
                                </Button>
                                <Button variant="ghost" onClick={handleShare} className="text-white/60 hover:text-white gap-2 font-black tracking-widest text-[10px] uppercase h-12 px-6 bg-white/5 rounded-2xl">
                                    <Share2 className="w-4 h-4" /> Share Access
                                </Button>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-1 block italic underline decoration-primary/20">Authorized Security</span>
                                <p className="text-[9px] font-mono text-white/50 tracking-widest truncate max-w-[200px]">AUTH_SIG: B82X-091L-Z991-P011</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16"
                    >
                        <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-primary font-black px-12 h-16 text-lg italic uppercase tracking-tighter group transition-all shadow-2xl hover:shadow-primary/20 border-none">
                            <Link to="/shop" className="flex items-center gap-3">
                                Return to Shop <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="rounded-full text-white/60 hover:text-white font-bold h-16 px-10">
                            <Link to="/">Homepage Vision</Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative Brand Text */}
            <div className="absolute -bottom-20 -left-20 text-[20vw] font-display font-black text-white/[0.01] pointer-events-none select-none italic tracking-tighter">
                ROLLON.
            </div>
        </div>
    );
}