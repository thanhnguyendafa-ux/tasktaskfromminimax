"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Coins, Trophy, Plus, Target, Gift, Users, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/common/BottomNav";
import { FAB } from "@/components/common/FAB";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { ViewSwitcher } from "@/components/common/ViewSwitcher";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskDetailTracking } from "@/components/tasks/TaskDetailTracking";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { GoalsTracker } from "@/components/goals/GoalsTracker";
import { DailyChallenges } from "@/components/challenges/DailyChallenges";
import { DailyRewards } from "@/components/rewards/DailyRewards";
import { ProductivityAnalytics } from "@/components/analytics/ProductivityAnalytics";
import { CollectionBadges } from "@/components/badges/CollectionBadges";
import { ExportPanel } from "@/components/export/ExportPanel";
import { OfflineManager } from "@/components/offline/OfflineManager";
import { TeamWorkspace } from "@/components/collaboration/TeamWorkspace";
import { PetFeeding } from "@/components/pet/PetFeeding";
import { PetEvolution } from "@/components/pet/PetEvolution";
import { useTaskStore } from "@/stores/useTaskStore";
import { useUserStore } from "@/stores/useUserStore";
import { Task, Habit, Goal, Challenge, DailyReward, UserStats, ViewType } from "@/types";
import { TaskViewFactory } from "@/components/tasks/TaskViewFactory";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDetailTracking, setShowDetailTracking] = useState(false);
  const [showTeamWorkspace, setShowTeamWorkspace] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, setTasks, updateTask } = useTaskStore();
  const { profile, addXp, addCoins } = useUserStore();

  // Daily reset for tally counts
  useEffect(() => {
    const lastReset = localStorage.getItem('lastTallyReset');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastReset !== today && tasks.length > 0) {
      tasks.forEach((t) => {
        if (t.tally_count > 0) {
          updateTask(t.id, { tally_count: 0 });
        }
      });
      localStorage.setItem('lastTallyReset', today);
    }
  }, [tasks.length]);

  // Demo data for integrated components
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", user_id: "demo", name: "Morning jog", icon: "🏃", color: "#10b981", frequency: "daily", target_count: 1, current_count: 1, streak: 7, best_streak: 14, is_active: true, created_at: new Date().toISOString() },
    { id: "2", user_id: "demo", name: "Read 30 min", icon: "📚", color: "#6366f1", frequency: "daily", target_count: 1, current_count: 0, streak: 3, best_streak: 10, is_active: true, created_at: new Date().toISOString() },
    { id: "3", user_id: "demo", name: "Drink water", icon: "💧", color: "#0ea5e9", frequency: "daily", target_count: 8, current_count: 5, streak: 12, best_streak: 20, is_active: true, created_at: new Date().toISOString() },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", user_id: "demo", title: "Complete 100 tasks", description: "Q1 2025 goal", target_value: 100, current_value: 45, reward_xp: 400, reward_coins: 200, deadline: "2026-12-31", is_completed: false, created_at: new Date().toISOString() },
    { id: "2", user_id: "demo", title: "Reach Level 10", description: "Level up!", target_value: 10000, current_value: 4500, reward_xp: 1000, reward_coins: 500, deadline: "2026-12-31", is_completed: false, created_at: new Date().toISOString() },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: "1", user_id: "demo", title: "Complete 5 tasks today", description: "Daily task challenge", type: "daily", target: 5, current_progress: 3, reward_xp: 50, reward_coins: 25, is_completed: false, expires_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: "2", user_id: "demo", title: "Do 10 pomodoros", description: "Focus challenge", type: "daily", target: 10, current_progress: 6, reward_xp: 75, reward_coins: 30, is_completed: false, expires_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: "3", user_id: "demo", title: "Maintain 7-day streak", description: "Weekly streak challenge", type: "weekly", target: 7, current_progress: 4, reward_xp: 200, reward_coins: 100, is_completed: false, expires_at: new Date(Date.now() + 604800000).toISOString(), created_at: new Date().toISOString() },
  ]);

  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([
    { day: 1, coins: 10, item_rarity: null, is_claimed: true },
    { day: 2, coins: 15, item_rarity: null, is_claimed: true },
    { day: 3, coins: 20, item_rarity: "uncommon", is_claimed: false },
    { day: 4, coins: 25, item_rarity: null, is_claimed: false },
    { day: 5, coins: 30, item_rarity: "rare", is_claimed: false },
    { day: 6, coins: 35, item_rarity: null, is_claimed: false },
    { day: 7, coins: 50, item_rarity: "epic", is_claimed: false },
  ]);

  const userStats: UserStats = {
    total_tasks_completed: 156,
    total_pomodoros: 423,
    total_time_seconds: 75600,
    current_streak: 7,
    best_streak: 14,
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    coins: profile?.coins || 0,
  };

  const weeklyData = [
    { day: "Mon", tasks: 5, hours: 4.5 },
    { day: "Tue", tasks: 7, hours: 6.0 },
    { day: "Wed", tasks: 4, hours: 3.5 },
    { day: "Thu", tasks: 8, hours: 7.0 },
    { day: "Fri", tasks: 6, hours: 5.5 },
    { day: "Sat", tasks: 3, hours: 2.0 },
    { day: "Sun", tasks: 2, hours: 1.5 },
  ];

  const collectionBadges = [
    { id: "1", name: "First Step", description: "Complete first task", icon: "🎯", requirement: "Complete 1 task", xpReward: 50, isUnlocked: true },
    { id: "2", name: "Week Warrior", description: "7-day streak", icon: "🔥", requirement: "7-day streak", xpReward: 100, isUnlocked: true },
    { id: "3", name: "Century Club", description: "100 tasks", icon: "🏆", requirement: "100 tasks", xpReward: 200, isUnlocked: false },
    { id: "4", name: "Pomodoro Pro", description: "100 pomodoros", icon: "🍅", requirement: "100 pomodoros", xpReward: 150, isUnlocked: true },
  ];

  const teamMembers = [
    { id: "1", name: "John", role: "admin" as const, xp: 1500, tasksCompleted: 45, isOnline: true },
    { id: "2", name: "Sarah", role: "editor" as const, xp: 1200, tasksCompleted: 38, isOnline: true },
    { id: "3", name: "Mike", role: "viewer" as const, xp: 980, tasksCompleted: 25, isOnline: false },
  ];

  const teamTasks = [
    { id: "1", title: "Q1 Planning", assignedTo: ["1", "2"], status: "in_progress" as const, dueDate: "2025-01-25" },
    { id: "2", title: "Bug Fixes", assignedTo: ["3"], status: "pending" as const, dueDate: "2025-01-22" },
    { id: "3", title: "Code Review", assignedTo: ["1"], status: "completed" as const, dueDate: "2025-01-20" },
  ];

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedToday = tasks.filter(
    (t) => t.status === "completed" && t.updated_at.startsWith(new Date().toISOString().split("T")[0])
  );

  const handleCompleteTask = (taskId: string) => {
    updateTask(taskId, { status: "completed" });
    addXp(10);
    addCoins(5);
  };

  const handleTally = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const newCount = task.tally_count + 1;
      updateTask(taskId, { 
        tally_count: newCount,
        last_tally_at: new Date().toISOString()
      });
      
      // Reward khi đạt goal
      if (newCount >= task.tally_goal) {
        addXp(10);
        addCoins(5);
      }
    }
  };

  const handlePomodoro = (taskId: string) => {
    // Navigate to timer with task
    setCurrentPage("timer");
  };

  const handleTimer = (taskId: string) => {
    // Navigate to timer
    setCurrentPage("timer");
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowDetailTracking(true);
  };

  const handleAddHabit = (habit: Omit<Habit, "id" | "user_id" | "created_at" | "streak" | "best_streak" | "current_count">) => {
    setHabits([...habits, { ...habit, id: crypto.randomUUID(), user_id: "demo", current_count: 0, streak: 0, best_streak: 0, created_at: new Date().toISOString() }]);
  };

  const handleCompleteHabit = (habitId: string) => {
    setHabits(habits.map((h) => {
      if (h.id === habitId && h.current_count < h.target_count) {
        const newStreak = h.streak + 1;
        return { ...h, current_count: h.current_count + 1, streak: newStreak, best_streak: Math.max(newStreak, h.best_streak) };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId));
  };

  const handleAddGoal = (goal: Omit<Goal, "id" | "user_id" | "created_at" | "current_value" | "is_completed">) => {
    setGoals([...goals, { ...goal, id: crypto.randomUUID(), user_id: "demo", current_value: 0, is_completed: false, created_at: new Date().toISOString() }]);
  };

  const handleUpdateGoalProgress = (goalId: string, increment: number) => {
    setGoals(goals.map((g) => g.id === goalId ? { ...g, current_value: g.current_value + increment } : g));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
  };

  const handleClaimChallenge = (challengeId: string) => {
    setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, is_completed: true } : c));
    addXp(50);
    addCoins(25);
  };

  const handleUpdateChallengeProgress = (challengeId: string, increment: number) => {
    setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, current_progress: c.current_progress + increment } : c));
  };

  const handleClaimDailyReward = (day: number) => {
    setDailyRewards(dailyRewards.map((r) => r.day === day ? { ...r, is_claimed: true } : r));
    const reward = dailyRewards.find((r) => r.day === day);
    if (reward) {
      addCoins(reward.coins);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className="p-4 space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={profile?.display_name || "User"} showLevel level={profile?.level || 1} />
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    Hello, {profile?.display_name || "User"} 👋
                  </h1>
                  <p className="text-sm text-text-muted">Let&apos;s be productive today!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-dark-tertiary"
                  onClick={() => setShowAnalytics(true)}
                >
                  <BarChart3 className="w-5 h-5 text-text-primary" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-dark-tertiary"
                  onClick={() => setShowTeamWorkspace(true)}
                >
                  <Users className="w-5 h-5 text-text-primary" />
                </motion.button>
                <ThemeSwitcher />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="text-center">
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-text-primary">{profile?.streak_days || 0}</p>
                <p className="text-xs text-text-muted">Day Streak</p>
              </Card>
              <Card className="text-center">
                <Coins className="w-6 h-6 text-accent-gold mx-auto mb-1" />
                <p className="text-2xl font-bold text-text-primary">{profile?.coins || 0}</p>
                <p className="text-xs text-text-muted">Coins</p>
              </Card>
              <Card className="text-center">
                <Trophy className="w-6 h-6 text-accent-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-text-primary">{profile?.level || 1}</p>
                <p className="text-xs text-text-muted">Level</p>
              </Card>
            </div>

            {/* Daily Rewards */}
            <DailyRewards
              rewards={dailyRewards}
              currentStreak={profile?.streak_days || 0}
              onClaim={handleClaimDailyReward}
            />

            {/* XP Progress */}
            <Card>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">XP Progress</span>
                <span className="text-sm font-medium text-text-primary">
                  {profile?.xp || 0} / {((profile?.level || 1) * 100)} XP
                </span>
              </div>
              <ProgressBar value={(profile?.xp || 0) % 100} max={100} color="warning" />
            </Card>

            {/* Daily Challenges */}
            <DailyChallenges
              challenges={challenges}
              onClaimReward={handleClaimChallenge}
              onUpdateProgress={handleUpdateChallengeProgress}
            />

            {/* Habits */}
            <HabitTracker
              habits={habits}
              onAddHabit={handleAddHabit}
              onCompleteHabit={handleCompleteHabit}
              onDeleteHabit={handleDeleteHabit}
            />

            {/* Goals */}
            <GoalsTracker
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
            />

            {/* Today's Progress */}
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Today&apos;s Progress</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Tasks</span>
                <span className="text-sm font-medium text-text-primary">
                  {completedToday.length} / {pendingTasks.length + completedToday.length}
                </span>
              </div>
              <ProgressBar
                value={completedToday.length}
                max={pendingTasks.length + completedToday.length || 1}
                color="success"
              />
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-accent-primary rounded-xl text-white font-medium"
                onClick={() => setShowTaskForm(true)}
              >
                + New Task
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-dark-tertiary rounded-xl text-text-primary font-medium"
                onClick={() => setCurrentPage("timer")}
              >
                ⏱️ Focus
              </motion.button>
            </div>

            {/* Today's Tasks */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Today&apos;s Tasks</h2>
              {pendingTasks.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-text-muted">No tasks yet. Create one!</p>
                </Card>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onTally={handleTally}
                    onPomodoro={handlePomodoro}
                    onTimer={handleTimer}
                    onClick={() => handleTaskClick(task)}
                  />
                ))
              )}
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="p-4 space-y-4 pb-20">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-text-primary">Tasks</h1>
              <div className="flex items-center gap-2">
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
                <ThemeSwitcher />
              </div>
            </div>
            {tasks.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-text-muted">No tasks yet</p>
              </Card>
            ) : (
              <TaskViewFactory
                view={currentView}
                tasks={tasks}
                onComplete={handleCompleteTask}
                onTally={handleTally}
                onPomodoro={handlePomodoro}
                onTimer={handleTimer}
                onStatusChange={(taskId, status) => {
                  const task = tasks.find(t => t.id === taskId);
                  if (task) {
                    updateTask(taskId, { status });
                  }
                }}
                onClick={handleTaskClick}
              />
            )}
          </div>
        );

      case "timer":
        return (
          <div className="p-4 space-y-4 pb-20">
            <h1 className="text-xl font-bold text-text-primary">Focus Timer</h1>
            <Card className="text-center py-12">
              <p className="text-text-secondary mb-4">Select a task to start focusing</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-accent-primary rounded-xl text-white font-medium"
                onClick={() => setCurrentPage("tasks")}
              >
                Select Task
              </motion.button>
            </Card>
          </div>
        );

      case "pet":
        return (
          <div className="p-4 space-y-4 pb-20">
            <h1 className="text-xl font-bold text-text-primary">Your Pet</h1>
            <PetFeeding
              petName="Coffee Cup"
              currentHunger={80}
              userCoins={profile?.coins || 0}
              onFeed={(food) => console.log("Feed:", food)}
            />
            <PetEvolution
              petName="Coffee Cup"
              petType="cat"
              currentLevel={3}
              currentXP={450}
              evolutionStage={2}
              feedCount={20}
              playCount={15}
              onEvolve={() => console.log("Evolve!")}
            />
          </div>
        );

      case "shop":
        return (
          <div className="p-4 space-y-4 pb-20">
            <h1 className="text-xl font-bold text-text-primary">Shop</h1>
            <Card className="text-center py-8">
              <p className="text-text-muted">Shop coming soon!</p>
            </Card>
          </div>
        );

      case "profile":
        return (
          <div className="p-4 space-y-4 pb-20">
            <h1 className="text-xl font-bold text-text-primary">Profile</h1>
            <Card className="text-center py-8">
              <Avatar name={profile?.display_name || "User"} size="xl" showLevel level={profile?.level || 1} />
              <h2 className="text-xl font-semibold text-text-primary mt-4">{profile?.display_name || "User"}</h2>
              <p className="text-text-muted">Level {profile?.level || 1}</p>
            </Card>
            <ExportPanel tasks={tasks} profile={{ id: "demo", display_name: "User", email: "user@example.com" }} />
            <OfflineManager isOnline={true} pendingChanges={0} lastSyncTime={new Date()} onSync={() => {}} onClearCache={() => {}} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      {renderContent()}
      <FAB onClick={() => setShowTaskForm(true)} visible={currentPage === "home" || currentPage === "tasks"} />
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={(task) => {
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            user_id: profile?.id || "demo",
            tally_count: 0,
            pomodoro_count: 0,
            total_time_seconds: 0,
            last_active_at: new Date().toISOString(),
            reminder_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Task;
          setTasks([...tasks, newTask]);
        }}
        tags={[]}
      />
      {showDetailTracking && selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailTracking(false)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <TaskDetailTracking
              task={selectedTask}
              onUpdateTally={(increment) => updateTask(selectedTask.id, { tally_count: selectedTask.tally_count + increment })}
              onStartPomodoro={() => updateTask(selectedTask.id, { pomodoro_count: selectedTask.pomodoro_count + 1 })}
              onStopPomodoro={() => {}}
              onStartTimer={() => updateTask(selectedTask.id, { total_time_seconds: selectedTask.total_time_seconds + 900 })}
              onStopTimer={() => {}}
              onAddManualTime={(minutes) => updateTask(selectedTask.id, { total_time_seconds: selectedTask.total_time_seconds + minutes * 60 })}
              onUpdateReminder={(enabled, interval) => updateTask(selectedTask.id, { reminder_enabled: enabled, reminder_interval_minutes: interval })}
              onUpdateGoal={(goal) => console.log("Update goal:", goal)}
            />
          </div>
        </div>
      )}
      {showTeamWorkspace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTeamWorkspace(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <TeamWorkspace
              teamName="Engineering"
              members={teamMembers}
              tasks={teamTasks}
              currentUserId="1"
              onInviteMember={(email) => console.log("Invite:", email)}
              onAssignTask={(taskId, userId) => console.log("Assign:", taskId, userId)}
              onCreateTask={(task) => console.log("Create:", task)}
            />
          </div>
        </div>
      )}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAnalytics(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-dark-primary rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Analytics</h2>
                <button onClick={() => setShowAnalytics(false)} className="text-text-muted">✕</button>
              </div>
              <ProductivityAnalytics stats={userStats} weeklyData={weeklyData} />
              <div className="mt-4">
                <CollectionBadges badges={collectionBadges} onClaim={(id) => console.log("Claim badge:", id)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
