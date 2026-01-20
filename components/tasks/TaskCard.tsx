"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Minus, Play, Pause, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Task } from "@/types";
import { useTimerStore } from "@/stores/useTimerStore";
import { formatTimeProgressive } from "@/lib/formatDuration";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, onComplete, onTally, onPomodoro, onTimer, onClick }: TaskCardProps) {
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [timeSinceTally, setTimeSinceTally] = useState("");
  const { activeTaskId, isRunning } = useTimerStore();
  
  const isTimerRunning = activeTaskId === task.id && isRunning;
  
  const timerDisplay = task.timer_status === 'running' && task.timer_started_at
    ? formatTimeProgressive(task.total_time_seconds + (Date.now() - new Date(task.timer_started_at).getTime()) / 1000)
    : formatTimeProgressive(task.total_time_seconds);
  
  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  const formatTimeSince = (timestamp: string | null) => {
    if (!timestamp) return "No tally yet";
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  useEffect(() => {
    setTimeSinceTally(formatTimeSince(task.last_tally_at));
    const interval = setInterval(() => {
      setTimeSinceTally(formatTimeSince(task.last_tally_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [task.last_tally_at]);

  const handleTallyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTally(task.id);
    setShowPlusOne(true);
    setTimeout(() => setShowPlusOne(false), 1000);
  };

  const formatTimeLeft = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return "Invalid date";
    const diff = date.getTime() - Date.now();
    if (diff < 0) return "Overdue";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card hover className="mb-3" onClick={onClick}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.status === "completed"
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-text-muted hover:border-accent-primary"
              }`}
            >
              {task.status === "completed" && <CheckCircle className="w-4 h-4 text-white" />}
            </motion.button>
            <div>
              <h3 className={`font-medium ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                {task.title}
              </h3>
              {task.due_date && (
                <p className="text-xs text-text-muted mt-1">{formatTimeLeft(task.due_date)}</p>
              )}
            </div>
          </div>
          <Badge variant={priorityVariant[task.priority]}>
            {task.priority === "high" ? "H" : task.priority === "medium" ? "M" : "L"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleTallyClick}
              className="flex items-center gap-1.5 px-2 py-1 bg-dark-tertiary rounded-lg hover:bg-opacity-80"
            >
              <Plus className="w-4 h-4 text-accent-primary" />
              <span className="text-text-primary">{task.tally_count}</span>
            </motion.button>
            <AnimatePresence>
              {showPlusOne && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="absolute -top-8 left-0 text-accent-primary font-bold text-sm"
                >
                  +1
                </motion.div>
              )}
            </AnimatePresence>
            {timeSinceTally && (
              <span className="absolute -bottom-3 left-0 text-[10px] text-text-muted whitespace-nowrap">
                {timeSinceTally}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPomodoro(task.id); }}
            className="flex items-center gap-1.5 px-2 py-1 bg-dark-tertiary rounded-lg hover:bg-opacity-80"
          >
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-text-primary">{task.pomodoro_count}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onTimer(task.id); }}
            className={`flex items-center gap-1.5 px-2 py-1 bg-dark-tertiary rounded-lg hover:bg-opacity-80 ${
              isTimerRunning ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {isTimerRunning ? (
              <Pause className="w-4 h-4 text-blue-500 animate-pulse" />
            ) : (
              <Play className="w-4 h-4 text-blue-500" />
            )}
            <span className={`text-text-primary font-mono ${isTimerRunning ? 'text-blue-400' : ''}`}>
              {timerDisplay}
            </span>
          </motion.button>
        </div>

        {/* Tally Progress */}
        <div className="mt-2">
          <ProgressBar 
            value={task.tally_count} 
            max={task.tally_goal} 
            color={task.tally_count >= task.tally_goal ? "success" : "primary"}
            showLabel={false}
          />
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded-full bg-opacity-20"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.icon} {tag.name}
              </span>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
