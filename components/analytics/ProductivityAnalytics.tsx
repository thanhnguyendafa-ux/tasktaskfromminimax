"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, Flame, CheckCircle, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UserStats } from "@/types";

interface ProductivityAnalyticsProps {
  stats: UserStats;
  weeklyData: { day: string; tasks: number; hours: number }[];
}

export function ProductivityAnalytics({ stats, weeklyData }: ProductivityAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");

  const maxTasks = Math.max(...weeklyData.map((d) => d.tasks), 1);
  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Productivity</h3>
        </div>
        <div className="flex gap-1">
          {(["week", "month", "year"] as const).map((period) => (
            <motion.button
              key={period}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-xs capitalize ${
                selectedPeriod === period
                  ? "bg-accent-primary text-white"
                  : "bg-dark-tertiary text-text-secondary"
              }`}
            >
              {period}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-text-muted">Tasks</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{stats.total_tasks_completed}</p>
        </div>
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-text-muted">Focus Time</span>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {Math.floor(stats.total_time_seconds / 3600)}h
          </p>
        </div>
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-text-muted">Best Streak</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{stats.best_streak} days</p>
        </div>
        <div className="p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-text-muted">Level</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{stats.level}</p>
        </div>
      </div>

      {/* Weekly Chart - Tasks */}
      <div className="mb-4">
        <h4 className="text-sm text-text-secondary mb-2">Tasks This Week</h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.tasks / maxTasks) * 100}%` }}
                transition={{ delay: index * 0.1 }}
                className="w-full bg-accent-primary rounded-t-lg min-h-[4px]"
              />
              <span className="text-xs text-text-muted mt-1">{day.day}</span>
              <span className="text-xs text-text-secondary">{day.tasks}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart - Hours */}
      <div className="mb-4">
        <h4 className="text-sm text-text-secondary mb-2">Focus Hours</h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.hours / maxHours) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="w-full bg-accent-gold rounded-t-lg min-h-[4px]"
              />
              <span className="text-xs text-text-muted mt-1">{day.day}</span>
              <span className="text-xs text-accent-gold">{day.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div className="p-3 bg-dark-tertiary rounded-xl">
        <h4 className="text-sm text-text-secondary mb-2">Peak Productivity Hours</h4>
        <div className="space-y-2">
          {[
            { hour: "9 AM", tasks: 8, color: "bg-green-500" },
            { hour: "2 PM", tasks: 6, color: "bg-blue-500" },
            { hour: "8 PM", tasks: 5, color: "bg-purple-500" },
          ].map((peak, index) => (
            <div key={peak.hour} className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16">{peak.hour}</span>
              <div className="flex-1 h-2 bg-dark-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(peak.tasks / 10) * 100}%` }}
                  transition={{ delay: index * 0.2 }}
                  className={`h-full ${peak.color} rounded-full`}
                />
              </div>
              <span className="text-xs text-text-secondary">{peak.tasks} tasks</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-4 p-3 bg-accent-primary/10 rounded-xl border border-accent-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Weekly Summary</p>
            <p className="text-xs text-text-muted">
              {weeklyData.reduce((acc, d) => acc + d.tasks, 0)} tasks completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-accent-primary">
              {weeklyData.reduce((acc, d) => acc + d.hours, 0)}h
            </p>
            <p className="text-xs text-text-muted">total focus time</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
