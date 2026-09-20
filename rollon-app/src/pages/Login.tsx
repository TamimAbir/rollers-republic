import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const processLogin = async (data: LoginForm) => {
    const isLoggedIn = await login(data.email, data.password);

    if (!isLoggedIn) {
      toast.error('Unable to sign in. Please verify your credentials and try again.');
      return;
    }

    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    navigate(returnTo && returnTo.startsWith('/') ? returnTo : '/');
    toast.success('Signed in successfully.');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1d1d] to-transparent" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-white/60">
              Sign in to access your account and orders
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login Form */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
            <form onSubmit={handleSubmit(processLogin)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white/60 text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-white/60 focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-green-400/50'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs mt-1 block px-1">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-white/60 text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder:text-white/60 focus:outline-none transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-green-400/50'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1 block px-1">{errors.password.message}</span>}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-green-400 rounded" />
                  <span className="text-white/60 text-sm">Remember me</span>
                </label>
                <Link to="/contact" className="text-green-400 text-sm hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Register Link */}
            <p className="text-center text-white/60 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-400 underline underline-offset-2 hover:text-green-300">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}