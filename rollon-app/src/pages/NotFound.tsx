import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PARTICLES = [
  { left: 15, top: 25, duration: 3.5, delay: 0.2 },
  { left: 85, top: 15, duration: 4.2, delay: 0.5 },
  { left: 45, top: 75, duration: 2.8, delay: 0.8 },
  { left: 25, top: 65, duration: 5.1, delay: 0.1 },
  { left: 75, top: 45, duration: 3.9, delay: 1.2 },
  { left: 10, top: 90, duration: 4.5, delay: 0.4 },
  { left: 90, top: 80, duration: 3.2, delay: 0.7 },
  { left: 60, top: 20, duration: 4.8, delay: 1.5 },
  { left: 35, top: 40, duration: 3.6, delay: 0.3 },
  { left: 55, top: 60, duration: 4.1, delay: 0.9 },
  { left: 20, top: 10, duration: 3.4, delay: 1.1 },
  { left: 80, top: 70, duration: 4.7, delay: 0.6 },
  { left: 50, top: 50, duration: 3.1, delay: 0.2 },
  { left: 5, top: 35, duration: 4.4, delay: 1.4 },
  { left: 95, top: 55, duration: 3.7, delay: 0.5 },
  { left: 30, top: 85, duration: 4.9, delay: 0.8 },
  { left: 70, top: 30, duration: 2.9, delay: 0.1 },
  { left: 40, top: 15, duration: 4.3, delay: 1.3 },
  { left: 65, top: 95, duration: 3.8, delay: 0.4 },
];

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      
      {/* Animated Void Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[128px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-[12rem] md:text-[16rem] font-bold text-primary/20 leading-none tracking-tighter"
            animate={{
              textShadow: [
                "0 0 20px rgba(var(--primary-rgb), 0.3)",
                "0 0 40px rgba(var(--primary-rgb), 0.5)",
                "0 0 20px rgba(var(--primary-rgb), 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Floating Particles Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Lost in the <span className="text-primary italic">Void</span>
          </h2>
        </motion.div>

        <motion.p
          className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          The page you're seeking has drifted beyond the horizon. 
          Perhaps it's exploring new dimensions?
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            asChild
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link to="/">
              <Home className="h-5 w-5" />
              Return Home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10"
          >
            <Link to="/shop">
              <ArrowLeft className="h-5 w-5" />
              Browse Collection
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </div>
  );
}

export default NotFound;

