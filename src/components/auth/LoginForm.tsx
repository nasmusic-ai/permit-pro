import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Try demo credentials below.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] p-4">
      <Card className="w-full max-w-md shadow-xl animate-slide-up">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-[#1A237E] rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1A237E]">
              Welcome to BilisPermit
            </CardTitle>
            <CardDescription className="text-gray-600">
              Online Business Permit Application System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A237E]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 border-[#1A237E]/20 focus:border-[#1A237E] focus:ring-[#1A237E]"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1A237E]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 border-[#1A237E]/20 focus:border-[#1A237E] focus:ring-[#1A237E]"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#1A237E] font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-center text-gray-500 mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'applicant@demo.com';
                    passwordInput.value = 'demo123';
                  }
                }}
                className="p-2 bg-[#FFEB3B]/20 hover:bg-[#FFEB3B]/40 rounded text-[#1A237E] font-medium transition-colors"
              >
                Applicant
              </button>
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'staff@demo.com';
                    passwordInput.value = 'demo123';
                  }
                }}
                className="p-2 bg-[#FFEB3B]/20 hover:bg-[#FFEB3B]/40 rounded text-[#1A237E] font-medium transition-colors"
              >
                Staff
              </button>
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'treasurer@demo.com';
                    passwordInput.value = 'demo123';
                  }
                }}
                className="p-2 bg-[#FFEB3B]/20 hover:bg-[#FFEB3B]/40 rounded text-[#1A237E] font-medium transition-colors"
              >
                Treasurer
              </button>
              <button
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passwordInput) {
                    emailInput.value = 'admin@demo.com';
                    passwordInput.value = 'demo123';
                  }
                }}
                className="p-2 bg-[#FFEB3B]/20 hover:bg-[#FFEB3B]/40 rounded text-[#1A237E] font-medium transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
