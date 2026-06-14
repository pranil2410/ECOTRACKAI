'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { 
  Leaf, 
  Sparkles, 
  Trophy, 
  TrendingDown, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Menu, 
  X, 
  Globe, 
  Zap, 
  BarChart3, 
  FileSpreadsheet
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#090a0f] text-[#f3f4f6]">
      {/* Background Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white focus:outline-none">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <span>EcoTrack <span className="text-emerald-400">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#impact" className="hover:text-emerald-400 transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all focus:ring-2 focus:ring-emerald-500"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth?tab=login" className="text-sm font-medium hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/auth?tab=signup" 
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all focus:ring-2 focus:ring-emerald-500 shadow-md shadow-emerald-500/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Nav Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-[#090a0f] px-4 py-6 flex flex-col gap-4 animate-fade-in">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-emerald-400"
            >
              Features
            </a>
            <a 
              href="#impact" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-emerald-400"
            >
              Impact
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-emerald-400"
            >
              Testimonials
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-emerald-400"
            >
              FAQ
            </a>
            <hr className="border-white/5 my-2" />
            {user ? (
              <Link 
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-emerald-500 text-white font-medium text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  href="/auth?tab=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium text-sm"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth?tab=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-emerald-500 text-white font-medium text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center text-center container mx-auto px-4 max-w-5xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini AI
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl animate-slide-up">
          Empowering Your Journey To <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
            Net Zero Carbon Emissions
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed animate-slide-up delay-100">
           EcoTrack AI combines carbon logging, advanced analytics, custom challenges, and an AI Sustainability Coach to make carbon reduction transparent, gamified, and actionable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16 animate-slide-up delay-200">
          {user ? (
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all transform hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-base"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link 
                href="/auth?tab=signup" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all transform hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-base"
              >
                Track Your Footprint Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/auth?tab=login" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center text-base"
              >
                Explore Platform Demo
              </Link>
            </>
          )}
        </div>

        {/* Dashboard Mock Preview */}
        <div className="w-full rounded-2xl overflow-hidden glass-panel border border-white/10 p-2 md:p-4 shadow-2xl animate-fade-in delay-300">
          <div className="rounded-xl overflow-hidden bg-[#0c0d14] border border-white/5 aspect-[16/9] relative flex flex-col">
            {/* Window bar */}
            <div className="h-8 border-b border-white/5 bg-[#090a0f] flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="text-[10px] text-slate-500 mx-auto select-none">ecotrack-ai.vercel.app/dashboard</div>
            </div>
            
            {/* Inner frame mock */}
            <div className="flex-1 flex text-left p-4 md:p-6 gap-4 bg-[#090a0f]/50">
              {/* Sidebar mock */}
              <div className="w-1/4 hidden sm:flex flex-col gap-3 pr-4 border-r border-white/5">
                <div className="h-6 w-3/4 rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/5" />
                <div className="h-4 w-2/3 rounded bg-white/5" />
                <div className="h-4 w-1/2 rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
              </div>
              {/* Dashboard Grid mock */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 rounded bg-white/10" />
                  <div className="h-6 w-20 rounded bg-emerald-500/20" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 rounded bg-white/5 border border-white/5 p-2 flex flex-col justify-between">
                    <div className="h-3 w-12 rounded bg-white/10" />
                    <div className="h-5 w-16 rounded bg-emerald-400/20" />
                  </div>
                  <div className="h-16 rounded bg-white/5 border border-white/5 p-2 flex flex-col justify-between">
                    <div className="h-3 w-16 rounded bg-white/10" />
                    <div className="h-5 w-8 rounded bg-white/20" />
                  </div>
                  <div className="h-16 rounded bg-white/5 border border-white/5 p-2 flex flex-col justify-between">
                    <div className="h-3 w-14 rounded bg-white/10" />
                    <div className="h-5 w-12 rounded bg-white/20" />
                  </div>
                </div>
                {/* Large graph mock */}
                <div className="flex-1 rounded bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-4 w-12 rounded bg-white/10" />
                  </div>
                  <div className="h-20 flex items-end justify-between px-2 gap-2">
                    <div className="h-12 w-full rounded-t bg-emerald-500/30" />
                    <div className="h-16 w-full rounded-t bg-emerald-500/50" />
                    <div className="h-8 w-full rounded-t bg-emerald-500/40" />
                    <div className="h-20 w-full rounded-t bg-emerald-500/70" />
                    <div className="h-14 w-full rounded-t bg-emerald-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 bg-[#0c0d15] border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Designed For Impact. Engineered For Action.
            </h2>
            <p className="text-slate-400 text-lg">
              Carbon reduction doesn't have to be vague. EcoTrack AI supplies the tools, metrics, and guidance to change carbon awareness into tangible reductions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Full-Category Calculator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log transportation (flights, car fuel types), home energy inputs (electricity, gas cylinders), meal diets, and household packaging waste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Sustainability Coach</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interact with our Gemini-powered coach. Analyze entries to receive custom recommendations, weekly targets, and answers to green queries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Advanced Recharts Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock weekly, monthly, and categorical trends. Follow your carbon reductions against set goals and compare with regional averages.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Gamified Milestones</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Earn Green Points by finishing challenges. Advance from an Eco Beginner to a Sustainability Master and unlock community ranking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Weekly Eco Challenges</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join challenges like "No Car Day" or "Zero Plastic Week". Track completions, compete with others, and learn sustainable lifestyles.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl glass-card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">One-Click PDF Reports</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate and export detailed monthly carbon progress reports containing emission summaries, goal statuses, and AI recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM IMPACT STATISTICS */}
      <section id="impact" className="py-24 container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start">
              <Users className="w-3.5 h-3.5" />
              EcoTrack Community
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Aggregated Action Leading To Real Global Change
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Every log, choice, and completed challenge counts. With our community leaderboard and tracking tools, we build collaborative habits that save thousands of kilograms of carbon emissions each month.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-slate-300">Row Level Security ensuring data isolation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-slate-300">Realistic EPA-approved calculation formulas</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-slate-300">Actionable advice powered by LLM AI Coach</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl glass-panel text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">48,250 kg</div>
              <div className="text-sm font-semibold text-slate-300 mb-1">CO2e Diverted</div>
              <p className="text-xs text-slate-500">Aggregated user savings this year</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">12,400+</div>
              <div className="text-sm font-semibold text-slate-300 mb-1">Challenges Completed</div>
              <p className="text-xs text-slate-500">Green choices logged by users</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">86%</div>
              <div className="text-sm font-semibold text-slate-300 mb-1">Weekly Retention</div>
              <p className="text-xs text-slate-500">Active engagement in gamification</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">1,500+</div>
              <div className="text-sm font-semibold text-slate-300 mb-1">Trees Planted</div>
              <p className="text-xs text-slate-500">Via points-to-planting sponsorships</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-[#0c0d15] border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Loved By Climate Conscious Creators
            </h2>
            <p className="text-slate-400 text-base">
              Here is what early adopters have to say about their carbon tracking experience on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                "EcoTrack AI completely reshaped my approach to household sustainability. The Gemini coach pointed out that my standby electronics were wasting 40 kWh a month, which helped me save money and cut carbon."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">Sarah Jenkins</h4>
                <p className="text-xs text-emerald-400">Green Warrior, -85kg CO2e</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                "The challenges are super engaging. Completing 'Zero Plastic Week' was tough, but unlocking the Climate Champion badge and competing on the community leaderboard made it fun."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">Marcus Chen</h4>
                <p className="text-xs text-emerald-400">Solar Warrior, -120kg CO2e</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                "We use the platform's PDF report generator to output monthly carbon analytics. It saves hours of manual sheets tracking and provides actionable summaries."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">David Miller</h4>
                <p className="text-xs text-emerald-400">Sustainability Manager, -450kg CO2e</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl glass-panel">
            <h4 className="text-lg font-bold text-white mb-2">How does EcoTrack AI calculate my carbon footprint?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              We use carbon emission coefficients compiled by the EPA and IPCC. These factors quantify the average greenhouse gas release per unit of activity (e.g., fuel combustion per km driven, utility carbon intensity per kWh, food lifecycle emissions).
            </p>
          </div>
          <div className="p-6 rounded-xl glass-panel">
            <h4 className="text-lg font-bold text-white mb-2">Can I use the platform without Supabase credentials?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Yes! We built a local browser database fallback. If Supabase keys are not set up, EcoTrack AI automatically logs all your entries, challenges, achievements, and chat history locally in your browser so you can test all features.
            </p>
          </div>
          <div className="p-6 rounded-xl glass-panel">
            <h4 className="text-lg font-bold text-white mb-2">How does the AI Coach work?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              The AI Coach uses Google Gemini. It reviews your logged footprint entries, recognizes categories where your emissions are highest, and suggests weekly goals and eco challenges to help you reduce your carbon score.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-t from-emerald-950/20 to-transparent border-t border-white/5 flex flex-col items-center text-center px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Start EcoTrack AI Today</h2>
        <p className="text-slate-400 max-w-xl mb-8">
          Join thousands of global citizens tracking, managing, and neutralizing carbon footprints.
        </p>
        <Link 
          href="/auth?tab=signup" 
          className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          Create Free Account
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-slate-500 bg-[#090a0f]">
        <p className="mb-4">&copy; 2026 EcoTrack AI. Powered by Google Gemini and Supabase. Built for net-zero carbon awareness.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-400">Terms of Service</a>
          <a href="#" className="hover:text-emerald-400">Documentation</a>
        </div>
      </footer>
    </div>
  );
}
