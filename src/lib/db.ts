import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Profile, 
  FootprintEntry, 
  Goal, 
  Challenge, 
  ChallengeCompletion, 
  Achievement, 
  UserAchievement, 
  Report, 
  LeaderboardEntry 
} from '../types';

// =========================================================================
// LOCAL STORAGE DB ENGINE (MOCK IMPLEMENTATION FOR OFFLINE / STANDALONE TEST)
// =========================================================================

const LS_KEYS = {
  PROFILES: 'ecotrack_profiles',
  FOOTPRINTS: 'ecotrack_footprints',
  GOALS: 'ecotrack_goals',
  CHALLENGES: 'ecotrack_challenges',
  COMPLETIONS: 'ecotrack_completions',
  ACHIEVEMENTS: 'ecotrack_achievements',
  USER_ACHIEVEMENTS: 'ecotrack_user_achievements',
  REPORTS: 'ecotrack_reports'
};

// Seed data
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'No Car Day',
    description: 'Walk, cycle, or use public transport instead of driving for an entire day.',
    category: 'transport',
    points_reward: 30,
    duration_days: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'ch-2',
    title: 'Zero Plastic Week',
    description: 'Avoid single-use plastics completely for 7 days.',
    category: 'waste',
    points_reward: 100,
    duration_days: 7,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'ch-3',
    title: 'Energy Saver Challenge',
    description: 'Turn off all non-essential electric appliances and keep energy usage low for a weekend.',
    category: 'energy',
    points_reward: 50,
    duration_days: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'ch-4',
    title: 'Tree Plantation Drive',
    description: 'Plant at least one sapling in your community and take care of it.',
    category: 'community',
    points_reward: 150,
    duration_days: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'ch-5',
    title: 'Plant-Based Weekend',
    description: 'Eat fully vegetarian or vegan meals for 2 consecutive days.',
    category: 'food',
    points_reward: 40,
    duration_days: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ac-1',
    name: 'Eco Beginner',
    description: 'Welcome to EcoTrack AI! Set up your account and log your first carbon entry.',
    badge_type: 'eco-beginner',
    points_required: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'ac-2',
    name: 'Green Warrior',
    description: 'Complete 3 eco challenges and log entries for 2 categories.',
    badge_type: 'green-warrior',
    points_required: 100,
    created_at: new Date().toISOString()
  },
  {
    id: 'ac-3',
    name: 'Climate Champion',
    description: 'Reduce monthly carbon footprint by 15% and earn over 500 green points.',
    badge_type: 'climate-champion',
    points_required: 500,
    created_at: new Date().toISOString()
  },
  {
    id: 'ac-4',
    name: 'Sustainability Master',
    description: 'Achieve a gold sustainability score and reach 1500+ green points.',
    badge_type: 'sustainability-master',
    points_required: 1500,
    created_at: new Date().toISOString()
  }
];

// Helper to get/set LocalStorage items safely
const getLS = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLS = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initialize LocalStorage with default challenges/achievements if empty
const initLSDatabase = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(LS_KEYS.CHALLENGES)) {
    setLS(LS_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
  }
  if (!localStorage.getItem(LS_KEYS.ACHIEVEMENTS)) {
    setLS(LS_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  }
  if (!localStorage.getItem(LS_KEYS.PROFILES)) {
    // Seed standard dummy users for leaderboard / testing
    const seedProfiles: Profile[] = [
      {
        id: 'user-id-1',
        email: 'green.leader@ecotrack.ai',
        full_name: 'Elena Rostova',
        avatar_url: null,
        role: 'user',
        green_points: 620,
        sustainability_level: 'Climate Champion',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-id-2',
        email: 'solar.warrior@ecotrack.ai',
        full_name: 'Marcus Chen',
        avatar_url: null,
        role: 'user',
        green_points: 240,
        sustainability_level: 'Green Warrior',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin-id-1',
        email: 'admin@ecotrack.ai',
        full_name: 'EcoTrack Administrator',
        avatar_url: null,
        role: 'admin',
        green_points: 1600,
        sustainability_level: 'Sustainability Master',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setLS(LS_KEYS.PROFILES, seedProfiles);
    
    // Seed achievements for seed users
    const seedUserAchievements: UserAchievement[] = [
      { id: 'ua-1', user_id: 'user-id-1', achievement_id: 'ac-1', unlocked_at: new Date().toISOString() },
      { id: 'ua-2', user_id: 'user-id-1', achievement_id: 'ac-2', unlocked_at: new Date().toISOString() },
      { id: 'ua-3', user_id: 'user-id-1', achievement_id: 'ac-3', unlocked_at: new Date().toISOString() },
      { id: 'ua-4', user_id: 'user-id-2', achievement_id: 'ac-1', unlocked_at: new Date().toISOString() },
      { id: 'ua-5', user_id: 'user-id-2', achievement_id: 'ac-2', unlocked_at: new Date().toISOString() },
      { id: 'ua-6', user_id: 'admin-id-1', achievement_id: 'ac-1', unlocked_at: new Date().toISOString() },
      { id: 'ua-7', user_id: 'admin-id-1', achievement_id: 'ac-2', unlocked_at: new Date().toISOString() },
      { id: 'ua-8', user_id: 'admin-id-1', achievement_id: 'ac-3', unlocked_at: new Date().toISOString() },
      { id: 'ua-9', user_id: 'admin-id-1', achievement_id: 'ac-4', unlocked_at: new Date().toISOString() }
    ];
    setLS(LS_KEYS.USER_ACHIEVEMENTS, seedUserAchievements);
  }
};

if (typeof window !== 'undefined') {
  initLSDatabase();
}

// Local storage operations
const lsDatabase = {
  // Profiles
  getProfile: (id: string): Profile | null => {
    const profiles = getLS<Profile[]>(LS_KEYS.PROFILES, []);
    return profiles.find(p => p.id === id) || null;
  },
  
  createOrUpdateProfile: (profile: Partial<Profile> & { id: string; email: string }): Profile => {
    const profiles = getLS<Profile[]>(LS_KEYS.PROFILES, []);
    const index = profiles.findIndex(p => p.id === profile.id);
    
    let updatedProfile: Profile;
    if (index >= 0) {
      updatedProfile = {
        ...profiles[index],
        ...profile,
        updated_at: new Date().toISOString()
      } as Profile;
      profiles[index] = updatedProfile;
    } else {
      updatedProfile = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || 'Eco Warrior',
        avatar_url: profile.avatar_url || null,
        role: profile.role || 'user',
        green_points: profile.green_points ?? 0,
        sustainability_level: profile.sustainability_level || 'Eco Beginner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      profiles.push(updatedProfile);
    }
    
    setLS(LS_KEYS.PROFILES, profiles);
    return updatedProfile;
  },

  updatePointsAndLevel: (userId: string, pointsToAdd: number): Profile | null => {
    const profiles = getLS<Profile[]>(LS_KEYS.PROFILES, []);
    const index = profiles.findIndex(p => p.id === userId);
    if (index === -1) return null;

    const profile = profiles[index];
    const newPoints = profile.green_points + pointsToAdd;
    
    let newLevel = profile.sustainability_level;
    if (newPoints >= 1500) {
      newLevel = 'Sustainability Master';
    } else if (newPoints >= 500) {
      newLevel = 'Climate Champion';
    } else if (newPoints >= 100) {
      newLevel = 'Green Warrior';
    } else {
      newLevel = 'Eco Beginner';
    }

    const updated: Profile = {
      ...profile,
      green_points: newPoints,
      sustainability_level: newLevel,
      updated_at: new Date().toISOString()
    };
    
    profiles[index] = updated;
    setLS(LS_KEYS.PROFILES, profiles);
    
    // Check and trigger achievements unlock dynamically
    lsDatabase.checkAndUnlockAchievements(userId, newPoints);

    return updated;
  },

  checkAndUnlockAchievements: (userId: string, currentPoints: number) => {
    const userAchievements = getLS<UserAchievement[]>(LS_KEYS.USER_ACHIEVEMENTS, []);
    const achievements = getLS<Achievement[]>(LS_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
    
    achievements.forEach(ach => {
      const alreadyUnlocked = userAchievements.some(ua => ua.user_id === userId && ua.achievement_id === ach.id);
      if (!alreadyUnlocked && currentPoints >= ach.points_required) {
        userAchievements.push({
          id: `ua-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: userId,
          achievement_id: ach.id,
          unlocked_at: new Date().toISOString()
        });
      }
    });
    
    setLS(LS_KEYS.USER_ACHIEVEMENTS, userAchievements);
  },

  getAllProfiles: (): Profile[] => {
    return getLS<Profile[]>(LS_KEYS.PROFILES, []);
  },

  // Footprints
  getFootprintEntries: (userId: string): FootprintEntry[] => {
    const entries = getLS<FootprintEntry[]>(LS_KEYS.FOOTPRINTS, []);
    return entries.filter(e => e.user_id === userId).sort((a,b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime());
  },

  addFootprintEntry: (entry: Omit<FootprintEntry, 'id' | 'created_at'>): FootprintEntry => {
    const entries = getLS<FootprintEntry[]>(LS_KEYS.FOOTPRINTS, []);
    const newEntry: FootprintEntry = {
      ...entry,
      id: `fe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString()
    };
    entries.push(newEntry);
    setLS(LS_KEYS.FOOTPRINTS, entries);
    
    // Log entry awards 10 Green Points
    lsDatabase.updatePointsAndLevel(entry.user_id, 10);
    
    return newEntry;
  },

  deleteFootprintEntry: (id: string, userId: string): boolean => {
    const entries = getLS<FootprintEntry[]>(LS_KEYS.FOOTPRINTS, []);
    const filtered = entries.filter(e => !(e.id === id && e.user_id === userId));
    if (filtered.length !== entries.length) {
      setLS(LS_KEYS.FOOTPRINTS, filtered);
      return true;
    }
    return false;
  },

  // Goals
  getGoals: (userId: string): Goal[] => {
    const goals = getLS<Goal[]>(LS_KEYS.GOALS, []);
    return goals.filter(g => g.user_id === userId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'current_value' | 'status'>): Goal => {
    const goals = getLS<Goal[]>(LS_KEYS.GOALS, []);
    const newGoal: Goal = {
      ...goal,
      id: `gl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      current_value: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };
    goals.push(newGoal);
    setLS(LS_KEYS.GOALS, goals);
    return newGoal;
  },

  updateGoalProgress: (goalId: string, userId: string, currentValue: number, isCompleted: boolean): Goal | null => {
    const goals = getLS<Goal[]>(LS_KEYS.GOALS, []);
    const index = goals.findIndex(g => g.id === goalId && g.user_id === userId);
    if (index === -1) return null;

    const goal = goals[index];
    const updated: Goal = {
      ...goal,
      current_value: currentValue,
      status: isCompleted ? 'completed' : goal.status
    };
    
    goals[index] = updated;
    setLS(LS_KEYS.GOALS, goals);

    if (isCompleted && goal.status !== 'completed') {
      // Complete goal awards 100 points
      lsDatabase.updatePointsAndLevel(userId, 100);
    }

    return updated;
  },

  // Challenges
  getChallenges: (): Challenge[] => {
    return getLS<Challenge[]>(LS_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
  },

  addChallenge: (challenge: Omit<Challenge, 'id' | 'created_at'>): Challenge => {
    const challenges = getLS<Challenge[]>(LS_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
    const newChallenge: Challenge = {
      ...challenge,
      id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString()
    };
    challenges.push(newChallenge);
    setLS(LS_KEYS.CHALLENGES, challenges);
    return newChallenge;
  },

  getChallengeCompletions: (userId: string): ChallengeCompletion[] => {
    const completions = getLS<ChallengeCompletion[]>(LS_KEYS.COMPLETIONS, []);
    const challenges = getLS<Challenge[]>(LS_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
    
    return completions
      .filter(c => c.user_id === userId)
      .map(comp => ({
        ...comp,
        challenge: challenges.find(ch => ch.id === comp.challenge_id)
      }));
  },

  startChallenge: (userId: string, challengeId: string): ChallengeCompletion => {
    const completions = getLS<ChallengeCompletion[]>(LS_KEYS.COMPLETIONS, []);
    
    // Check if already active
    const existingActive = completions.find(c => c.user_id === userId && c.challenge_id === challengeId && c.status === 'active');
    if (existingActive) return existingActive;

    const newCompletion: ChallengeCompletion = {
      id: `cc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      challenge_id: challengeId,
      started_at: new Date().toISOString(),
      completed_at: null,
      status: 'active',
      created_at: new Date().toISOString()
    };

    completions.push(newCompletion);
    setLS(LS_KEYS.COMPLETIONS, completions);
    return newCompletion;
  },

  completeChallenge: (userId: string, challengeId: string): ChallengeCompletion | null => {
    const completions = getLS<ChallengeCompletion[]>(LS_KEYS.COMPLETIONS, []);
    const index = completions.findIndex(c => c.user_id === userId && c.challenge_id === challengeId && c.status === 'active');
    
    if (index === -1) return null;

    const challenge = getLS<Challenge[]>(LS_KEYS.CHALLENGES, DEFAULT_CHALLENGES).find(ch => ch.id === challengeId);
    if (!challenge) return null;

    const updated: ChallengeCompletion = {
      ...completions[index],
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    completions[index] = updated;
    setLS(LS_KEYS.COMPLETIONS, completions);

    // Reward points for challenge completion
    lsDatabase.updatePointsAndLevel(userId, challenge.points_reward);

    return updated;
  },

  // Achievements
  getAchievements: (): Achievement[] => {
    return getLS<Achievement[]>(LS_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  },

  getUserAchievements: (userId: string): UserAchievement[] => {
    const userAchievements = getLS<UserAchievement[]>(LS_KEYS.USER_ACHIEVEMENTS, []);
    const achievements = getLS<Achievement[]>(LS_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);

    return userAchievements
      .filter(ua => ua.user_id === userId)
      .map(ua => ({
        ...ua,
        achievement: achievements.find(a => a.id === ua.achievement_id)
      }));
  },

  // Reports
  getReports: (userId: string): Report[] => {
    const reports = getLS<Report[]>(LS_KEYS.REPORTS, []);
    return reports.filter(r => r.user_id === userId).sort((a,b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
  },

  addReport: (report: Omit<Report, 'id' | 'generated_at' | 'created_at'>): Report => {
    const reports = getLS<Report[]>(LS_KEYS.REPORTS, []);
    const newReport: Report = {
      ...report,
      id: `rp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      generated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    reports.push(newReport);
    setLS(LS_KEYS.REPORTS, reports);
    return newReport;
  },

  // Leaderboard
  getLeaderboard: (): LeaderboardEntry[] => {
    const profiles = getLS<Profile[]>(LS_KEYS.PROFILES, []);
    return profiles
      .sort((a,b) => b.green_points - a.green_points)
      .map((p, idx) => ({
        rank: idx + 1,
        user_id: p.id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        green_points: p.green_points,
        sustainability_level: p.sustainability_level
      }));
  }
};


// =========================================================================
// UNIFIED DATABASE SERVICE EXPORT
// =========================================================================

export const dbService = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getProfile(userId);
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Supabase profile error:', error);
      return lsDatabase.getProfile(userId); // fallback
    }
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getAllProfiles();
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch profiles error:', error);
      return lsDatabase.getAllProfiles();
    }
    return data || [];
  },

  async updateUserRole(userId: string, role: UserRole): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      const profiles = getLS<Profile[]>(LS_KEYS.PROFILES, []);
      const idx = profiles.findIndex(p => p.id === userId);
      if (idx !== -1) {
        profiles[idx].role = role;
        profiles[idx].updated_at = new Date().toISOString();
        setLS(LS_KEYS.PROFILES, profiles);
        return profiles[idx];
      }
      return null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update role error:', error);
      return null;
    }
    return data;
  },

  async createOrUpdateProfile(profile: Partial<Profile> & { id: string; email: string }): Promise<Profile> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.createOrUpdateProfile(profile);
    }
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert profile error:', error);
      return lsDatabase.createOrUpdateProfile(profile);
    }
    return data;
  },

  async updatePoints(userId: string, pointsToAdd: number): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.updatePointsAndLevel(userId, pointsToAdd);
    }
    
    // Fetch profile first to compute new level
    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const newPoints = profile.green_points + pointsToAdd;
    let newLevel = profile.sustainability_level;
    if (newPoints >= 1500) newLevel = 'Sustainability Master';
    else if (newPoints >= 500) newLevel = 'Climate Champion';
    else if (newPoints >= 100) newLevel = 'Green Warrior';
    else newLevel = 'Eco Beginner';

    const { data, error } = await supabase
      .from('profiles')
      .update({
        green_points: newPoints,
        sustainability_level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update points error:', error);
      return lsDatabase.updatePointsAndLevel(userId, pointsToAdd);
    }

    // Handle unlocking achievements in Supabase
    await this.checkAndUnlockSupabaseAchievements(userId, newPoints);

    return data;
  },

  async checkAndUnlockSupabaseAchievements(userId: string, currentPoints: number) {
    const { data: achievements } = await supabase.from('achievements').select('*');
    const { data: existing } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
    
    if (achievements) {
      const existingIds = (existing || []).map(e => e.achievement_id);
      const toUnlock = achievements.filter(ach => !existingIds.includes(ach.id) && currentPoints >= ach.points_required);
      
      for (const ach of toUnlock) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: ach.id
        });
      }
    }
  },

  // Footprint Entries
  async getFootprintEntries(userId: string): Promise<FootprintEntry[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getFootprintEntries(userId);
    }
    const { data, error } = await supabase
      .from('footprint_entries')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false });

    if (error) {
      console.error('Supabase footprints fetch error:', error);
      return lsDatabase.getFootprintEntries(userId);
    }
    return data || [];
  },

  async addFootprintEntry(entry: Omit<FootprintEntry, 'id' | 'created_at'>): Promise<FootprintEntry> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.addFootprintEntry(entry);
    }
    const { data, error } = await supabase
      .from('footprint_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Supabase footprint insert error:', error);
      return lsDatabase.addFootprintEntry(entry);
    }

    // Award points
    await this.updatePoints(entry.user_id, 10);

    return data;
  },

  async deleteFootprintEntry(id: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.deleteFootprintEntry(id, userId);
    }
    const { error } = await supabase
      .from('footprint_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase footprint delete error:', error);
      return lsDatabase.deleteFootprintEntry(id, userId);
    }
    return true;
  },

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getGoals(userId);
    }
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase goals fetch error:', error);
      return lsDatabase.getGoals(userId);
    }
    return data || [];
  },

  async addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'current_value' | 'status'>): Promise<Goal> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.addGoal(goal);
    }
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goal,
        current_value: 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase goal insert error:', error);
      return lsDatabase.addGoal(goal);
    }
    return data;
  },

  async updateGoalProgress(goalId: string, userId: string, currentValue: number, isCompleted: boolean): Promise<Goal | null> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.updateGoalProgress(goalId, userId, currentValue, isCompleted);
    }

    const updates: Partial<Goal> = { current_value: currentValue };
    if (isCompleted) {
      updates.status = 'completed';
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update goal error:', error);
      return lsDatabase.updateGoalProgress(goalId, userId, currentValue, isCompleted);
    }

    if (isCompleted) {
      await this.updatePoints(userId, 100);
    }

    return data;
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getChallenges();
    }
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Supabase challenges error:', error);
      return lsDatabase.getChallenges();
    }
    return data || [];
  },

  async addChallenge(challenge: Omit<Challenge, 'id' | 'created_at'>): Promise<Challenge> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.addChallenge(challenge);
    }
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()
      .single();

    if (error) {
      console.error('Supabase challenge creation error:', error);
      return lsDatabase.addChallenge(challenge);
    }
    return data;
  },

  async getChallengeCompletions(userId: string): Promise<ChallengeCompletion[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getChallengeCompletions(userId);
    }
    const { data, error } = await supabase
      .from('challenge_completions')
      .select('*, challenge:challenges(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase completions error:', error);
      return lsDatabase.getChallengeCompletions(userId);
    }
    return data || [];
  },

  async startChallenge(userId: string, challengeId: string): Promise<ChallengeCompletion> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.startChallenge(userId, challengeId);
    }
    const { data, error } = await supabase
      .from('challenge_completions')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase challenge start error:', error);
      return lsDatabase.startChallenge(userId, challengeId);
    }
    return data;
  },

  async completeChallenge(userId: string, challengeId: string): Promise<ChallengeCompletion | null> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.completeChallenge(userId, challengeId);
    }

    // Get challenge points
    const { data: challenge } = await supabase.from('challenges').select('points_reward').eq('id', challengeId).single();
    if (!challenge) return null;

    const { data, error } = await supabase
      .from('challenge_completions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) {
      console.error('Supabase challenge complete error:', error);
      return lsDatabase.completeChallenge(userId, challengeId);
    }

    // Reward points
    await this.updatePoints(userId, challenge.points_reward);

    return data;
  },

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getAchievements();
    }
    const { data, error } = await supabase
      .from('achievements')
      .select('*');

    if (error) {
      return lsDatabase.getAchievements();
    }
    return data || [];
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getUserAchievements(userId);
    }
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', userId);

    if (error) {
      return lsDatabase.getUserAchievements(userId);
    }
    return data || [];
  },

  // Reports
  async getReports(userId: string): Promise<Report[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getReports(userId);
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      return lsDatabase.getReports(userId);
    }
    return data || [];
  },

  async addReport(report: Omit<Report, 'id' | 'generated_at' | 'created_at'>): Promise<Report> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.addReport(report);
    }
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      return lsDatabase.addReport(report);
    }
    return data;
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured()) {
      return lsDatabase.getLeaderboard();
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, green_points, sustainability_level')
      .order('green_points', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase leaderboard fetch error:', error);
      return lsDatabase.getLeaderboard();
    }

    return (data || []).map((p, idx) => ({
      rank: idx + 1,
      user_id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      green_points: p.green_points,
      sustainability_level: p.sustainability_level
    }));
  }
};
