
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema, type AuthFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  isSignUp?: boolean;
  onSubmit: (data: AuthFormValues) => Promise<any>;
}

export function AuthForm({ isSignUp = false, onSubmit }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(data);
      // Success handling (e.g., redirect) is managed by the calling page/context
    } catch (e: any) {
      setError(e.message || (isSignUp ? 'Sign up failed.' : 'Sign in failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          {isSignUp ? <UserPlus className="mr-2 h-6 w-6 text-primary" /> : <LogIn className="mr-2 h-6 w-6 text-primary" />}
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </CardTitle>
        <CardDescription>
          {isSignUp ? 'Enter your email and password to sign up.' : 'Enter your credentials to access your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            )}
            
            {form.formState.errors.root && (
                 <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{form.formState.errors.root.message}</p>
                </div>
            )}


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Processing...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <Link href="/auth/signin" legacyBehavior>
                <a className="font-medium text-primary hover:underline">Sign In</a>
              </Link>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" legacyBehavior>
                <a className="font-medium text-primary hover:underline">Sign Up</a>
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
