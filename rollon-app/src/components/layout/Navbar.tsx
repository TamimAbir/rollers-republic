import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, LogOut, Settings, Globe, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PromoBanner } from './PromoBanner';

const navLinks = [
  { label: 'Collections', href: '/shop' },
  { label: 'Engineering', href: '/about' },
  { label: 'Support', href: '/contact' },
  { label: 'Featured', href: '/shop' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((state) => state.totalItems);
  const setIsCartOpen = useCartStore((state) => state.setCartOpen);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <PromoBanner />
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
          isScrolled
            ? 'bg-black/40 backdrop-blur-2xl border-b border-white/5 py-3'
            : 'bg-transparent py-4 top-10'
        )}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between">
            {/* Brand Identity */}
            <Link to="/" className="relative group flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-shadow group-hover:shadow-primary/50"
              >
                <div className="w-5 h-5 border-2 border-black rounded-full border-t-transparent animate-spin-slow" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-black text-white tracking-widest leading-none">
                  ROLL<span className="text-primary italic">ON</span>
                </span>
                <span className="text-[8px] font-black text-white/60 tracking-[0.4em] uppercase leading-none mt-1">Foundry Excellence</span>
              </div>
            </Link>

            {/* Elite Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                >
                  <Link
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    className={cn(
                      'relative group text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500',
                      location.pathname === link.href ? 'text-primary' : 'text-white/60 hover:text-white'
                    )}
                  >
                    {link.label}
                    <span className={cn(
                      "absolute -bottom-2 left-0 h-[2px] bg-primary transition-all duration-500",
                      location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    )} />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Cart & Search */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                  className="w-12 h-12 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <Search className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Open shopping cart"
                  className="relative w-12 h-12 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] font-black text-black flex items-center justify-center border-2 border-black"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>

                {isAuthenticated ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="w-12 h-12 rounded-2xl p-1 text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all overflow-hidden"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </Button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsUserMenuOpen(false)}
                            onKeyDown={(e) => e.key === 'Escape' && setIsUserMenuOpen(false)}
                            role="button"
                            tabIndex={0}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 p-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-white/10 mb-2">
                              <p className="text-[10px] font-black tracking-widest text-white/50 uppercase mb-1">Signed in as</p>
                              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                              <p className="text-xs text-white/60 truncate">{user?.email}</p>
                            </div>

                            <Link
                              to="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors mb-1"
                            >
                              <Settings className="w-4 h-4" />
                              Account Settings
                            </Link>

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    aria-label="Go to login page"
                    className="hidden sm:inline-flex w-12 h-12 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  >
                    <Link to="/login">
                      <User className="w-5 h-5" />
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden w-12 h-12 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Cinematic Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-8">
              <span className="text-xl font-display font-black text-white tracking-widest">MENU</span>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 rounded-2xl text-white/60">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 px-8 py-12 space-y-8 flex flex-col justify-center">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-end gap-4"
                  >
                    <span className="text-[10px] font-black text-primary mb-2">0{index + 1}</span>
                    <span className="text-5xl font-display font-black text-white group-hover:text-primary transition-colors tracking-tighter uppercase italic">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/60">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Dispatch</span>
              </div>
              <Button asChild className="rounded-full bg-white text-black font-black px-8">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tactical Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[70] bg-black/80 flex flex-col p-8 sm:p-12 lg:p-24"
          >
            <div className="flex justify-end mb-24">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="w-16 h-16 rounded-3xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>

            <div className="max-w-5xl w-full mx-auto">
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Search Engine v4.0</span>
                  </div>
                  <h2 className="text-6xl sm:text-8xl font-display font-black text-white tracking-tighter leading-none italic uppercase">
                    Locate <span className="text-white/60">Artifacts.</span>
                  </h2>
                </div>

                <div className="relative group">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 text-white/30 group-focus-within:text-primary transition-all duration-500" />
                  <form onSubmit={handleSearchSubmit} className="w-full">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="VAPORIZERS / GRINDERS / ROLLING PAPERS / BONGS / OCB"
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                      className="w-full pl-24 pr-12 py-12 rounded-[2.5rem] bg-white/[0.03] border-white/10 text-3xl h-auto placeholder:text-white/[0.05] focus:border-primary/50 focus:bg-white/[0.05] transition-all font-display font-black tracking-tight"
                    />
                  </form>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-12">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] w-full mb-2">Trending Products:</span>
                  {['Vaporizers', 'Grinders', 'Rolling Papers', 'Bongs', 'OCB'].map((tag) => (
                    <Link
                      key={tag}
                      to={`/shop?search=${encodeURIComponent(tag)}`}
                      aria-current={location.pathname === '/shop' ? "page" : undefined}
                      className={cn("rounded-full bg-white/5 border-white/5 hover:border-primary/40 text-white/60 hover:text-primary px-8 py-6 h-auto transition-all font-black text-xs tracking-widest uppercase")}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}