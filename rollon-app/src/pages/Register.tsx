import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const processRegister = async (data: RegisterForm) => {
    const isRegistered = await registerUser(data.name, data.email, data.password);

    if (!isRegistered) {
      toast.error('Registration failed. Please try again with a different email.');
      return;
    }

    toast.success('Account created successfully.');
    navigate('/');
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
              Create <span className="gradient-text">Account</span>
            </h1>
            <p className="text-white/60">
              Join the RollON community today
            </p>
          </motion.div>
        </div>
      </section>

      {/* Register Form */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
            <form onSubmit={handleSubmit(processRegister)} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-white/60 text-sm mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    id="name"
                    {...register('name')}
                    type="text"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-white/60 focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-green-400/50'}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <span className="text-red-500 text-xs mt-1 block px-1">{errors.name.message}</span>}
              </div>

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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-white/60 text-sm mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-white/60 focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-green-400/50'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block px-1">{errors.confirmPassword.message}</span>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 mt-1 accent-green-400 rounded" />
                <span className="text-white/60 text-sm">
                  I agree to the{' '}
                  <Link to="/contact" className="text-green-400 underline underline-offset-2 hover:text-green-300">Terms of Service</Link>
                  <span className="text-white/60">and</span>{' '}
                  <Link to="/contact" className="text-green-400 underline underline-offset-2 hover:text-green-300">Privacy Policy</Link>
                </span>
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="text-center text-white/60 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 underline underline-offset-2 hover:text-green-300">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}