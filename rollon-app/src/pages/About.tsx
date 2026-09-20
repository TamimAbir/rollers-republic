import { motion } from 'framer-motion';
import { Award, Package, MapPin, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

const stats = [
  { icon: Package, value: '50+', label: 'Curated Products' },
  { icon: MapPin, value: 'Dhaka', label: 'City-Wide Delivery' },
  { icon: ShieldCheck, value: '100%', label: 'Secure Checkout' },
  { icon: Award, value: '24h', label: 'Dispatch Time' },
];

const values = [
  {
    title: 'Quality First',
    description: 'We source only the finest products from trusted manufacturers worldwide. Every item in our collection meets our rigorous quality standards.',
  },
  {
    title: 'Customer Focus',
    description: 'Your satisfaction is our priority. Our dedicated support team is always ready to help you find the perfect product.',
  },
  {
    title: 'Fast Delivery',
    description: 'We understand the importance of timely delivery. That\'s why we offer same-day delivery in Dhaka and quick shipping nationwide.',
  },
  {
    title: 'Secure Shopping',
    description: 'Shop with confidence. Our secure payment systems and buyer protection ensure your transactions are always safe.',
  },
];

export function About() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1d] to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-sm font-medium text-green-400 tracking-widest uppercase mb-4">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              About <span className="gradient-text">RollON</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Founded in 2020, RollON has grown to become Bangladesh&apos;s premier destination for premium smoking accessories. We believe in elevating experiences through quality products and exceptional service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-white/5 rounded-2xl border border-white/5"
            >
              <stat.icon className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
              Our <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              At RollON, our mission is simple: to provide enthusiasts with access to the world&apos;s finest smoking accessories. We carefully curate our collection to ensure every product meets our exacting standards of quality, design, and functionality.
            </p>
            <p className="text-white/60 text-lg leading-relaxed">
              We&apos;re not just selling products; we&apos;re building a community of discerning individuals who appreciate the finer things in life. From premium grinders to state-of-the-art vaporizers, every item in our store is chosen with care.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-display font-bold gradient-text mb-4">RollON</div>
                <div className="text-white/60">Elevate Your Experience</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-16 bg-[#111]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Our <span className="gradient-text">Values</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-green-400/30 transition-colors"
            >
              <h3 className="text-xl font-display font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-white/60 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}