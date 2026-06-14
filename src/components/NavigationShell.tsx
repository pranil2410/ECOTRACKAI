'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { 
  Leaf, 
  LayoutDashboard, 
  Calculator, 
  Sparkles, 
  BarChart3, 
  Trophy, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationShellProps {
  children: React.ReactNode;
}

export default function NavigationShell({ children }: NavigationShellProps) {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?tab=login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#090a0f] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
        <p className="text-sm font-semibold tracking-wide">Syncing profile sessions...</p>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect in useEffect
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Carbon Calculator', href: '/calculator', icon: Calculator },
    { name: 'AI Coach', href: '/coach', icon: Sparkles },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Challenges & Leaderboard', href: '/challenges', icon: Trophy },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Control', href: '/admin', icon: Settings });
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#090a0f] text-[#f3f4f6]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-white/5 bg-[#0c0d14]/90 backdrop-blur-md sticky top-0 z-40 w-full">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-lg font-bold">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span>EcoTrack <span className="text-emerald-400">AI</span></span>
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Green points indicator */}
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
            {profile?.green_points || 0} pts
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#090a0f] pt-20 px-4 flex flex-col gap-2 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors",
                  active 
                    ? "bg-emerald-500 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          
          <hr className="border-white/5 my-4" />
          
          {/* User Info card mobile */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || user.email}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{profile?.sustainability_level}</p>
            </div>
          </div>

          <button
            onClick={() => { signOut(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0c0d14] py-6 px-4 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
          <span className="text-lg font-bold text-white tracking-wide">EcoTrack <span className="text-emerald-400">AI</span></span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500",
                  active 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Stats Card */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {profile?.full_name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {profile?.sustainability_level}
              </span>
              <span className="font-extrabold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                {profile?.green_points || 0} pts
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative p-4 md:p-8">
        {/* Admin Warning Indicator for admins */}
        {isAdmin && (
          <div className="mb-6 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Admin credentials verified. You have access to user records and configuration tools.</span>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}
