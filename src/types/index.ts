// TypeScript definitions for EcoTrack AI

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  green_points: number;
  sustainability_level: 'Eco Beginner' | 'Green Warrior' | 'Climate Champion' | 'Sustainability Master';
  created_at: string;
  updated_at: string;
}

export type CarbonCategory = 'transport' | 'energy' | 'food' | 'waste';

export interface FootprintEntry {
  id: string;
  user_id: string;
  recorded_date: string; // YYYY-MM-DD
  category: CarbonCategory;
  sub_category: string;
  value: number; // raw value input
  co2_emission: number; // computed emissions in kg CO2e
  metadata: Record<string, any>;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_reduction_pct: number;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'failed';
  current_value: number; // average weekly/monthly carbon at start or current progress
  target_value: number; // target carbon amount
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory | 'community';
  points_reward: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  // populated challenge fields for convenience
  challenge?: Challenge;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_type: 'eco-beginner' | 'green-warrior' | 'climate-champion' | 'sustainability-master';
  points_required: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Report {
  id: string;
  user_id: string;
  report_type: 'monthly' | 'progress';
  generated_at: string;
  data: {
    period: string; // e.g., "June 2026"
    total_carbon: number;
    category_breakdown: Record<CarbonCategory, number>;
    goals_progress: Array<{ title: string; reduction_pct: number; status: string }>;
    ai_summary: string;
    suggestions: string[];
  };
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  green_points: number;
  sustainability_level: string;
}
