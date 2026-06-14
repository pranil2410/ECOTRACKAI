'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Leaf, ArrowRight, Mail, Lock, User, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { DEMO_CREDENTIALS } from '../../lib/demoConfig';

// Zod schemas for input validation
const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
});

const signupSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters long'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;
type SignupFormValues = zod.infer<typeof signupSchema>;

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Set default tab from query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // React Hook Forms setup
  const { 
    register: registerLogin, 
    handleSubmit: handleSubmitLogin, 
    setValue: setLoginValue,
    formState: { errors: loginErrors } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const { 
    register: registerSignup, 
    handleSubmit: handleSubmitSignup, 
    formState: { errors: signupErrors } 
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setAuthError(null);
    setAuthSuccess(null);
    const result = await signUp(data.email, data.password, data.fullName);
    if (result.error) {
      setAuthError(result.error);
    } else {
      setAuthSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  // Google account mock login
  const handleGoogleLogin = async () => {
    setAuthError(null);
    // Directly authenticate with Elena's mock account
    const result = await signIn(DEMO_CREDENTIALS.user.email, DEMO_CREDENTIALS.user.password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  // Automated Demo User Login
  const handleDemoUserLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    
    // Auto-populate the input fields for visual feedback
    setLoginValue('email', DEMO_CREDENTIALS.user.email);
    setLoginValue('password', DEMO_CREDENTIALS.user.password);

    // Call authentication service
    const result = await signIn(DEMO_CREDENTIALS.user.email, DEMO_CREDENTIALS.user.password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      setAuthSuccess('Demo access granted! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }
  };

  // Automated Demo Admin Login
  const handleDemoAdminLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    
    // Auto-populate fields
    setLoginValue('email', DEMO_CREDENTIALS.admin.email);
    setLoginValue('password', DEMO_CREDENTIALS.admin.password);

    const result = await signIn(DEMO_CREDENTIALS.admin.email, DEMO_CREDENTIALS.admin.password);
    if (result.error) {
      setAuthError(result.error);
    } else {
      setAuthSuccess('Admin demo access granted! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }
  };

  return (
    <Card className="w-full max-w-md border-white/10 shadow-2xl relative z-10 animate-slide-up bg-[#10121a]/85 backdrop-blur-md">
      <CardHeader className="flex flex-col items-center pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Leaf className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            EcoTrack <span className="text-emerald-400">AI</span>
          </CardTitle>
        </div>
        <CardDescription className="text-slate-400 text-xs text-center">
          Your personalized AI sustainability companion
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Try Demo Mode Section */}
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden flex flex-col gap-3">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-400 pointer-events-none">
            <Leaf className="w-24 h-24" />
          </div>
          
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Try Demo Mode
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px] font-extrabold uppercase tracking-wider">
              Hackathon Demo Access
            </span>
          </div>
          
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Explore all platform features instantly with a demo account.
          </p>
          
          <div className="text-[10px] text-slate-300">
            <span className="text-slate-500 font-bold">Demo Email:</span> <code className="text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono">{DEMO_CREDENTIALS.user.email}</code>
          </div>
          
          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={handleDemoUserLogin}
              disabled={loading}
              type="button"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/15"
            >
              🚀 Login as Demo User
            </button>
            <button
              onClick={handleDemoAdminLogin}
              disabled={loading}
              type="button"
              className="w-full py-2.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 disabled:opacity-50 text-emerald-400 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              🛡️ Login as Demo Admin
            </button>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => { setActiveTab('login'); setAuthError(null); }}
            className={cn(
              "flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all focus:outline-none",
              activeTab === 'login' 
                ? "border-emerald-500 text-emerald-400" 
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setAuthError(null); }}
            className={cn(
              "flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all focus:outline-none",
              activeTab === 'signup' 
                ? "border-emerald-500 text-emerald-400" 
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            Create Account
          </button>
        </div>

        {authError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs" role="alert">
            {authError}
          </div>
        )}

        {authSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs" role="alert">
            {authSuccess}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1" htmlFor="login-email">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="e.g. user@ecotrack.ai"
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                {...registerLogin('email')}
              />
              {loginErrors.email && (
                <span className="text-rose-400 text-[10px]">{loginErrors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1" htmlFor="login-password">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
                </label>
                <a href="#" className="text-[10px] text-emerald-400 hover:underline">Forgot password?</a>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                {...registerLogin('password')}
              />
              {loginErrors.password && (
                <span className="text-rose-400 text-[10px]">{loginErrors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold text-xs transition-all focus:ring-2 focus:ring-emerald-500 flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1" htmlFor="signup-name">
                <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="e.g. Elena Rostova"
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                {...registerSignup('fullName')}
              />
              {signupErrors.fullName && (
                <span className="text-rose-400 text-[10px]">{signupErrors.fullName.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1" htmlFor="signup-email">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="e.g. name@domain.com"
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                {...registerSignup('email')}
              />
              {signupErrors.email && (
                <span className="text-rose-400 text-[10px]">{signupErrors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1" htmlFor="signup-password">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Password (min 6 chars)
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                {...registerSignup('password')}
              />
              {signupErrors.password && (
                <span className="text-rose-400 text-[10px]">{signupErrors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold text-xs transition-all focus:ring-2 focus:ring-emerald-500 flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Social login divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative px-3 bg-[#10121a] text-[9px] font-bold text-slate-500 uppercase">Or Continue With</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.072 0-5.561-2.49-5.561-5.561s2.49-5.56 5.56-5.56c1.378 0 2.637.5 3.618 1.332l3.053-3.053C18.796 3.905 15.748 3 12.24 3 6.584 3 2 7.584 2 13.24c0 5.657 4.584 10.24 10.24 10.24 5.922 0 10.24-4.162 10.24-10.24 0-.693-.082-1.37-.24-1.955H12.24z"/>
          </svg>
          Google Account Demo Login
        </button>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-[#090a0f] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <Suspense fallback={
        <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/10 text-center">
          <p className="text-slate-400 text-sm">Loading auth portal...</p>
        </div>
      }>
        <AuthFormContent />
      </Suspense>
    </div>
  );
}
