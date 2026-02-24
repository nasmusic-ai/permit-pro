import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem('token', result.token); // store JWT
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password.');
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
          <div className="mx-auto w-15 h-15 bg-[#1A237E] rounded-full flex items-center justify-center">
            <img
              src="https://github.com/nasmusic-ai/RAW/blob/main/Permit-pro.png?raw=true"
              alt="Building Icon"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1A237E]">
              Welcome to Permit PRO
            </CardTitle>
            <CardDescription className="text-gray-600">
              Online Municipal Business Permit Application System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" {...register('email')} />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-[#1A237E] hover:underline">
              Register here
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}