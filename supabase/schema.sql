-- TaskTask Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  theme TEXT NOT NULL DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TAGS TABLE (Nested Tag Folder System)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#6366f1',
  parent_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  is_folder BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- TASKS TABLE - Enhanced for Task Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  
  -- Tracking Mode (per task)
  tracking_mode TEXT NOT NULL DEFAULT 'time_tracker' CHECK (tracking_mode IN ('tally', 'time_tracker', 'pomodoro')),
  tracking_mode_updated_at TIMESTAMPTZ,
  
  -- Tally System
  tally_count INTEGER NOT NULL DEFAULT 0,
  tally_goal INTEGER NOT NULL DEFAULT 0,
  last_tally_at TIMESTAMPTZ,
  
  -- Time Tracker System
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  estimated_time_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Pomodoro System
  pomodoro_count INTEGER NOT NULL DEFAULT 0,
  pomodoro_goal INTEGER NOT NULL DEFAULT 1,
  pomodoro_duration INTEGER NOT NULL DEFAULT 1500, -- 25 phút
  pomodoro_remaining_seconds INTEGER NOT NULL DEFAULT 1500,
  
  -- Timer State
  timer_status TEXT NOT NULL DEFAULT 'idle' CHECK (timer_status IN ('idle', 'running', 'paused')),
  timer_started_at TIMESTAMPTZ,
  timer_paused_at TIMESTAMPTZ,
  accumulated_time_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Time Away Tracking
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  last_completed_pomodoro_at TIMESTAMPTZ,
  
  -- Reminder System
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_interval_minutes INTEGER NOT NULL DEFAULT 60,
  last_reminder_sent_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- TASK_TAGS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage task_tags" ON task_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- POMODORO SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 1500,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'aborted')),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pomodoro sessions" ON pomodoro_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create pomodoro sessions" ON pomodoro_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pomodoro sessions" ON pomodoro_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- TIME TRACKING TABLE (Timer Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS time_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  session_type TEXT NOT NULL DEFAULT 'manual' CHECK (session_type IN ('manual', 'pomodoro', 'break')),
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'abandoned', 'interrupted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time tracking" ON time_tracking
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create time tracking" ON time_tracking
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time tracking" ON time_tracking
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own time tracking" ON time_tracking
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- USER PETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_type TEXT NOT NULL DEFAULT 'cat',
  pet_name TEXT NOT NULL DEFAULT 'Buddy',
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  hunger INTEGER NOT NULL DEFAULT 100,
  happiness INTEGER NOT NULL DEFAULT 100,
  energy INTEGER NOT NULL DEFAULT 100,
  health INTEGER NOT NULL DEFAULT 100,
  state TEXT NOT NULL DEFAULT 'idle' CHECK (state IN ('idle', 'eating', 'playing', 'sleeping', 'sad')),
  mood TEXT NOT NULL DEFAULT 'happy' CHECK (mood IN ('happy', 'neutral', 'sad', 'excited', 'tired')),
  evolution_stage INTEGER NOT NULL DEFAULT 1,
  last_fed_at TIMESTAMPTZ,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet" ON user_pets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own pet" ON user_pets
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- PET FOODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pet_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  price_coins INTEGER NOT NULL,
  hunger_restore INTEGER NOT NULL,
  happiness_bonus INTEGER NOT NULL,
  xp_bonus INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pet foods
INSERT INTO pet_foods (name, icon, price_coins, hunger_restore, happiness_bonus, xp_bonus) VALUES
('Kibble', '🍖', 10, 20, 5, 5),
('Fish', '🐟', 25, 40, 10, 10),
('Treat', '🍪', 15, 15, 15, 8),
('Premium Meal', '🍲', 50, 60, 20, 20),
('Golden Bone', '🦴', 100, 80, 30, 50),
('Magic Fish', '✨', 200, 100, 50, 100)
ON CONFLICT DO NOTHING;

-- ============================================
-- SHOP ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frame', 'badge', 'title', 'pet', 'effect')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  price_coins INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default shop items
INSERT INTO shop_items (name, icon, category, rarity, price_coins, description) VALUES
('Bronze Frame', '🥉', 'frame', 'common', 100, 'A simple bronze frame for your avatar'),
('Silver Frame', '🥈', 'frame', 'uncommon', 250, 'A shiny silver frame'),
('Gold Frame', '🥇', 'frame', 'rare', 500, 'A magnificent gold frame'),
('Diamond Frame', '💎', 'frame', 'epic', 1000, 'A stunning diamond frame'),
('Legendary Aura', '🌟', 'frame', 'legendary', 2500, 'A legendary aura surrounds your avatar'),
('Early Bird Badge', '🐦', 'badge', 'common', 50, 'Complete a task before 8 AM'),
('Night Owl Badge', '🦉', 'badge', 'common', 50, 'Complete a task after 10 PM'),
('Productivity Master', '🏆', 'badge', 'rare', 300, 'Complete 50 tasks'),
('Streak Champion', '🔥', 'badge', 'epic', 500, 'Maintain a 7-day streak'),
('Task Legend', '👑', 'badge', 'legendary', 1000, 'Complete 200 tasks'),
('Pro Title', '💼', 'title', 'uncommon', 150, 'Display "Pro" next to your name'),
('Master Title', '🎓', 'title', 'rare', 400, 'Display "Master" next to your name'),
('Legend Title', '⚡', 'title', 'legendary', 1000, 'Display "Legend" next to your name')
ON CONFLICT DO NOTHING;

-- ============================================
-- USER INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  equipped BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON user_inventory
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own inventory" ON user_inventory
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coins_reward INTEGER NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT false
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, xp_reward, coins_reward, condition_type, condition_value) VALUES
('First Step', 'Complete your first task', '🎯', 50, 25, 'tasks_completed', 1),
('Getting Started', 'Complete 10 tasks', '📝', 100, 50, 'tasks_completed', 10),
('Productive Pro', 'Complete 50 tasks', '💪', 200, 100, 'tasks_completed', 50),
('Task Master', 'Complete 100 tasks', '👑', 500, 250, 'tasks_completed', 100),
('Streak Starter', 'Maintain a 3-day streak', '🔥', 75, 30, 'streak_days', 3),
('Streak Master', 'Maintain a 7-day streak', '⭐', 150, 75, 'streak_days', 7),
('Pomodoro Beginner', 'Complete 5 pomodoro sessions', '🍅', 50, 25, 'pomodoro_sessions', 5),
('Focus Champion', 'Complete 25 pomodoro sessions', '🎯', 150, 75, 'pomodoro_sessions', 25),
('Pet Lover', 'Adopt your first pet', '🐱', 100, 50, 'pets_adopted', 1),
('Generous Soul', 'Spend 100 coins in shop', '🛒', 50, 0, 'coins_spent', 100)
ON CONFLICT DO NOTHING;

-- ============================================
-- USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own achievements" ON user_achievements
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pets_updated_at BEFORE UPDATE ON user_pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(p_xp / 100) + 1;
END;
$$ language 'plpgsql';

-- Function to handle task completion rewards
CREATE OR REPLACE FUNCTION complete_task_reward(p_task_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_xp_reward INTEGER := 10;
  v_coins_reward INTEGER := 5;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Get user_id from task
  SELECT user_id INTO v_user_id FROM tasks WHERE id = p_task_id;

  -- Update profile with rewards
  UPDATE profiles
  SET 
    xp = xp + v_xp_reward,
    coins = coins + v_coins_reward,
    last_active_at = NOW()
  WHERE id = v_user_id;

  -- Check for level up
  SELECT level INTO v_new_level 
  FROM profiles 
  WHERE id = v_user_id;

  -- Check if leveled up (simplified logic)
  IF v_new_level > (SELECT level FROM profiles WHERE id = v_user_id AND xp - v_xp_reward < 100) THEN
    v_level_up := true;
  END IF;

  RETURN json_build_object(
    'xp_earned', v_xp_reward,
    'coins_earned', v_coins_reward,
    'level_up', v_level_up,
    'new_level', v_new_level
  );
END;
$$ language 'plpgsql';

-- Function to calculate streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER;
  v_last_active DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT streak_days, last_active_at INTO v_streak, v_last_active
  FROM profiles WHERE id = p_user_id;

  IF v_last_active::DATE = v_today - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE profiles SET streak_days = streak_days + 1 WHERE id = p_user_id;
    RETURN v_streak + 1;
  ELSIF v_last_active::DATE < v_today - INTERVAL '1 day' THEN
    -- Reset streak
    UPDATE profiles SET streak_days = 1 WHERE id = p_user_id;
    RETURN 1;
  END IF;
  
  RETURN v_streak;
END;
$$ language 'plpgsql';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_task_id ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_task_id ON time_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Done
SELECT 'TaskTask Database Schema created successfully!' as status;
