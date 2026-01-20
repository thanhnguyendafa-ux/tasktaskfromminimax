"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTaskStore } from "@/stores/useTaskStore";
import { formatTimeProgressive } from "@/lib/formatDuration";
import { useUserStore } from "@/stores/useUserStore";

interface ManualTimerProps {
  taskId: string;
  onTimerStop: (duration: number) => void;
}

export function ManualTimer({ taskId, onTimerStop }: ManualTimerProps) {
  const { tasks, updateTask } = useTaskStore();
  const { addXp, addCoins } = useUserStore();
  const task = tasks.find((t) => t.id === taskId);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(task?.total_time_seconds || 0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && sessionStart) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionElapsed = Math.floor((now - sessionStart.getTime()) / 1000);
        setElapsed((task?.total_time_seconds || 0) + sessionElapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionStart, task]);

  const formatTime = formatTimeProgressive;

  const startTimer = () => {
    setIsRunning(true);
    setSessionStart(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (sessionStart) {
      const sessionElapsed = Math.floor(
        (Date.now() - sessionStart.getTime()) / 1000
      );
      updateTask(taskId, {
        total_time_seconds: elapsed,
        last_active_at: new Date().toISOString(),
      });
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (sessionStart) {
      const sessionElapsed = Math.floor(
        (Date.now() - sessionStart.getTime()) / 1000
      );
      const totalTime = (task?.total_time_seconds || 0) + sessionElapsed;
      
      updateTask(taskId, {
        total_time_seconds: totalTime,
        last_active_at: new Date().toISOString(),
      });

      // Award XP for time spent (1 XP per 5 minutes)
      const xpEarned = Math.floor(totalTime / 300);
      if (xpEarned > 0) {
        addXp(xpEarned);
        addCoins(Math.floor(xpEarned / 2));
      }

      onTimerStop(totalTime);
    }
    setSessionStart(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(task?.total_time_seconds || 0);
    setSessionStart(null);
  };

  return (
    <Card className="text-center">
      <h3 className="text-lg font-medium text-text-primary mb-4">
        {task?.title || "Timer"}
      </h3>

      {/* Timer Display */}
      <motion.div
        className="text-6xl font-mono font-bold text-text-primary mb-6"
        animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {formatTime(elapsed)}
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-6">
        {!isRunning ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startTimer}
            className="p-4 rounded-full bg-accent-primary text-white"
          >
            <Play className="w-8 h-8" />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={pauseTimer}
            className="p-4 rounded-full bg-yellow-500 text-white"
          >
            <Pause className="w-8 h-8" />
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={stopTimer}
          className="p-4 rounded-full bg-red-500 text-white"
          disabled={!isRunning && elapsed === (task?.total_time_seconds || 0)}
        >
          <Square className="w-8 h-8" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="p-4 rounded-full bg-dark-tertiary text-text-secondary"
        >
          <RotateCcw className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-sm text-text-muted">
        <div>
          <span className="block text-2xl font-bold text-text-primary">
            {Math.floor(elapsed / 60)}
          </span>
          Minutes
        </div>
        <div>
          <span className="block text-2xl font-bold text-text-primary">
            {Math.floor(elapsed / 300)}
          </span>
          XP Earned
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((elapsed / 3600) * 100, 100)}%` }}
            className="h-full bg-accent-primary rounded-full"
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          {Math.floor(elapsed / 3600)} / 1 hour session
        </p>
      </div>
    </Card>
  );
}
