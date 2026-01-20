"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Square, ChevronUp, ChevronDown } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { useUserStore } from "@/stores/useUserStore";
import { formatTimeProgressive } from "@/lib/formatDuration";
import { Task } from "@/types";

export function TimerBar() {
  const { tasks, startTimer, pauseTimer, resumeTimer, stopTimer } = useTaskStore();
  const { activeTaskId, isRunning } = useTimerStore();
  const { profile } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [isSaving, setIsSaving] = useState(false);
  const sessionStartRef = useRef<string | null>(null);

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  useEffect(() => {
    if (activeTaskId && activeTask?.timer_status === "running" && activeTask.timer_started_at) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = activeTask.timer_started_at;
      }
      const updateTime = () => {
        const elapsed =
          activeTask.total_time_seconds +
          (Date.now() - new Date(activeTask.timer_started_at!).getTime()) / 1000;
        setDisplayTime(formatTimeProgressive(elapsed));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    } else if (activeTask) {
      setDisplayTime(formatTimeProgressive(activeTask.total_time_seconds));
    }
  }, [activeTaskId, activeTask]);

  if (!activeTask) return null;

  const handleToggle = () => {
    if (activeTask.timer_status === "running") {
      pauseTimer(activeTask.id);
    } else if (activeTask.timer_status === "paused") {
      resumeTimer(activeTask.id);
    }
  };

  const handleStop = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const startTime = sessionStartRef.current;
      const endTime = new Date().toISOString();

      if (startTime) {
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const durationSeconds = Math.round((end - start) / 1000);

        if (durationSeconds >= 10) {
          const durationMinutes = Math.round(durationSeconds / 60);
          const xpEarned = durationMinutes;
          const coinsEarned = Math.round(durationMinutes * 0.5);

          await fetch('/api/timer/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              task_id: activeTask.id,
              user_id: profile?.id || "demo",
              start_time: startTime,
              end_time: endTime,
              duration_seconds: durationSeconds,
              session_type: 'manual',
              xp_earned: xpEarned,
              coins_earned: coinsEarned,
              status: 'completed',
            }),
          });
        }
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      sessionStartRef.current = null;
      stopTimer(activeTask.id);
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-t-lg text-xs flex items-center gap-1"
      >
        <span>📌 {activeTask.title.slice(0, 15)}...</span>
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {/* Timer Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Task Info */}
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-xs text-blue-200 truncate">Working on</p>
            <p className="font-medium text-sm truncate">{activeTask.title}</p>
          </div>

          {/* Timer Display */}
          <div className="font-mono text-xl font-bold tabular-nums">{displayTime}</div>

          {/* Controls */}
          <div className="flex items-center gap-2 ml-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggle}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              {activeTask.timer_status === "running" ? (
                <Pause className="w-5 h-5" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleStop}
              className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-blue-900/95 backdrop-blur text-white px-4 py-4 border-t border-blue-600"
          >
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-blue-300 text-xs">Total Time</p>
                  <p className="font-mono">{formatTimeProgressive(activeTask.total_time_seconds)}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs">Estimated</p>
                  <p className="font-mono">
                    {activeTask.estimated_time_seconds
                      ? formatTimeProgressive(activeTask.estimated_time_seconds)
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs">Progress</p>
                  <p className="font-mono">
                    {activeTask.estimated_time_seconds
                      ? Math.min(100, Math.round((activeTask.total_time_seconds / activeTask.estimated_time_seconds) * 100))
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
