import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handled in AuthContext
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 sm:p-10 shadow-large border-white/[0.05] bg-card/80 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 flex items-center justify-center gap-2">
              Welcome Back <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg">
              Sign in to continue to <span className="text-primary font-semibold">SchoolChamps</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full group h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary-light shadow-glow transform hover:scale-[1.02] transition-all"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center">
              <a href="#" className="text-primary/80 hover:text-primary text-sm hover:underline transition-all">
                Forgot password?
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-foreground/60">
            Don't have an account?{' '}
            <a href="/register" className="text-[#10b981] font-semibold hover:underline">
              Register here
            </a>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <a href="/" className="text-foreground/40 hover:text-foreground text-sm flex items-center justify-center gap-2 transition-all">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to landing page
          </a>
        </div>
      </motion.div>
    </div>
  );
}
