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

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Automatically log in
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const loginResult = await loginRes.json();
        if (loginRes.ok && loginResult.token) {
          localStorage.setItem('token', loginResult.token);
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] p-4">
      <Card className="w-full max-w-lg shadow-xl animate-slide-up">
        <CardHeader className="space-y-4">
          <CardTitle>Create an Account</CardTitle>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="First Name" {...register('firstName')} />
            {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}

            <Input placeholder="Last Name" {...register('lastName')} />
            {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}

            <Input placeholder="Email" {...register('email')} />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

            <Input placeholder="Phone" {...register('phone')} />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}

            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
            </div>
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}

            <div className="relative">
              <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}

            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create Account'}</Button>
          </form>
          <p className="text-center text-sm mt-2">
            Already have an account? <button onClick={() => navigate('/login')} className="text-[#1A237E] hover:underline">Sign in</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}