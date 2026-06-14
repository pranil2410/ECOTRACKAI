'use client';

import React, { useState, useEffect } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { Profile, Challenge, CarbonCategory, UserRole } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  Settings, 
  Plus, 
  UserCheck, 
  ShieldAlert, 
  Lightbulb, 
  Trash2, 
  Sparkles,
  Search,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

// Zod schema for new challenges
const challengeSchema = zod.object({
  title: zod.string().min(3, 'Title must be at least 3 characters long'),
  description: zod.string().min(10, 'Description must be at least 10 characters long'),
  category: zod.enum(['transport', 'energy', 'food', 'waste', 'community']),
  points_reward: zod.coerce.number().int().min(1, 'Points must be at least 1'),
  duration_days: zod.coerce.number().int().min(1, 'Duration must be at least 1 day'),
});

type ChallengeFormValues = zod.infer<typeof challengeSchema>;

export default function AdminPage() {
  const { user, profile: currentProfile, refreshProfile } = useAuth();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // Form for challenge creation
  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      points_reward: 50,
      duration_days: 3
    }
  });

  const fetchData = async () => {
    try {
      const [profilesData, challengesData] = await Promise.all([
        dbService.getAllProfiles(),
        dbService.getChallenges()
      ]);
      setProfiles(profilesData);
      setChallenges(challengesData);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle role updates
  const handleToggleRole = async (targetUserId: string, currentRole: UserRole) => {
    // Safety check: don't demote yourself
    if (targetUserId === user?.id) {
      alert("Demotion Lock: You cannot revoke your own administrative privileges.");
      return;
    }

    const nextRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await dbService.updateUserRole(targetUserId, nextRole);
      await fetchData();
      await refreshProfile(); // session refresh
    } catch (err) {
      console.error('Failed to toggle role:', err);
    }
  };

  // Create Challenge
  const handleCreateChallenge = async (data: ChallengeFormValues) => {
    setChallengeError(null);
    try {
      await dbService.addChallenge({
        title: data.title,
        description: data.description,
        category: data.category as any,
        points_reward: data.points_reward,
        duration_days: data.duration_days,
        is_active: true
      });

      setChallengeSuccess(true);
      reset();
      await fetchData();
      
      setTimeout(() => {
        setChallengeSuccess(false);
      }, 3000);
    } catch (err: any) {
      setChallengeError(err.message || 'Failed to publish challenge');
    }
  };

  // Block non-admins
  if (currentProfile && currentProfile.role !== 'admin') {
    return (
      <NavigationShell>
        <div className="max-w-md mx-auto my-20 p-8 rounded-2xl glass-panel border border-rose-500/20 text-center flex flex-col items-center gap-4 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            You do not have administrative permissions to view this control panel. Contact system support if this is a mistake.
          </p>
          <a 
            href="/dashboard" 
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </NavigationShell>
    );
  }

  if (loading) {
    return (
      <NavigationShell>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
          <p className="text-sm font-semibold">Loading admin metrics...</p>
        </div>
      </NavigationShell>
    );
  }

  // Calculate platform aggregate stats
  const totalUsers = profiles.length;
  const totalPoints = profiles.reduce((acc, curr) => acc + curr.green_points, 0);
  const mastersCount = profiles.filter(p => p.sustainability_level === 'Sustainability Master').length;
  const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(p => {
    const nameMatch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <NavigationShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Admin Control Panel
          </h1>
          <p className="text-slate-400 text-sm">Monitor platform engagement, define challenges, and manage user roles.</p>
        </div>

        {/* Aggregate KPI Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-2">
            <Users className="w-5 h-5 text-sky-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Platform Users</span>
            <strong className="text-2xl font-extrabold text-white">{totalUsers} users</strong>
          </div>
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-2">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cumulative Green Points</span>
            <strong className="text-2xl font-extrabold text-white">{formatNumber(totalPoints)} pts</strong>
          </div>
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sustainability Masters</span>
            <strong className="text-2xl font-extrabold text-emerald-400">{mastersCount} masters</strong>
          </div>
          <div className="p-5 rounded-2xl glass-card flex flex-col gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Average points / user</span>
            <strong className="text-2xl font-extrabold text-white">{averagePoints} pts</strong>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Columns: User records management */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Platform Profiles
                </h2>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-[#090a0f] text-slate-300 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Milestone</th>
                      <th className="py-2.5 px-3">Points</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {filteredProfiles.map((p) => {
                      const isMe = p.id === user?.id;
                      
                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{p.full_name || 'Anonymous User'}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">{p.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                              p.role === 'admin' ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                            )}>
                              {p.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-400">{p.sustainability_level}</td>
                          <td className="py-3.5 px-3 font-bold">{p.green_points}</td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleRole(p.id, p.role)}
                              disabled={isMe}
                              className={cn(
                                "px-2.5 py-1 rounded text-[10px] font-bold transition-all focus:outline-none",
                                isMe 
                                  ? "bg-slate-800/40 text-slate-600 cursor-not-allowed" 
                                  : p.role === 'admin' 
                                  ? "border border-rose-500/30 text-rose-400 hover:bg-rose-500/5" 
                                  : "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5"
                              )}
                            >
                              {p.role === 'admin' ? 'Demote User' : 'Promote Admin'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Challenge Creator Form */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-5">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" /> Define New Eco Quest
              </h2>

              <form onSubmit={handleSubmit(handleCreateChallenge)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Challenge Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Walk to Work Week"
                    className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none"
                    {...register('title')}
                  />
                  {formErrors.title && <span className="text-rose-400 text-[10px]">{formErrors.title.message}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select 
                    className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none"
                    {...register('category')}
                  >
                    <option value="transport">Transportation</option>
                    <option value="energy">Household Energy</option>
                    <option value="food">Dietary Footprint</option>
                    <option value="waste">Packaging Waste</option>
                    <option value="community">Community Action</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Points Reward</label>
                    <input 
                      type="number" 
                      className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none"
                      {...register('points_reward')}
                    />
                    {formErrors.points_reward && <span className="text-rose-400 text-[10px]">{formErrors.points_reward.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Duration (Days)</label>
                    <input 
                      type="number" 
                      className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none"
                      {...register('duration_days')}
                    />
                    {formErrors.duration_days && <span className="text-rose-400 text-[10px]">{formErrors.duration_days.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea 
                    placeholder="Describe how users complete this challenge..."
                    rows={3}
                    className="px-4 py-2.5 rounded-lg border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none"
                    {...register('description')}
                  />
                  {formErrors.description && <span className="text-rose-400 text-[10px]">{formErrors.description.message}</span>}
                </div>

                {challengeSuccess && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Challenge published successfully!
                  </div>
                )}

                {challengeError && <div className="text-rose-400 text-xs">{challengeError}</div>}

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors focus:ring-2 focus:ring-emerald-500"
                >
                  Publish Challenge Quest
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </NavigationShell>
  );
}
