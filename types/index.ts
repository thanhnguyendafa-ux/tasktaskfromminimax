export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  coins: number;
  xp: number;
  level: number;
  streak_days: number;
  last_active_at: string;
  theme: 'dark' | 'mint' | 'slate';
  created_at: string;
  updated_at: string;
}

export type TrackingMode = 'tally' | 'time_tracker' | 'pomodoro';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  
  // Tracking Mode (per task)
  tracking_mode: TrackingMode;
  tracking_mode_updated_at: string | null;
  
  // Tally System (count up)
  tally_count: number;
  tally_goal: number;
  last_tally_at: string | null;
  
  // Time Tracker System (count up)
  total_time_seconds: number;
  estimated_time_seconds: number;
  
  // Pomodoro System (count down)
  pomodoro_count: number;
  pomodoro_goal: number;
  pomodoro_duration: number;
  pomodoro_remaining_seconds: number;
  
  // Timer State
  timer_status: 'idle' | 'running' | 'paused';
  timer_started_at: string | null;
  timer_paused_at: string | null;
  accumulated_time_seconds: number;
  
  // Time Away Tracking
  last_active_at: string;
  last_completed_pomodoro_at: string | null;
  
  // Reminder System
  reminder_enabled: boolean;
  reminder_interval_minutes: number;
  last_reminder_sent_at: string | null;
  next_reminder_at: string | null;
  reminder_count: number;
  
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  is_folder: boolean;
  sort_order: number;
  children?: Tag[];
  tasks?: Task[];
}

export interface PomodoroSession {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  status: 'in_progress' | 'completed' | 'aborted';
  xp_earned: number;
  coins_earned: number;
}

export interface TimeTracking {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  session_type: 'manual' | 'pomodoro' | 'break';
  xp_earned: number;
  coins_earned: number;
  status: 'completed' | 'abandoned' | 'interrupted';
  created_at: string;
}

export interface FocusAnalytics {
  totalMinutes: number;
  totalSessions: number;
  averageSessionMinutes: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  streakDays: number;
  mostProductiveDay: string | null;
  topTasks: { taskId: string; title: string; minutes: number }[];
  dailyData: { date: string; minutes: number; sessions: number }[];
}

export interface UserPet {
  id: string;
  user_id: string;
  pet_type: string;
  pet_name: string;
  level: number;
  experience: number;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  state: 'idle' | 'eating' | 'playing' | 'sleeping' | 'sad';
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
  evolution_stage: number;
  last_fed_at: string | null;
  last_played_at: string | null;
}

export interface PetFood {
  id: string;
  name: string;
  icon: string;
  price_coins: number;
  hunger_restore: number;
  happiness_bonus: number;
  xp_bonus: number;
}

export interface PetItem {
  id: string;
  name: string;
  icon: string;
  category: 'hat' | 'collar' | 'toy' | 'bed' | 'decoration';
  price: number;
  bonus_type: string;
  bonus_value: number;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  target_count: number;
  current_count: number;
  streak: number;
  best_streak: number;
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes: string | null;
}

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  current_progress: number;
  reward_xp: number;
  reward_coins: number;
  is_completed: boolean;
  expires_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  reward_xp: number;
  reward_coins: number;
  deadline: string;
  is_completed: boolean;
  created_at: string;
}

export interface DailyReward {
  day: number;
  coins: number;
  item_rarity: string | null;
  is_claimed: boolean;
}

export interface UserStats {
  total_tasks_completed: number;
  total_pomodoros: number;
  total_time_seconds: number;
  current_streak: number;
  best_streak: number;
  level: number;
  xp: number;
  coins: number;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  category: 'frame' | 'badge' | 'title' | 'pet' | 'effect';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price_coins: number;
  is_active: boolean;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  item: ShopItem;
  acquired_at: string;
  equipped: boolean;
}

export type ViewType = 'main' | 'list' | 'kanban' | 'calendar' | 'gallery' | 'gantt' | 'timeline' | 'database';
export type ThemeType = 'dark' | 'mint' | 'slate';

export interface TaskFilters {
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  tag: string | null;
}
