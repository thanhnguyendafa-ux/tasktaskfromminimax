"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Coins, Trophy, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/common/BottomNav";
import { FAB } from "@/components/common/FAB";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { ViewSwitcher } from "@/components/common/ViewSwitcher";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTaskStore } from "@/stores/useTaskStore";
import { useUserStore } from "@/stores/useUserStore";
import { Task } from "@/types";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { tasks, setTasks, updateTask } = useTaskStore();
  const { profile, addXp, addCoins } = useUserStore();

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
      updateTask(taskId, { tally_count: task.tally_count + 1 });
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
    // Navigate to task detail
    console.log("Task clicked:", task.id);
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
              <ThemeSwitcher />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
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

            {/* XP Progress */}
            <Card>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">XP Progress</span>
                <span className="text-sm font-medium text-text-primary">
                  {profile?.xp || 0} / {((profile?.level || 1) + 1) * 100}
                </span>
              </div>
              <ProgressBar value={profile?.xp || 0} max={((profile?.level || 1) + 1) * 100} color="warning" />
            </Card>

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
              <ThemeSwitcher />
            </div>
            <ViewSwitcher currentView="list" onViewChange={() => {}} />
            {tasks.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-text-muted">No tasks yet</p>
              </Card>
            ) : (
              tasks.map((task) => (
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
            <Card className="text-center py-8">
              <div className="text-8xl mb-4">🐱</div>
              <h2 className="text-xl font-semibold text-text-primary">Your Pet</h2>
              <p className="text-text-muted mt-2">Feed and play with your pet!</p>
            </Card>
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
    </div>
  );
}
