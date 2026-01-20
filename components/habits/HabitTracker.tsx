"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Calendar, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Habit } from "@/types";

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, "id" | "user_id" | "created_at" | "streak" | "best_streak">) => void;
  onCompleteHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitTracker({ habits, onAddHabit, onCompleteHabit, onDeleteHabit }: HabitTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("📌");
  const [newHabitColor, setNewHabitColor] = useState("#6366f1");

  const icons = ["📌", "💪", "📚", "🏃", "💧", "🧘", "🎯", "💤", "🍎", "✍️", "🎨", "🎵"];
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit({
        name: newHabitName,
        icon: newHabitIcon,
        color: newHabitColor,
        frequency: "daily",
        target_count: 1,
        current_count: 0,
        is_active: true,
      });
      setNewHabitName("");
      setShowAddModal(false);
    }
  };

  const getProgress = (habit: Habit) => {
    return Math.min(100, (habit.current_count / habit.target_count) * 100);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-secondary" />
            <h3 className="text-lg font-semibold text-text-primary">Daily Habits</h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-accent-primary rounded-lg text-white"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-dark-tertiary rounded-xl">
            <p className="text-2xl font-bold text-text-primary">{habits.length}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-xl">
            <p className="text-2xl font-bold text-green-400">
              {habits.filter((h) => h.current_count >= h.target_count).length}
            </p>
            <p className="text-xs text-text-muted">Completed</p>
          </div>
          <div className="text-center p-3 bg-orange-500/10 rounded-xl">
            <p className="text-2xl font-bold text-orange-400">
              {habits.filter((h) => h.current_count < h.target_count && h.current_count > 0).length}
            </p>
            <p className="text-xs text-text-muted">In Progress</p>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-2">
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <Flame className="w-12 h-12 text-text-muted mx-auto mb-2" />
              <p className="text-text-muted">No habits yet</p>
              <p className="text-text-muted text-xs">Create your first habit!</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = habit.current_count >= habit.target_count;
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border ${
                    isCompleted
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-dark-tertiary border-dark-tertiary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-text-primary">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-400">🔥 {habit.streak}</span>
                          <button
                            onClick={() => onDeleteHabit(habit.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <ProgressBar
                        value={getProgress(habit)}
                        color={isCompleted ? "success" : "primary"}
                        showLabel={false}
                      />
                      <div className="flex justify-between text-xs text-text-muted mt-1">
                        <span>
                          {habit.current_count}/{habit.target_count}
                        </span>
                        <span>{Math.round(getProgress(habit))}%</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onCompleteHabit(habit.id)}
                      disabled={isCompleted}
                      className={`p-2 rounded-full ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-dark-secondary hover:bg-accent-primary text-white"
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Add Habit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Habit">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Habit Name</label>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g., Morning jog"
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon) => (
                <motion.button
                  key={icon}
                  whileTap={{ scale: 1.1 }}
                  onClick={() => setNewHabitIcon(icon)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    newHabitIcon === icon
                      ? "bg-accent-primary text-white"
                      : "bg-dark-tertiary"
                  }`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  whileTap={{ scale: 1.1 }}
                  onClick={() => setNewHabitColor(color)}
                  className={`w-8 h-8 rounded-full ${
                    newHabitColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-dark-secondary" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddHabit} className="flex-1">
              Create Habit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
