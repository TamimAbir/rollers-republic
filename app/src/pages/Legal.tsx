import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { siteConfig, ageNotice } from '@/lib/config';

function LegalShell({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1d] to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-sm font-medium text-primary tracking-widest uppercase mb-4">Legal</span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-10">
              {title} <span className="gradient-text">{accent}</span>
            </h1>
            <div className="space-y-6 text-white/60 leading-relaxed text-[15px]">{children}</div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-display font-bold text-white">{heading}</h2>
      {children}
    </section>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms of" accent="Service">
      <p>Last updated: September 2026. By using {siteConfig.name}&apos;s website, you agree to these terms.</p>
      <Section heading="1. Adult-use products">
        <p>
          {siteConfig.name} sells tobacco accessories and related products intended strictly for adults aged 18
          or older. By placing an order you confirm that you are at least 18 years of age. We may refuse sale or
          delivery at our discretion.
        </p>
      </Section>
      <Section heading="2. Orders and delivery">
        <p>
          Orders placed online are confirmed by phone ({siteConfig.phone}) before dispatch. Same-day delivery is
          available within Dhaka; nationwide delivery timelines vary. Delivery fees follow our published zone
          rates (Dhaka Metro ৳60, Dhaka Suburb ৳100, Outside Dhaka ৳150), free above ৳3,000.
        </p>
      </Section>
      <Section heading="3. Payments">
        <p>We accept bKash and Cash on Delivery. bKash instructions are provided after checkout confirmation.</p>
      </Section>
      <Section heading="4. Returns">
        <p>
          For hygiene and safety reasons, opened products cannot be returned. Unopened items may be returned
          within 3 days of delivery — contact us via {siteConfig.phone} or WhatsApp to arrange.
        </p>
      </Section>
      <Section heading="5. Contact">
        <p>
          Questions about these terms: {siteConfig.email} · {siteConfig.phone}. {siteConfig.address}.
        </p>
      </Section>
    </LegalShell>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy" accent="Policy">
      <p>Last updated: September 2026. Your privacy matters to us.</p>
      <Section heading="1. What we collect">
        <p>
          Order details you provide (name, phone, delivery address), and usage data such as pages visited. We do
          not sell your personal information to anyone.
        </p>
      </Section>
      <Section heading="2. How we use it">
        <p>
          To fulfil and confirm your orders, arrange delivery, and — with your consent — send occasional product
          news. Local storage on your device stores cart and age-verification state only.
        </p>
      </Section>
      <Section heading="3. Your choices">
        <p>
          You may request deletion of your data at any time via {siteConfig.phone} or our WhatsApp line. Clearing
          your browser storage removes locally saved data.
        </p>
      </Section>
      <Section heading="4. Contact">
        <p>Privacy questions: {siteConfig.email}</p>
      </Section>
    </LegalShell>
  );
}

export function AgePolicy() {
  return (
    <LegalShell title="Age" accent="Policy">
      <p className="text-white/80 font-medium">{ageNotice}</p>
      <Section heading="18+ only">
        <p>
          {siteConfig.name} products — rolling papers, blunts, waterpipes, vapes and accessories — are intended
          for adult tobacco users aged 18 and over. Every visitor must pass our age gate; delivery recipients may
          be asked to confirm age.
        </p>
      </Section>
      <Section heading="Responsible retail">
        <p>
          We promote responsible enjoyment and never market to minors. If you believe someone under 18 has
          accessed this site, please contact us at {siteConfig.phone} immediately.
        </p>
      </Section>
      <Section heading="Health notice">
        <p>Tobacco products are harmful to health. This shop sells accessories only and makes no health claims.</p>
      </Section>
      <p>
        <Link to="/" className="text-primary hover:underline underline-offset-4">← Back to the shop</Link>
      </p>
    </LegalShell>
  );
}
