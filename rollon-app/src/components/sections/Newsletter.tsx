import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Check, Sparkles, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WHATSAPP_NUMBER = '8801870489448';

export function Newsletter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const text = [
      `New RollON newsletter subscriber!`,
      ``,
      `Email: ${email}`,
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#050505] overflow-hidden"
    >
      {/* Premium Background: Mesh + Grid + Radial Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50 transition-opacity duration-1000" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative group p-12 lg:p-20 rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
            {/* Animated border inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />

            <div className="relative z-10 text-center space-y-8">
              {/* Header Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <Badge variant="outline" className="border-primary/20 text-primary py-1 px-4 tracking-[0.2em] font-bold text-[10px] uppercase bg-primary/5">
                  The Inner Circle
                </Badge>
              </motion.div>

              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white leading-none tracking-tighter"
                >
                  UNLOCK THE <br />
                  <span className="text-primary italic">FUTURE.</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-white/60 text-lg max-w-xl mx-auto font-light"
                >
                  Subscribe to receive drop alerts, engineering deep-dives, and exclusive member-only pricing.
                </motion.p>
              </div>

              {/* Form implementation */}
              <motion.form
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="relative max-w-md mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within/input:text-primary transition-colors" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ACCESS KEY (EMAIL)"
                      disabled={isSubmitted}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-14 pl-12 rounded-2xl focus-visible:ring-primary/20 transition-all font-mono text-xs tracking-widest uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitted || !email}
                    className="h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all duration-500 shadow-xl shadow-primary/10 active:scale-95 group/btn"
                  >
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        ACCESS GRANTED
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        INITIALIZE
                        <Send className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </div>

                <p className="mt-6 text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">
                  ENCRYPTED TRANSMISSION • ZERO SPAM POLICY
                </p>
              </motion.form>

              {/* Floating background elements for depth */}
              <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}