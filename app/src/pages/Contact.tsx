import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { siteConfig } from '@/lib/config';

const WHATSAPP_NUMBER = siteConfig.social.whatsapp?.split('/').pop() ?? '';

const contactInfo = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    lines: [siteConfig.phone],
    href: siteConfig.social.whatsapp,
    linkLabel: 'Chat with us',
  },
  {
    icon: Mail,
    title: 'Email',
    lines: [siteConfig.email],
  },
  {
    icon: MapPin,
    title: 'Flagship Outlet',
    lines: [siteConfig.outlets[0].address],
  },
  {
    icon: Clock,
    title: 'Hours',
    lines: ['Mon - Sat: 10AM - 8PM', 'Sunday: 12PM - 6PM'],
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const text = [
      `Hi Rollers Republic!`,
      ``,
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Subject: ${formData.subject}`,
      ``,
      formData.message,
    ].join('\n');

    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');

    // Reset after a brief delay
    setTimeout(() => {
      setIsSending(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

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
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-lg text-white/60">
              Have a question or need assistance? We&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Outlets */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pb-4">
        <div className="grid sm:grid-cols-2 gap-6">
          {siteConfig.outlets.map((outlet, i) => (
            <motion.div
              key={outlet.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                <h2 className="text-white font-display font-semibold text-lg">{outlet.name}</h2>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{outlet.address}</p>
              <a
                href={outlet.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-amber-300 transition-colors"
              >
                Get directions →
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((item) => (
              <div key={item.title} className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-white font-display font-semibold mb-2">{item.title}</h3>
                {item.lines.map((line) => (
                  <p key={line} className="text-white/60">{line}</p>
                ))}
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-primary hover:text-amber-300 transition-colors"
                  >
                    {item.linkLabel} →
                  </a>
                )}
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-display font-semibold text-white mb-6">
                Send us a Message
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Messages open directly in WhatsApp — the fastest way to reach us.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-white/60 text-sm mb-2">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-primary/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-white/60 text-sm mb-2">Your Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-primary/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-white/60 text-sm mb-2">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-primary/50"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-white/60 text-sm mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-primary/50 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSending}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-amber-500 rounded-full text-black font-semibold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Opening WhatsApp...' : 'Send via WhatsApp'}
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}