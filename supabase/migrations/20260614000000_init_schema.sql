-- Supabase Database Schema for EcoTrack AI
-- Description: Sets up profiles, carbon calculations, gamification, and security.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    green_points integer not null default 0,
    sustainability_level text not null default 'Eco Beginner' check (sustainability_level in ('Eco Beginner', 'Green Warrior', 'Climate Champion', 'Sustainability Master')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. Footprint Entries Table
create table public.footprint_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    recorded_date date not null default current_date,
    category text not null check (category in ('transport', 'energy', 'food', 'waste')),
    sub_category text not null, -- e.g., 'car', 'electricity', 'vegetarian', 'plastic'
    value numeric not null check (value >= 0),
    co2_emission numeric not null check (co2_emission >= 0), -- in kg CO2e
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Enable RLS on footprint entries
alter table public.footprint_entries enable row level security;

-- 3. Goals Table
create table public.goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    target_reduction_pct numeric not null check (target_reduction_pct > 0 and target_reduction_pct <= 100),
    start_date date not null default current_date,
    target_date date not null,
    status text not null default 'active' check (status in ('active', 'completed', 'failed')),
    current_value numeric not null default 0 check (current_value >= 0),
    target_value numeric not null check (target_value >= 0),
    created_at timestamptz not null default now()
);

-- Enable RLS on goals
alter table public.goals enable row level security;

-- 4. Challenges Table
create table public.challenges (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    category text not null check (category in ('transport', 'energy', 'food', 'waste', 'community')),
    points_reward integer not null check (points_reward > 0),
    duration_days integer not null check (duration_days > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Enable RLS on challenges
alter table public.challenges enable row level security;

-- 5. Challenge Completions Table
create table public.challenge_completions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
    created_at timestamptz not null default now(),
    unique(user_id, challenge_id, status) -- prevents duplicate active/completed records for same challenge
);

-- Enable RLS on challenge completions
alter table public.challenge_completions enable row level security;

-- 6. Achievements / Badges Definition Table
create table public.achievements (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text not null,
    badge_type text not null check (badge_type in ('eco-beginner', 'green-warrior', 'climate-champion', 'sustainability-master')),
    points_required integer not null check (points_required >= 0),
    created_at timestamptz not null default now()
);

-- Enable RLS on achievements
alter table public.achievements enable row level security;

-- 7. User Achievements Table
create table public.user_achievements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    achievement_id uuid references public.achievements(id) on delete cascade not null,
    unlocked_at timestamptz not null default now(),
    unique(user_id, achievement_id)
);

-- Enable RLS on user achievements
alter table public.user_achievements enable row level security;

-- 8. Reports Table
create table public.reports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    report_type text not null default 'monthly' check (report_type in ('monthly', 'progress')),
    generated_at timestamptz not null default now(),
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Enable RLS on reports
alter table public.reports enable row level security;

-- =========================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =========================================================================
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_points on public.profiles(green_points desc);
create index idx_footprint_user_date on public.footprint_entries(user_id, recorded_date);
create index idx_footprint_category on public.footprint_entries(category);
create index idx_goals_user_status on public.goals(user_id, status);
create index idx_challenge_completions_user on public.challenge_completions(user_id, status);
create index idx_user_achievements_user on public.user_achievements(user_id);
create index idx_reports_user on public.reports(user_id, generated_at);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Profiles policies
create policy "Public profiles are viewable by authenticated users"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "Admins can do everything on profiles"
    on public.profiles for all
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Footprint entries policies
create policy "Users can view their own footprint entries"
    on public.footprint_entries for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own footprint entries"
    on public.footprint_entries for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own footprint entries"
    on public.footprint_entries for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own footprint entries"
    on public.footprint_entries for delete
    to authenticated
    using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view their own goals"
    on public.goals for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own goals"
    on public.goals for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own goals"
    on public.goals for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own goals"
    on public.goals for delete
    to authenticated
    using (auth.uid() = user_id);

-- Challenges policies
create policy "Challenges are viewable by authenticated users"
    on public.challenges for select
    to authenticated
    using (true);

create policy "Only admins can modify challenges"
    on public.challenges for all
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Challenge completions policies
create policy "Users can view their own completions"
    on public.challenge_completions for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can modify their own completions"
    on public.challenge_completions for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Achievements policies
create policy "Achievements are viewable by authenticated users"
    on public.achievements for select
    to authenticated
    using (true);

create policy "Only admins can modify achievements"
    on public.achievements for all
    to authenticated
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- User achievements policies
create policy "Users can view their own achievements"
    on public.user_achievements for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can unlock achievements"
    on public.user_achievements for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Reports policies
create policy "Users can view their own reports"
    on public.reports for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own reports"
    on public.reports for insert
    to authenticated
    with check (auth.uid() = user_id);

-- =========================================================================
-- AUTOMATIC PROFILE CREATION ON SIGN UP
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed initial achievements
insert into public.achievements (name, description, badge_type, points_required) values
('Eco Beginner', 'Welcome to EcoTrack AI! Set up your account and log your first carbon entry.', 'eco-beginner', 0),
('Green Warrior', 'Complete 3 eco challenges and log entries for 2 categories.', 'green-warrior', 100),
('Climate Champion', 'Reduce monthly carbon footprint by 15% and earn over 500 green points.', 'climate-champion', 500),
('Sustainability Master', 'Achieve a gold sustainability score and reach 1500+ green points.', 'sustainability-master', 1500)
on conflict (name) do nothing;

-- Seed initial challenges
insert into public.challenges (title, description, category, points_reward, duration_days) values
('No Car Day', 'Walk, cycle, or use public transport instead of driving for an entire day.', 'transport', 30, 1),
('Zero Plastic Week', 'Avoid single-use plastics completely for 7 days.', 'waste', 100, 7),
('Energy Saver Challenge', 'Turn off all non-essential electric appliances and keep energy usage low for a weekend.', 'energy', 50, 2),
('Tree Plantation Drive', 'Plant at least one sapling in your community and take care of it.', 'community', 150, 5),
('Plant-Based Weekend', 'Eat fully vegetarian or vegan meals for 2 consecutive days.', 'food', 40, 2)
on conflict do nothing;
