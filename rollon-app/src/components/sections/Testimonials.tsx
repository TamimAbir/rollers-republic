import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, Heart, Check } from 'lucide-react';
import { useTestimonials } from '@/hooks';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: testimonials = [], isLoading } = useTestimonials();

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading || testimonials.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-48 bg-[#050505] overflow-hidden"
    >
      {/* Background Dynamics */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] opacity-10 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[150px] opacity-10" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary py-1.5 px-6 text-[10px] font-black uppercase tracking-[0.3em] bg-primary/5 rounded-full">
              Community Integrity
            </Badge>
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter leading-[0.9] mb-8">
              Verified <span className="text-primary italic">Perspectives.</span>
            </h2>
            <p className="text-white/60 text-xl font-light leading-relaxed max-w-2xl">
              Authentic feedback from our elite circle of enthusiasts. Precision, aesthetics, and performance validated by the community.
            </p>
          </motion.div>
        </div>

        {/* Cinematic Testimonial Display */}
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8">
            <div className="relative min-h-[500px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <div className="group relative bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 lg:p-16 backdrop-blur-3xl shadow-2xl">
                    <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.03] pointer-events-none" />

                    <div className="space-y-10 relative z-10">
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-5 h-5 transition-colors duration-500",
                              i < testimonials[currentIndex].rating
                                ? 'text-primary fill-primary shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                                : 'text-white/30 fill-white/30'
                            )}
                          />
                        ))}
                      </div>

                      <p className="text-3xl lg:text-4xl font-display font-bold text-white leading-tight tracking-tight">
                        &ldquo;{testimonials[currentIndex].quote}&rdquo;
                      </p>

                      <div className="flex items-center gap-6 pt-10 border-t border-white/5">
                        <div className="relative">
                          <img
                            src={testimonials[currentIndex].avatar}
                            alt={testimonials[currentIndex].name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Ccircle fill="%23111" cx="40" cy="40" r="40"/%3E%3C/svg%3E`;
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary border-4 border-[#050505] flex items-center justify-center">
                            <Check className="w-4 h-4 text-black stroke-[3px]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-display font-black text-white tracking-tight">
                            {testimonials[currentIndex].name}
                          </h3>
                          <span className="text-sm text-primary font-bold uppercase tracking-widest">Verified Collector</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Why Choose Us</h3>
              <div className="space-y-4">
                {[
                  { label: 'Satisfaction Rate', value: '98%', icon: ShieldCheck },
                  { label: 'Happy Customers', value: '+2.4k', icon: TrendingUp },
                  { label: 'Rating', value: '4.9/5', icon: Heart }
                ].map((stat) => (
                  <div key={stat.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/stat">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover/stat:bg-primary group-hover/stat:text-black transition-all duration-500">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-white/60">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter tabular-nums">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                aria-label="Previous testimonial"
                className="h-16 w-16 rounded-2xl bg-white/[0.03] border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                aria-label="Next testimonial"
                className="h-16 w-16 rounded-2xl bg-white/[0.03] border-white/10 hover:border-primary/50 text-white/60 hover:text-white transition-all shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={cn(
                      "h-6 w-6 flex items-center justify-center transition-all duration-700 rounded-full",
                      index === currentIndex ? "bg-primary" : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "block rounded-full transition-all",
                      index === currentIndex ? "w-3 h-3 bg-black" : "w-1.5 h-1.5 bg-white/40"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Additional icons needed for the stats above
function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}