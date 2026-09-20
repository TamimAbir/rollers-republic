import { Link } from 'react-router-dom';
import { Facebook, MessageCircle, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { siteConfig, ageNotice } from '@/lib/config';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Best Sellers', href: '/shop?sort=popular' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Delivery Info', href: '/contact' },
    { label: 'Age Policy', href: '/age-policy' },
  ],
  company: [
    { label: 'Our Story', href: '/about' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: siteConfig.social.facebook ?? '/', label: 'Facebook' },
  { icon: MessageCircle, href: siteConfig.social.whatsapp ?? '/', label: 'WhatsApp' },
  { icon: Phone, href: `tel:${siteConfig.phone}`, label: `Call ${siteConfig.phone}` },
];

export function Footer() {
  return (
    <footer className="relative bg-[#050505] pt-32 pb-12 overflow-hidden border-t border-white/5">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] opacity-20 pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">
          {/* Brand Vision */}
          <div className="lg:col-span-4 space-y-10">
            <Link to="/" className="inline-block">
              <span className="text-4xl font-display font-black text-white tracking-tighter">
                Rollers<span className="text-primary"> Republic</span>
              </span>
            </Link>

            <p className="text-white/60 text-lg leading-relaxed max-w-sm font-light">
              Bangladesh’s pioneering headshop since 2013. 100% authentic rolling papers, waterpipes,
              bongs and vapes — imported from the UK, delivered to your doorstep.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60 transition-all duration-300 hover:border-primary/30"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <ul className="space-y-3">
              {siteConfig.outlets.map((outlet) => (
                <li key={outlet.name} className="flex items-start gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="font-bold text-white/80">{outlet.name}:</span> {outlet.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-8">Shop</h3>
                <ul className="space-y-4">
                  {footerLinks.shop.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-white/60 hover:text-primary transition-colors text-sm flex items-center group"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-2 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-8">Support</h3>
                <ul className="space-y-4">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-white/60 hover:text-primary transition-colors text-sm flex items-center group"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-2 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-8">Company</h3>
                <ul className="space-y-4">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-white/60 hover:text-primary transition-colors text-sm flex items-center group"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-2 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5 mb-12" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
              {siteConfig.footerText}
            </p>
            <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold">
              <ShieldCheck className="h-3 w-3 text-primary/40" />
              SECURED BY ENTERPRISE ENCRYPTION
            </div>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/privacy" className="text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
            <Link to="/terms" className="text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Terms</Link>
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-colors"
            >
              ORDER: <span className="text-primary">WHATSAPP</span>
            </a>
          </div>
        </div>

        {/* Adult-use compliance notice (SSOT §9.3) */}
        <p className="text-center text-white/60 text-xs leading-relaxed max-w-3xl mx-auto pb-8">{ageNotice}</p>
      </div>

      {/* Bottom Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-amber-500 to-primary/20 opacity-50" />
    </footer>
  );
}
