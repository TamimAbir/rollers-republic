import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Truck, HeadphonesIcon, CreditCard, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Award,
    title: 'Heritage Quality',
    description: 'Each piece is hand-inspected for structural integrity and aesthetic perfection.',
  },
  {
    icon: Truck,
    title: 'Rapid Deployment',
    description: 'Same-day delivery in Dhaka Metro. Global tracking for every single order.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Concierge Support',
    description: 'Expert guidance from enthusiasts who know the lifestyle inside out.',
  },
  {
    icon: CreditCard,
    title: 'Secure Integrity',
    description: 'Military-grade encryption for every transaction. Your privacy is paramount.',
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          {/* Left - Visual Storytelling */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

              <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0d0d0d] p-3 shadow-2xl">
                <motion.img
                  src="/images/features-lifestyle.jpg"
                  alt="Craftsmanship"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-auto rounded-[1.5rem] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700"%3E%3Crect fill="%23111" width="600" height="700"/%3E%3Ctext fill="%234ade80" font-family="sans-serif" font-size="24" font-weight="black" x="50%25" y="50%25" text-anchor="middle"%3EENGINEERING EXCELLENCE%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Floating Achievement Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ delay: 1, type: 'spring', stiffness: 100 }}
                className="absolute -bottom-10 right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl flex items-center gap-4 group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">10K+</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Trusted Reviews</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1 px-4 tracking-[0.3em] font-bold text-[10px] uppercase">
                  The RollON Standard
                </Badge>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-tight tracking-tighter"
              >
                CRAFTED FOR THE <br />
                <span className="text-white/50">ELITE ENTHUSIAST.</span>
              </motion.h2>
            </div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                >
                  <Card className="bg-transparent border-none group hover:bg-white/[0.02] transition-colors rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                            <feature.icon className="h-6 w-6 text-white/60 group-hover:text-primary transition-colors" />
                          </div>
                          {/* Step number decorator */}
                          <span className="absolute -top-2 -right-2 text-[10px] font-black text-white/40 group-hover:text-primary/30 transition-colors">
                            0{index + 1}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Ambient SVG */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none -z-10 opacity-30">
        <svg viewBox="0 0 400 800" className="h-full w-full">
          <motion.path
            d="M400,0 Q300,400 400,800"
            fill="none"
            stroke="url(#feature-grad)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="feature-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
              <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}