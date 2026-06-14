'use client';

import React, { useState, useEffect } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { FootprintEntry, Goal, CarbonCategory } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Trophy, 
  TrendingDown, 
  Plus, 
  CheckCircle, 
  Calendar, 
  Percent, 
  Leaf, 
  Sparkles,
  Info
} from 'lucide-react';
import { cn, formatNumber, formatDate } from '../../lib/utils';

// Zod schema for Goal Creation
const goalSchema = zod.object({
  title: zod.string().min(3, 'Title must be at least 3 characters long'),
  description: zod.string().optional(),
  target_reduction_pct: zod.coerce.number().min(1, 'Target reduction must be at least 1%').max(100, 'Cannot reduce more than 100%'),
  target_date: zod.string().min(1, 'Please select a target date'),
});

type GoalFormValues = zod.infer<typeof goalSchema>;

const COLORS = {
  transport: '#38bdf8', // sky-400
  energy: '#fbbf24',    // amber-400
  food: '#34d399',      // emerald-400
  waste: '#f87171'       // rose-400
};

export default function AnalyticsPage() {
  const { user, refreshProfile } = useAuth();
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Set HasMounted to true on client load to bypass SSR charts errors
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors: goalErrors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      target_reduction_pct: 10,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const [entriesData, goalsData] = await Promise.all([
        dbService.getFootprintEntries(user.id),
        dbService.getGoals(user.id)
      ]);
      setEntries(entriesData);
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Create Goal
  const handleCreateGoal = async (data: GoalFormValues) => {
    if (!user) return;
    setGoalError(null);
    try {
      // Estimate baseline weekly footprint: sum of entries
      let totalCarbon = 0;
      entries.forEach(e => totalCarbon += e.co2_emission);
      const weeklyBaseline = entries.length > 0 ? (totalCarbon / entries.length) * 7 : 100;
      
      const targetValue = Math.round(weeklyBaseline * (1 - data.target_reduction_pct / 100) * 100) / 100;

      await dbService.addGoal({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        target_reduction_pct: data.target_reduction_pct,
        target_date: data.target_date,
        target_value: targetValue,
        start_date: new Date().toISOString().split('T')[0]
      });

      setShowAddGoal(false);
      reset();
      await fetchData();
    } catch (err: any) {
      setGoalError(err.message || 'Failed to create sustainability goal');
    }
  };

  // Complete Goal
  const handleCompleteGoal = async (goalId: string, currentVal: number) => {
    if (!user) return;
    try {
      await dbService.updateGoalProgress(goalId, user.id, currentVal, true);
      await refreshProfile(); // complete awards 100 points
      await fetchData();
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  // =========================================================================
  // CHARTS DATA PREPARATION
  // =========================================================================

  // 1. Pie Chart - Category Breakdown
  const categorySummary: Record<CarbonCategory, number> = {
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0
  };

  entries.forEach(e => {
    if (e.category in categorySummary) {
      categorySummary[e.category] += e.co2_emission;
    }
  });

  const pieData = Object.entries(categorySummary).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: Math.round(val * 100) / 100,
    color: COLORS[key as CarbonCategory]
  })).filter(item => item.value > 0);

  // 2. Bar Chart - Weekly Emissions (Emissions in last 7 days grouped by category)
  const getPastSevenDays = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      arr.push({ dateStr: str, name, Transport: 0, Energy: 0, Food: 0, Waste: 0 });
    }
    return arr;
  };

  const weeklyData = getPastSevenDays();
  entries.forEach(e => {
    const dayMatch = weeklyData.find(w => w.dateStr === e.recorded_date);
    if (dayMatch) {
      if (e.category === 'transport') dayMatch.Transport += e.co2_emission;
      else if (e.category === 'energy') dayMatch.Energy += e.co2_emission;
      else if (e.category === 'food') dayMatch.Food += e.co2_emission;
      else if (e.category === 'waste') dayMatch.Waste += e.co2_emission;
    }
  });

  weeklyData.forEach(w => {
    w.Transport = Math.round(w.Transport * 10) / 10;
    w.Energy = Math.round(w.Energy * 10) / 10;
    w.Food = Math.round(w.Food * 10) / 10;
    w.Waste = Math.round(w.Waste * 10) / 10;
  });

  // 3. Area Chart - Monthly Emissions (Emissions by Month)
  const getMonthlyEmissions = () => {
    const months: Record<string, { name: string; emissions: number; timestamp: number }> = {};
    
    // Sort oldest first
    const sorted = [...entries].reverse();
    sorted.forEach(e => {
      const date = new Date(e.recorded_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[key]) {
        months[key] = {
          name: monthYear,
          emissions: 0,
          timestamp: new Date(key + '-01').getTime()
        };
      }
      months[key].emissions += e.co2_emission;
    });

    return Object.values(months)
      .sort((a,b) => a.timestamp - b.timestamp)
      .map(item => ({
        name: item.name,
        Emissions: Math.round(item.emissions * 100) / 100
      }));
  };

  const monthlyData = getMonthlyEmissions();

  if (loading) {
    return (
      <NavigationShell>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
          <p className="text-sm font-semibold">Analyzing footprint data...</p>
        </div>
      </NavigationShell>
    );
  }

  return (
    <NavigationShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Sustainability Analytics</h1>
            <p className="text-slate-400 text-sm">Visualize your carbon footprint patterns, filter categories, and track reduction goals.</p>
          </div>
          
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Set Carbon Goal
          </button>
        </div>

        {/* Create Goal Form Modal/Panel */}
        {showAddGoal && (
          <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/5 animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4">Set a New Carbon Reduction Goal</h3>
            <form onSubmit={handleSubmit(handleCreateGoal)} className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cut Commute Emissions"
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                  {...register('title')}
                />
                {goalErrors.title && <span className="text-rose-400 text-[10px]">{goalErrors.title.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Carbon Reduction (%)</label>
                <input 
                  type="number" 
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                  {...register('target_reduction_pct')}
                />
                {goalErrors.target_reduction_pct && <span className="text-rose-400 text-[10px]">{goalErrors.target_reduction_pct.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Achievement Date</label>
                <input 
                  type="date" 
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                  {...register('target_date')}
                />
                {goalErrors.target_date && <span className="text-rose-400 text-[10px]">{goalErrors.target_date.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <textarea 
                  placeholder="e.g. I will walk or cycle for my commute to save fuel emissions."
                  rows={2}
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-sm focus:border-emerald-500 focus:outline-none"
                  {...register('description')}
                />
              </div>

              {goalError && <div className="text-rose-400 text-xs sm:col-span-2">{goalError}</div>}

              <div className="flex gap-3 sm:col-span-2 mt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Charts Grid */}
        {entries.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel border border-white/5 text-center text-slate-500 italic">
            You need to log carbon footprint activities to see charts and analytics. Go to the Calculator to get started.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chart 1: Weekly Breakdown */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Weekly Activity (Past 7 Days)
                </h3>
                <span className="text-[10px] text-slate-500">kg CO2e</span>
              </div>
              <div className="h-64 w-full">
                {hasMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#10121a', borderColor: '#1f2937', color: '#fff' }}
                        itemStyle={{ fontSize: 11 }}
                      />
                      <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Transport" stackId="a" fill={COLORS.transport} />
                      <Bar dataKey="Energy" stackId="a" fill={COLORS.energy} />
                      <Bar dataKey="Food" stackId="a" fill={COLORS.food} />
                      <Bar dataKey="Waste" stackId="a" fill={COLORS.waste} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Category Pie Chart */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-400" /> Category Breakdown
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                {hasMounted && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#10121a', borderColor: '#1f2937', color: '#fff' }}
                        formatter={(value) => `${value} kg`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-500 text-xs italic">No category data logged</div>
                )}
              </div>
            </div>

            {/* Chart 3: Monthly Emissions (Full Width in Grid) */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" /> Emissions Trend over Time
                </h3>
                <span className="text-[10px] text-slate-500">kg CO2e per Month</span>
              </div>
              <div className="h-64 w-full">
                {hasMounted && monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#10121a', borderColor: '#1f2937', color: '#fff' }} />
                      <Area type="monotone" dataKey="Emissions" stroke="#10b981" fillOpacity={1} fill="url(#colorEmissions)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-500 text-xs italic text-center py-20">Not enough data to calculate monthly trends</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carbon Reduction Goals Section */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Carbon Reduction Goals</h2>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm italic">
              No active reduction goals set. Create a goal to commit to sustainable changes!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {goals.map((goal) => {
                // Calculate current weekly average carbon to see progress
                const userTotalCarbon = entries.reduce((acc, curr) => acc + curr.co2_emission, 0);
                const daysSpanned = entries.length > 0 
                  ? Math.max(1, Math.round((new Date().getTime() - new Date(entries[entries.length-1].recorded_date).getTime()) / (24*60*60*1000))) 
                  : 1;
                const currentWeeklyAvg = (userTotalCarbon / daysSpanned) * 7;
                
                // Estimate progress percentage
                // If it's active, it starts at 0% progress, complete sets it to 100%
                let progressPct = 0;
                if (goal.status === 'completed') {
                  progressPct = 100;
                } else {
                  // Let's assume baseline weekly average carbon was e.g. 150kg.
                  // If we reduce below baseline, calculate progress towards target_value.
                  const baseWeekly = goal.target_value / (1 - goal.target_reduction_pct / 100);
                  const totalDiffRequired = baseWeekly - goal.target_value;
                  const currentDiff = baseWeekly - currentWeeklyAvg;
                  progressPct = totalDiffRequired > 0 
                    ? Math.max(0, Math.min(99, Math.round((currentDiff / totalDiffRequired) * 100)))
                    : 0;
                }

                return (
                  <div 
                    key={goal.id} 
                    className={cn(
                      "p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all",
                      goal.status === 'completed' 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : "bg-white/5 border-white/5"
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{goal.title}</h4>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5" /> Target date: {formatDate(goal.target_date)}
                          </span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          goal.status === 'completed' 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-sky-500/20 text-sky-400"
                        )}>
                          {goal.status}
                        </span>
                      </div>
                      
                      {goal.description && (
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">{goal.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Progress Bar */}
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-emerald-400" /> Reduction: {goal.target_reduction_pct}%
                        </span>
                        <span className="text-white">{progressPct}% Met</span>
                      </div>
                      
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                        <span>Target: <strong className="text-slate-300">{formatNumber(goal.target_value)} kg/wk</strong></span>
                        <span>Current Avg: <strong className="text-slate-300">{formatNumber(currentWeeklyAvg)} kg/wk</strong></span>
                      </div>

                      {goal.status === 'active' && (
                        <button
                          onClick={() => handleCompleteGoal(goal.id, currentWeeklyAvg)}
                          className="mt-3 w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Complete Goal (+100 pts)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </NavigationShell>
  );
}
