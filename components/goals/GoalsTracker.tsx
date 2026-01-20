"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Target, Trophy, Calendar, Plus, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Goal } from "@/types";

interface GoalsTrackerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "id" | "user_id" | "created_at" | "current_value">) => void;
  onUpdateProgress: (goalId: string, increment: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function GoalsTracker({ goals, onAddGoal, onUpdateProgress, onDeleteGoal }: GoalsTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("100");
  const [newGoalRewardXP, setNewGoalRewardXP] = useState("100");
  const [newGoalRewardCoins, setNewGoalRewardCoins] = useState("50");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");

  const handleAddGoal = () => {
    if (newGoalTitle.trim() && newGoalTarget) {
      onAddGoal({
        title: newGoalTitle,
        description: newGoalDesc,
        target_value: parseInt(newGoalTarget),
        reward_xp: parseInt(newGoalRewardXP),
        reward_coins: parseInt(newGoalRewardCoins),
        deadline: newGoalDeadline,
        is_completed: false,
      });
      setNewGoalTitle("");
      setNewGoalDesc("");
      setShowAddModal(false);
    }
  };

  const getProgress = (goal: Goal) => {
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  const isOverdue = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const deadlineUTC = Date.UTC(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return deadlineUTC < nowUTC;
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Goals & OKRs</h3>
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
            <p className="text-2xl font-bold text-text-primary">{goals.length}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-xl">
            <p className="text-2xl font-bold text-green-400">
              {goals.filter((g) => g.is_completed).length}
            </p>
            <p className="text-xs text-text-muted">Completed</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-xl">
            <p className="text-2xl font-bold text-yellow-400">
              {goals.filter((g) => !g.is_completed && !isOverdue(g.deadline)).length}
            </p>
            <p className="text-xs text-text-muted">In Progress</p>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-text-muted mx-auto mb-2" />
              <p className="text-text-muted">No goals yet</p>
              <p className="text-text-muted text-xs">Set your first goal!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = getProgress(goal);
              const overdue = isOverdue(goal.deadline) && !goal.is_completed;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    goal.is_completed
                      ? "bg-green-500/10 border-green-500/30"
                      : overdue
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-dark-tertiary border-dark-tertiary"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary">{goal.title}</h4>
                        {goal.is_completed && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-text-muted mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {overdue && <Badge variant="danger">Overdue</Badge>}
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary">
                        {goal.current_value}/{goal.target_value}
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      color={goal.is_completed ? "success" : overdue ? "danger" : "primary"}
                      showLabel={false}
                    />
                  </div>

                  {/* Rewards & Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-accent-gold">💰 {goal.reward_coins}</span>
                      <span className="text-yellow-400">⭐ {goal.reward_xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <span className={`text-xs ${overdue ? "text-red-400" : "text-text-muted"}`}>
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Add Progress */}
                  {!goal.is_completed && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-dark-tertiary">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateProgress(goal.id, 1)}
                        className="flex-1"
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateProgress(goal.id, 5)}
                        className="flex-1"
                      >
                        +5
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateProgress(goal.id, 10)}
                        className="flex-1"
                      >
                        +10
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Add Goal Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Goal" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Goal Title</label>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g., Complete 100 tasks"
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Description (optional)</label>
            <textarea
              value={newGoalDesc}
              onChange={(e) => setNewGoalDesc(e.target.value)}
              placeholder="Add more details..."
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Target Value</label>
              <input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Deadline</label>
              <input
                type="date"
                value={newGoalDeadline}
                onChange={(e) => setNewGoalDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-2">XP Reward</label>
              <input
                type="number"
                value={newGoalRewardXP}
                onChange={(e) => setNewGoalRewardXP(e.target.value)}
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Coins Reward</label>
              <input
                type="number"
                value={newGoalRewardCoins}
                onChange={(e) => setNewGoalRewardCoins(e.target.value)}
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddGoal} className="flex-1">
              Create Goal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
