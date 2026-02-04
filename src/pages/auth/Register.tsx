import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
    role: 'school' as UserRole,
  });
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For school role, pass schoolName as schoolId parameter (backend will create school)
      const schoolIdOrName = formData.role === 'school' ? formData.schoolName : undefined;
      await register(formData.name, formData.email, formData.password, formData.role, schoolIdOrName);
      navigate('/dashboard');
    } catch (error) {
      // Error handled in AuthContext
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md my-8"
      >
        <Card className="p-10 shadow-large border-white/[0.05] bg-card/80 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Join <span className="text-primary">SchoolChamps</span></h1>
            <p className="text-muted-foreground text-lg">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80 font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground/80 font-medium">Account Type</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="h-12 bg-background/50 border-white/[0.05]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/[0.05]">
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="writer">Writer</SelectItem>
                  <SelectItem value="marketer">Digital Marketer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'school' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="schoolName" className="text-foreground/80 font-medium">School Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="schoolName"
                    placeholder="Demo High School"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="pl-12 h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-light shadow-glow transform hover:scale-[1.02] transition-all mt-4" size="lg" disabled={isLoading}>
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-foreground/60">
            Already have an account?{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
