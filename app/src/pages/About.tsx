import { motion } from 'framer-motion';
import { Award, Store, MapPin, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

const stats = [
  { icon: Award, value: '2013', label: 'Established in Dhaka' },
  { icon: Store, value: '2', label: 'Outlets — Dhanmondi & Mirpur' },
  { icon: ShieldCheck, value: '100%', label: 'Authentic, Imported from UK' },
  { icon: MapPin, value: 'Same-Day', label: 'Delivery Across Dhaka' },
];

const values = [
  {
    title: 'Authenticity, Guaranteed',
    description:
      'Every paper, bong and vape on our shelves is 100% authentic and imported from trusted UK suppliers. RAW, Elements, Juicy Jays, OCB, Roor — you name it, you get it.',
  },
  {
    title: 'The Brotherhood',
    description:
      'Rollers Republic began as a promise between friends: to make original, quality products accessible and affordable for every roller in Bangladesh. That community-first spirit still runs the shop today.',
  },
  {
    title: 'Pioneering the Scene',
    description:
      'We pioneered the headshop concept in this region — curating premium smoking accessories long before it was mainstream, and educating customers on quality and responsible use along the way.',
  },
  {
    title: 'Responsible Retail',
    description:
      'Our products are intended for adults 18+ only. We promote responsible enjoyment and never compromise on who we sell to.',
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
            <span className="inline-block text-sm font-medium text-primary tracking-widest uppercase mb-4">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              The Origins of <span className="gradient-text">Rollers Republic</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Established in the heart of Dhaka in 2013, Rollers Republic pioneered the headshop
              concept in Bangladesh — a well-curated space where enthusiasts find premium, authentic
              smoking accessories and a community that welcomes them.
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
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
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
              The founders saw a gap: passionate smokers in Bangladesh had nowhere to buy genuine,
              quality products. So they built the republic — a place where every item, from
              hand-picked glass pieces to organic rolling papers, meets a standard worth trusting.
            </p>
            <p className="text-white/60 text-lg leading-relaxed">
              More than a shop, Rollers Republic is a brotherhood of rollers. We source from local
              artisans and international brands alike, support the community that supports us, and
              deliver to your doorstep — same day, across Dhaka.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-amber-400/20 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-display font-bold gradient-text mb-4 leading-tight">
                  Rollers
                  <br />
                  Republic
                </div>
                <div className="text-white/60">Est. 2013 · Dhaka</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-16 bg-[#111]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            What We <span className="gradient-text">Stand For</span>
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
              className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors"
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
