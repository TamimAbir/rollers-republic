import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig, features } from '@/lib/config';

const STORAGE_KEY = 'rr-age-verified';

type GateState = 'checking' | 'locked' | 'denied' | 'verified';

function readStoredConsent(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'yes';
  } catch {
    return false;
  }
}

/**
 * AgeGate — mandatory 18+ verification modal (SSOT §9.1).
 * Blocks the app until the visitor confirms they are of legal age.
 * Consent persists in localStorage. Gated by `features.ageGate`.
 */
export function AgeGate() {
  // Lazy init: resolve consent synchronously (CSR-only app) so verified
  // visitors never see a gate flash. No effect-setState (react-hooks rule).
  const [state, setState] = useState<GateState>(() =>
    !features.ageGate || readStoredConsent() ? 'verified' : 'locked',
  );

  useEffect(() => {
    if (state !== 'locked') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [state]);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // Private mode — consent for this session only
    }
    setState('verified');
  };

  const deny = () => setState('denied');

  if (state === 'verified' || state === 'checking') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="age-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-description"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full bg-[#111] border border-primary/25 rounded-3xl p-10 text-center shadow-2xl shadow-primary/10"
        >
          {state === 'locked' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h2 id="age-gate-title" className="text-3xl font-display font-black text-white mb-4 tracking-tight">
                Are you 18 <span className="text-primary italic">or older?</span>
              </h2>
              <p id="age-gate-description" className="text-white/60 leading-relaxed mb-8">
                {siteConfig.name} sells tobacco accessories intended for adults only. Please verify
                your age to enter.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- modal dialog: move focus to the primary action
                  autoFocus
                  onClick={confirm}
                  className="w-full rounded-full bg-primary text-black font-black py-6 h-auto hover:bg-primary/90"
                >
                  Yes — I&apos;m 18 or older
                </Button>
                <Button
                  variant="ghost"
                  onClick={deny}
                  className="w-full rounded-full text-white/60 hover:text-white hover:bg-white/5 py-6 h-auto"
                >
                  No — take me out of here
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 id="age-gate-title" className="text-2xl font-display font-black text-white mb-4 tracking-tight">
                Come back <span className="text-primary italic">when you&apos;re 18.</span>
              </h2>
              <p id="age-gate-description" className="text-white/60 leading-relaxed mb-8">
                This shop is for adults only. Thanks for your honesty — see you in a few years.
              </p>
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-white/60 hover:text-white hover:bg-white/5 px-8"
              >
                <a href="https://www.google.com">Leave this site</a>
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
