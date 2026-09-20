import { motion } from 'framer-motion';
import { User, Mail, Shield, Package, MapPin, CreditCard, LogOut, ChevronRight, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Footer } from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Account() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} is coming soon`);
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track, return or buy things again', color: 'text-blue-400' },
    { icon: Shield, label: 'Login & Security', description: 'Edit login, name, and mobile number', color: 'text-green-400' },
    { icon: MapPin, label: 'Your Addresses', description: 'Edit addresses for orders', color: 'text-purple-400' },
    { icon: CreditCard, label: 'Payment Options', description: 'Edit or add payment methods', color: 'text-orange-400' },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1d] to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl bg-white/5">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>
                <button
                  aria-label="Change profile picture"
                  onClick={() => handleComingSoon('Profile photo upload')}
                  className="absolute -right-2 -bottom-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-2">
                  Hello, <span className="gradient-text">{user.name.split(' ')[0]}!</span>
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm capitalize">{user.role} Account</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Account Content */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleComingSoon(item.label)}
                className="group flex items-start gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-white/20 transition-all text-left"
              >
                <div className={`p-4 bg-white/5 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-between">
                    {item.label}
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50">{item.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-display font-black text-white mb-2">Member Rewards</h3>
                <p className="text-white/60 text-sm max-w-md">
                  Order history, loyalty points, and exclusive member perks are on the way. Your orders are saved with your account.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-5 py-2.5 bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white/80 uppercase tracking-widest">
                  Coming Soon
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}