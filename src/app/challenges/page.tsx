'use client';

import React, { useState, useEffect } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { Challenge, ChallengeCompletion, UserAchievement, LeaderboardEntry } from '../../types';
import { 
  Trophy, 
  Target, 
  Medal, 
  Flame, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Award,
  Sparkles,
  Users
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

export default function ChallengesPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [challengesData, completionsData, achievementsData, leaderboardData] = await Promise.all([
        dbService.getChallenges(),
        dbService.getChallengeCompletions(user.id),
        dbService.getUserAchievements(user.id),
        dbService.getLeaderboard()
      ]);
      setChallenges(challengesData);
      setCompletions(completionsData);
      setUserAchievements(achievementsData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Failed to load challenges data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Join challenge
  const handleStartChallenge = async (challengeId: string) => {
    if (!user) return;
    setActionLoading(challengeId);
    try {
      await dbService.startChallenge(user.id, challengeId);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Complete challenge
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;
    setActionLoading(challengeId);
    try {
      await dbService.completeChallenge(user.id, challengeId);
      await refreshProfile(); // points increase, level might change
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Badge list definitions
  const badgeDefinitions = [
    { type: 'eco-beginner', name: 'Eco Beginner', desc: 'Unlock by signing up and setting up your profile.', points: 0 },
    { type: 'green-warrior', name: 'Green Warrior', desc: 'Unlock by accumulating 100+ green points.', points: 100 },
    { type: 'climate-champion', name: 'Climate Champion', desc: 'Unlock by accumulating 500+ green points.', points: 500 },
    { type: 'sustainability-master', name: 'Sustainability Master', desc: 'Unlock by accumulating 1500+ green points.', points: 1500 },
  ];

  if (loading) {
    return (
      <NavigationShell>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4" />
          <p className="text-sm font-semibold">Syncing gamified assets...</p>
        </div>
      </NavigationShell>
    );
  }

  // Group challenges by status
  const joinedChallengeIds = completions.filter(c => c.status === 'active').map(c => c.challenge_id);
  const completedChallengeIds = completions.filter(c => c.status === 'completed').map(c => c.challenge_id);

  return (
    <NavigationShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Challenges & Milestones</h1>
          <p className="text-slate-400 text-sm">Join active eco-challenges, track your progress, unlock achievement badges, and climb the leaderboard.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Columns: Challenges Board */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Active Eco Challenges</h2>
              </div>

              <div className="flex flex-col gap-4">
                {challenges.map((challenge) => {
                  const isActive = joinedChallengeIds.includes(challenge.id);
                  const isCompleted = completedChallengeIds.includes(challenge.id);
                  
                  return (
                    <div 
                      key={challenge.id} 
                      className={cn(
                        "p-5 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all",
                        isCompleted 
                          ? "bg-emerald-500/5 border-emerald-500/10 opacity-75" 
                          : isActive 
                          ? "bg-sky-500/5 border-sky-500/20 shadow-md shadow-sky-500/5" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="font-bold text-white text-sm">{challenge.title}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                            challenge.category === 'transport' ? "bg-sky-500/20 text-sky-400" :
                            challenge.category === 'energy' ? "bg-amber-500/20 text-amber-400" :
                            challenge.category === 'food' ? "bg-emerald-500/20 text-emerald-400" :
                            challenge.category === 'waste' ? "bg-rose-500/20 text-rose-400" : "bg-purple-500/20 text-purple-400"
                          )}>
                            {challenge.category}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-3">{challenge.description}</p>
                        
                        <div className="flex gap-4 text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration: {challenge.duration_days} day(s)
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Reward: {challenge.points_reward} pts
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCompleted ? (
                          <div className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        ) : isActive ? (
                          <button
                            onClick={() => handleCompleteChallenge(challenge.id)}
                            disabled={actionLoading === challenge.id}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1"
                          >
                            {actionLoading === challenge.id ? 'Loading...' : 'Complete Challenge'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartChallenge(challenge.id)}
                            disabled={actionLoading === challenge.id}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center"
                          >
                            {actionLoading === challenge.id ? 'Loading...' : 'Join Challenge'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Achievements & Leaderboard */}
          <div className="flex flex-col gap-8">
            {/* Achievement Badges */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Your Badge Milestones</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {badgeDefinitions.map((badge) => {
                  // Check if unlocked
                  const isUnlocked = userAchievements.some(ua => ua.achievement?.badge_type === badge.type) || 
                                     (profile && profile.green_points >= badge.points);
                  
                  return (
                    <div 
                      key={badge.type} 
                      className={cn(
                        "p-3.5 rounded-xl border flex flex-col items-center text-center justify-center gap-2 transition-all",
                        isUnlocked 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-white/5 border-white/5 opacity-40 grayscale"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-md",
                        isUnlocked 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-slate-800 text-slate-500"
                      )}>
                        <Award className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-[11px] text-white font-bold truncate max-w-[100px]">{badge.name}</strong>
                        <span className="text-[9px] text-slate-500 font-semibold">{badge.points} pts req.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white font-sans">Leaderboard</h2>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Community rank</span>
              </div>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {leaderboard.map((item) => {
                  const isCurrentUser = item.user_id === user.id;
                  
                  return (
                    <div 
                      key={item.user_id} 
                      className={cn(
                        "p-3 rounded-xl flex items-center justify-between text-xs transition-colors",
                        isCurrentUser 
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Circle */}
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0",
                          item.rank === 1 ? "bg-amber-500 text-slate-950" :
                          item.rank === 2 ? "bg-slate-400 text-slate-950" :
                          item.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                        )}>
                          {item.rank}
                        </div>

                        {/* Name / Info */}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[120px]">
                            {item.full_name || item.email.split('@')[0]}
                          </p>
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">{item.sustainability_level}</span>
                        </div>
                      </div>

                      {/* Points */}
                      <span className="font-bold text-right shrink-0">
                        {formatNumber(item.green_points)} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationShell>
  );
}
