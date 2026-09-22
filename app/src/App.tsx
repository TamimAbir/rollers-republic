import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { AgeGate } from '@/components/layout/AgeGate';
import { DegradedModeBanner } from '@/components/layout/DegradedModeBanner';
import { CartDrawer } from '@/components/CartDrawer';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { Toaster } from 'sonner';

import { PageTransition } from '@/components/layout/PageTransition';
import { AnimatePresence } from 'framer-motion';

const withTransition = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <PageTransition>
    <Component />
  </PageTransition>
);

const Home = React.lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Shop = React.lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetail = React.lazy(() => import('@/pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = React.lazy(() => import('@/pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = React.lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const About = React.lazy(() => import('@/pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));
const Login = React.lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const Account = React.lazy(() => import('@/pages/Account').then(m => ({ default: m.Account })));
const Success = React.lazy(() => import('@/pages/Success'));
const NotFound = React.lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
const Terms = React.lazy(() => import('@/pages/Legal').then(m => ({ default: m.Terms })));
const Privacy = React.lazy(() => import('@/pages/Legal').then(m => ({ default: m.Privacy })));
const AgePolicy = React.lazy(() => import('@/pages/Legal').then(m => ({ default: m.AgePolicy })));

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollToTop />
      <AgeGate />
      <Navbar />
      <DegradedModeBanner />
      <CartDrawer />
      <Toaster position="top-right" expand={false} richColors />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={withTransition(Home)} />
              <Route path="/shop" element={withTransition(Shop)} />
              <Route path="/product/:slug" element={withTransition(ProductDetail)} />
              <Route path="/cart" element={withTransition(Cart)} />
              <Route path="/checkout" element={withTransition(Checkout)} />
              <Route path="/about" element={withTransition(About)} />
              <Route path="/contact" element={withTransition(Contact)} />
              <Route path="/login" element={withTransition(Login)} />
              <Route path="/register" element={withTransition(Register)} />
              <Route path="/account" element={withTransition(Account)} />
              <Route path="/success" element={withTransition(Success)} />
              <Route path="/terms" element={withTransition(Terms)} />
              <Route path="/privacy" element={withTransition(Privacy)} />
              <Route path="/age-policy" element={withTransition(AgePolicy)} />
              <Route path="*" element={withTransition(NotFound)} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
