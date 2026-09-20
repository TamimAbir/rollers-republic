import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Smoke Particle Component
function SmokeParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect user's reduced-motion preference (WCAG 2.3.3)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
      maxLife: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Fewer particles on mobile for performance
    const particleCount = window.innerWidth < 768 ? 12 : 25;

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 50,
        size: Math.random() * 80 + 40,
        speedY: Math.random() * 0.5 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.life++;
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.life * 0.01) * 0.2;

        // Fade in and out
        if (p.life < 50) {
          p.opacity = (p.life / 50) * 0.04;
        } else if (p.life > p.maxLife - 50) {
          p.opacity = ((p.maxLife - p.life) / 50) * 0.04;
        }

        // Reset particle
        if (p.life >= p.maxLife) {
          particles[index] = createParticle();
          return;
        }

        // Draw particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(245, 245, 245, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(245, 245, 245, ${p.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(245, 245, 245, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

// Gradient Orbs Component
function GradientOrbs() {
  return (
    <>
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-primary/10 to-cyan-400/10 rounded-full blur-[100px]"
        style={{ zIndex: 0 }}
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-emerald-400/10 rounded-full blur-[120px]"
        style={{ zIndex: 0 }}
      />
    </>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a] selection:bg-primary selection:text-black"
    >
      {/* Background Effects */}
      <SmokeParticles />
      <GradientOrbs />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.05),transparent_70%)]" />

      {/* Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 pt-32 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <Badge variant="outline" className="border-primary/30 text-primary py-1.5 px-4 bg-primary/5 uppercase tracking-[0.2em] text-[10px] font-bold">
                Level Up Your Lifestyle
              </Badge>
              <Badge className="bg-primary text-black font-black px-4 py-1.5 rounded-full animate-bounce shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                EID SPECIAL: 20% OFF
              </Badge>
              <div className="h-[1px] w-12 bg-primary/30" />
            </motion.div>

            {/* Headline */}
            <div className="relative group">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-black text-white leading-[0.85] tracking-tighter"
              >
                UNMATCHED <br />
                <span className="text-primary italic">PRECISION.</span> <br />
                <span className="text-white/50">PURE ART.</span>
              </motion.h1>

              {/* Decorative text */}
              <div className="absolute -top-10 -left-10 text-[12vw] font-black text-white/5 pointer-events-none select-none -z-10 uppercase">
                RollON
              </div>
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-white/60 max-w-lg leading-relaxed font-light"
            >
              Experience the pinnacle of craftmanship. Our limited-edition accessories combine futuristic materials with timeless design.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-6"
            >
              <Button asChild size="lg" className="rounded-full h-auto py-5 px-10 text-lg font-bold group shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-black">
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button asChild variant="ghost" size="lg" className="rounded-full h-auto py-5 px-8 text-white/60 hover:text-white hover:bg-white/5 border border-white/5">
                <Link to="/#categories">
                  <Play className="mr-2 w-4 h-4 fill-current" />
                  View Lookbook
                </Link>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/5"
            >
              {[
                { icon: Truck, text: 'Express Delivery', sub: 'Dhaka Metropolitan' },
                { icon: Shield, text: 'Lifetime Quality', sub: 'Genuine Materials' },
                { icon: Clock, text: '24/7 Support', sub: 'Expert Assistance' },
              ].map((badge) => (
                <div key={badge.text} className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <badge.icon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">{badge.text}</span>
                  </div>
                  <p className="text-[10px] text-white/60 ml-6 uppercase tracking-wider">{badge.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div
              style={{
                rotateY: mousePosition.x * 0.5,
                rotateX: -mousePosition.y * 0.5,
              }}
              className="relative z-10"
            >
              {/* Product Background Glow */}
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 animate-pulse" />

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-3xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl -z-10" />
                <picture>
                  <source srcSet="/images/hero-product.webp" type="image/webp" />
                  <img
                    src="/images/hero-product.jpg"
                    alt="RollON Premium Smoking Accessories"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-auto filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700"%3E%3Crect fill="%23111" width="600" height="700" rx="40"/%3E%3Ctext fill="%234ade80" font-family="sans-serif" font-size="32" font-weight="black" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EROLLON PREMIUM%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </picture>

                {/* Float Elements */}
                <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-white/10 backdrop-blur-md text-white border-white/20">
                    Hand-crafted
                  </Badge>
                  <Badge className="px-3 py-1 bg-primary text-black font-bold">
                    Pure Titanium
                  </Badge>
                </div>
              </motion.div>
            </motion.div>

            {/* Background Decorative Rings */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
              <div className="w-[120%] h-[120%] border border-white/5 rounded-full" />
              <div className="absolute w-[140%] h-[140%] border border-white/5 rounded-full" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
      >
        <div className="w-[1px] h-12 bg-gradient-to-t from-primary to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">Scroll Down</span>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
    </section>
  );
}