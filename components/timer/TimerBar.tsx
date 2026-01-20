"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Square, ChevronUp, ChevronDown } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Task } from "@/types";

export function TimerBar() {
  const { tasks, startTimer, pauseTimer, stopTimer } = useTaskStore();
  const { activeTaskId, isRunning, elapsedSeconds } = useTimerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayTime, setDisplayTime] = useState("00:00:00");

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (activeTaskId && activeTask?.timer_status === "running" && activeTask.timer_started_at) {
      const updateTime = () => {
        const elapsed =
          activeTask.total_time_seconds +
          (Date.now() - new Date(activeTask.timer_started_at!).getTime()) / 1000;
        setDisplayTime(formatTime(elapsed));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    } else if (activeTask) {
      setDisplayTime(formatTime(activeTask.total_time_seconds));
    }
  }, [activeTaskId, activeTask]);

  if (!activeTask) return null;

  const handleToggle = () => {
    if (activeTask.timer_status === "running") {
      pauseTimer(activeTask.id);
    } else if (activeTask.timer_status === "paused") {
      startTimer(activeTask.id);
    }
  };

  const handleStop = () => {
    stopTimer(activeTask.id);
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
                  <p className="font-mono">{formatTime(activeTask.total_time_seconds)}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs">Estimated</p>
                  <p className="font-mono">
                    {activeTask.estimated_time_seconds
                      ? formatTime(activeTask.estimated_time_seconds)
                      : "--:--:--"}
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
