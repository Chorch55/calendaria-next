"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic with Supabase
    console.log({ email, password });
    toast({
      title: "Login Successful",
      description: "Welcome back! Redirecting to your dashboard...",
    });
    // Simulate successful login and redirect
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Log in to access your CalendarIA dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
              </div> */}
              <Link href="/auth/forgot-password" passHref>
                <Button variant="link" type="button" className="p-0 text-sm h-auto text-primary">Forgot password?</Button>
              </Link>
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
