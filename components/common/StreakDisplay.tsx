"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

interface StreakDisplayProps {
  streakDays: number;
  lastActiveDate: string;
  level: number;
  xp: number;
}

export function StreakDisplay({ streakDays, lastActiveDate, level, xp }: StreakDisplayProps) {
  const [isTodayActive, setIsTodayActive] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setIsTodayActive(lastActiveDate.startsWith(today));
  }, [lastActiveDate]);

  const getStreakBonus = () => {
    if (streakDays >= 30) return { multiplier: 2.0, label: "Legendary" };
    if (streakDays >= 14) return { multiplier: 1.5, label: "Epic" };
    if (streakDays >= 7) return { multiplier: 1.25, label: "Great" };
    if (streakDays >= 3) return { multiplier: 1.1, label: "Good" };
    return { multiplier: 1.0, label: "Normal" };
  };

  const bonus = getStreakBonus();
  const xpToNextLevel = (level + 1) * 100;
  const xpProgress = (xp / xpToNextLevel) * 100;

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const getDayStatus = (dayIndex: number) => {
    const daysAgo = 6 - dayIndex;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - daysAgo);
    const dateStr = checkDate.toISOString().split("T")[0];
    
    if (dateStr === lastActiveDate.split("T")[0]) return "completed";
    if (dateStr < lastActiveDate.split("T")[0] && daysAgo < streakDays) return "active";
    return "pending";
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${streakDays > 0 ? "bg-orange-500/20" : "bg-dark-tertiary"}`}>
            <Flame className={`w-6 h-6 ${streakDays > 0 ? "text-orange-500" : "text-text-muted"}`} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Current Streak</p>
            <p className="text-2xl font-bold text-text-primary">{streakDays} days</p>
          </div>
        </div>
        <Badge
          variant={streakDays >= 7 ? "warning" : "default"}
          className={streakDays >= 7 ? "bg-orange-500/20 text-orange-400" : ""}
        >
          {bonus.label} Streak
        </Badge>
      </div>

      {/* Weekly calendar */}
      <div className="mb-4">
        <p className="text-xs text-text-muted mb-2">Last 7 days</p>
        <div className="flex justify-between">
          {weekDays.map((day, index) => {
            const status = getDayStatus(index);
            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === "completed"
                      ? "bg-orange-500 text-white"
                      : status === "active"
                      ? "bg-orange-500/30 text-orange-400 border-2 border-orange-500"
                      : "bg-dark-tertiary text-text-muted"
                  }`}
                >
                  {status === "completed" && "✓"}
                  {status === "active" && "🔥"}
                </motion.div>
                <span className="text-xs text-text-muted mt-1">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Progress with streak bonus */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Level Progress</span>
          <span className="text-text-primary">{xp} / {xpToNextLevel} XP</span>
        </div>
        <ProgressBar value={xpProgress} color="warning" showLabel />
        <p className="text-xs text-text-muted mt-1">
          {bonus.multiplier > 1 && `🔥 ${bonus.multiplier}x XP bonus active!`}
        </p>
      </div>

      {/* Achievements unlocked */}
      <div className="flex items-center gap-4 pt-4 border-t border-dark-tertiary">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent-gold" />
          <span className="text-sm text-text-secondary">
            {streakDays >= 7 ? "7 Day Streak" : "Keep going!"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-accent-primary" />
          <span className="text-sm text-text-secondary">
            Level {level}
          </span>
        </div>
      </div>

      {/* Daily bonus info */}
      {isTodayActive ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/30"
        >
          <p className="text-sm text-green-400">✓ Daily bonus claimed!</p>
          <p className="text-xs text-text-muted mt-1">Come back tomorrow for more rewards</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-accent-primary/10 rounded-xl border border-accent-primary/30"
        >
          <p className="text-sm text-accent-primary">Complete a task today to keep your streak!</p>
        </motion.div>
      )}
    </Card>
  );
}
