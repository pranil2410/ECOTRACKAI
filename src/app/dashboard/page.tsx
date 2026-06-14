'use client';

import React, { useState, useEffect } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { aiService, CoachResponse } from '../../services/aiService';
import { pdfService } from '../../services/pdfService';
import { FootprintEntry, Goal } from '../../types';
import { 
  Leaf, 
  Sparkles, 
  Trophy, 
  TrendingDown, 
  FileSpreadsheet, 
  Plus, 
  Activity, 
  Calendar, 
  Clock, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Flame,
  Car,
  Apple,
  Trash2
} from 'lucide-react';
import { cn, formatNumber, formatDate } from '../../lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analysis, setAnalysis] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [entriesData, goalsData] = await Promise.all([
        dbService.getFootprintEntries(user.id),
        dbService.getGoals(user.id)
      ]);
      setEntries(entriesData);
      setGoals(goalsData);

      // Fetch AI analysis of entries
      const aiAnalysis = await aiService.getFootprintAnalysis(entriesData);
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!profile || !entries) return;
    setDownloadingPdf(true);
    try {
      // Call service
      pdfService.generateCarbonReport(
        profile,
        entries,
        goals,
        analysis?.weeklyGoalRecommendation || 'Set a weekly reduction goal!',
        analysis?.insights || 'Log more footprint entries to receive custom AI tips.'
      );
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Calculations for KPI cards
  const totalCarbon = entries.reduce((acc, curr) => acc + curr.co2_emission, 0);
  
  // Weekly Carbon: Sum emissions logged in past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyCarbon = entries
    .filter(e => new Date(e.recorded_date) >= sevenDaysAgo)
    .reduce((acc, curr) => acc + curr.co2_emission, 0);

  // Monthly Carbon: Sum emissions in current month
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlyCarbon = entries
    .filter(e => new Date(e.recorded_date) >= firstDayOfMonth)
    .reduce((acc, curr) => acc + curr.co2_emission, 0);

  // Carbon category icons
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport': return <Car className="w-4 h-4 text-sky-400" />;
      case 'energy': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'food': return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-rose-400" />;
      default: return <Leaf className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (loading) {
    return (
      <NavigationShell>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
          <p className="text-sm font-semibold tracking-wide">Synthesizing carbon dashboard metrics...</p>
        </div>
      </NavigationShell>
    );
  }

  return (
    <NavigationShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
              Welcome back, <span className="text-emerald-400">{profile?.full_name || 'Eco Warrior'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Here is your sustainability footprint overview and AI suggestions for today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              disabled={downloadingPdf || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all focus:outline-none"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
            <Link 
              href="/calculator"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <Plus className="w-4 h-4" />
              Log Footprint Activity
            </Link>
          </div>
        </div>

        {/* Core KPI metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Carbon */}
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Carbon Logged</span>
              <strong className="text-2xl font-extrabold text-white mt-1">
                {formatNumber(totalCarbon)} <span className="text-xs font-semibold text-slate-500">kg</span>
              </strong>
            </div>
            <span className="text-[9px] text-slate-500 leading-normal">Cumulative carbon lifecycle emissions</span>
          </div>

          {/* Card 2: Weekly emissions */}
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weekly Emissions</span>
              <strong className="text-2xl font-extrabold text-white mt-1">
                {formatNumber(weeklyCarbon)} <span className="text-xs font-semibold text-slate-500">kg</span>
              </strong>
            </div>
            <span className="text-[9px] text-slate-500 leading-normal">Emissions logged in past 7 days</span>
          </div>

          {/* Card 3: Sustainability Score */}
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sustainability Score</span>
              <strong className="text-2xl font-extrabold text-emerald-400 mt-1">
                {analysis?.sustainabilityScore || 75}
                <span className="text-xs font-bold text-slate-500"> /100</span>
              </strong>
            </div>
            <span className="text-[9px] text-slate-500 leading-normal">AI-calculated net-zero progress rating</span>
          </div>

          {/* Card 4: Green points */}
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Green Points</span>
              <strong className="text-2xl font-extrabold text-white mt-1">
                {formatNumber(profile?.green_points || 0)} <span className="text-xs font-semibold text-slate-500">pts</span>
              </strong>
            </div>
            <span className="text-[9px] text-emerald-400 font-semibold">{profile?.sustainability_level} badge</span>
          </div>
        </div>

        {/* Insights and recent logs grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: AI insights box */}
          <div className="lg:col-span-1 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between gap-6 relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" /> AI Sustainability Coach
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">Personalized Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {analysis?.insights}
              </p>
            </div>

            {analysis?.weeklyGoalRecommendation && (
              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/25 flex flex-col gap-1 text-xs">
                <span className="font-bold text-purple-400 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Recommended reduction strategy:
                </span>
                <p className="text-slate-300 italic">"{analysis.weeklyGoalRecommendation}"</p>
              </div>
            )}

            <Link 
              href="/coach"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white justify-center text-center transition-colors"
            >
              Ask Coach a Question
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Recent logs table */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> Recent Activities
              </h3>
              <Link href="/calculator" className="text-[10px] font-bold text-emerald-400 hover:text-white flex items-center gap-0.5">
                View All Logs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {entries.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 text-xs italic">
                No activity logs recorded yet. Switch to the calculator to log your transportation, food, or utility energy emissions.
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2">Item</th>
                      <th className="py-2.5 px-2">Logged</th>
                      <th className="py-2.5 px-2 text-right">CO2 impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {entries.slice(0, 4).map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-400">{formatDate(entry.recorded_date)}</td>
                        <td className="py-3 px-2 font-bold flex items-center gap-1.5 uppercase">
                          {getCategoryIcon(entry.category)}
                          <span className="capitalize">{entry.category}</span>
                        </td>
                        <td className="py-3 px-2 capitalize">{entry.sub_category.replace('_', ' ')}</td>
                        <td className="py-3 px-2 font-bold text-slate-400">
                          {formatNumber(entry.value)}{' '}
                          <span className="text-slate-600 font-normal">
                            {entry.category === 'transport' ? (entry.sub_category === 'flight' ? 'h' : 'km') : 'units'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-emerald-400 font-extrabold text-right">
                          {formatNumber(entry.co2_emission)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Bottom banner: quick tip */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Gamified Climate Challenges</h4>
              <p className="text-xs text-slate-400 mt-0.5">Participate in community quests like 'Zero Plastic Week' to claim points & badge upgrades!</p>
            </div>
          </div>
          <Link 
            href="/challenges"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-md shadow-emerald-500/10 transition-colors"
          >
            Open Challenges
          </Link>
        </div>
      </div>
    </NavigationShell>
  );
}
