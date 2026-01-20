"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Clock, Plus, Minus, Play, Pause, CheckCircle, MoreVertical, Calendar, Tag } from "lucide-react";
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
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  swipeEnabled?: boolean;
}

export function TaskCard({
  task,
  onComplete,
  onTally,
  onPomodoro,
  onTimer,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  swipeEnabled = true,
}: TaskCardProps) {
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [timeSinceTally, setTimeSinceTally] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { activeTaskId, isRunning } = useTimerStore();
  const cardRef = useRef<HTMLDivElement>(null);

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

  const getDueDateStatus = (dueDate: string) => {
    const date = new Date(dueDate);
    const diff = date.getTime() - Date.now();
    if (diff < 0) return "overdue";
    if (diff < 24 * 60 * 60 * 1000) return "soon";
    return "normal";
  };

  const dueDateStatus = task.due_date ? getDueDateStatus(task.due_date) : null;

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!swipeEnabled) return;

    const threshold = 100;
    if (info.offset.x < -threshold) {
      onDelete?.(task.id);
      setIsRemoved(true);
    } else if (info.offset.x > threshold) {
      onComplete(task.id);
    }
  };

  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <AnimatePresence>
      {!isRemoved && (
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
          drag={swipeEnabled ? "x" : false}
          dragConstraints={{ left: -200, right: 100 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative"
        >
          {/* Swipe action hints */}
          {swipeEnabled && (
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="flex-1 bg-green-500/20 flex items-center justify-start pl-4 rounded-l-xl">
                <span className="text-green-400 text-sm font-medium">Swipe → Complete</span>
              </div>
              <div className="w-24 bg-red-500/20 flex items-center justify-end pr-4 rounded-r-xl">
                <span className="text-red-400 text-sm font-medium">Delete ←</span>
              </div>
            </div>
          )}

          <Card
            hover
            className={`
              mb-3 cursor-pointer touch-manipulation
              ${swipeEnabled ? "relative z-10" : ""}
            `}
            onClick={onClick}
          >
            <div className="p-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                {/* Checkbox - large touch target */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                  }}
                  className={`
                    w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all p-2
                    ${task.status === "completed"
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-text-muted hover:border-accent-primary active:border-accent-primary"
                    }
                  `}
                >
                  {task.status === "completed" && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-medium text-base leading-snug
                    ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}
                  `}>
                    {task.title}
                  </h3>

                  {/* Due date */}
                  {task.due_date && (
                    <div className={`
                      flex items-center gap-1.5 mt-1.5 text-xs
                      ${dueDateStatus === "overdue" ? "text-red-400" : dueDateStatus === "soon" ? "text-yellow-400" : "text-text-muted"}
                    `}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatTimeLeft(task.due_date)}</span>
                    </div>
                  )}
                </div>

                {/* Priority badge */}
                <Badge variant={priorityVariant[task.priority]} className="flex-shrink-0">
                  {task.priority === "high" ? "H" : task.priority === "medium" ? "M" : "L"}
                </Badge>
              </div>

              {/* Meta info row */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {/* Tally counter */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTallyClick}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-tertiary min-w-[60px]
                    ${task.tally_count >= task.tally_goal ? "ring-1 ring-green-500/50" : ""}
                  `}
                >
                  <Plus className="w-4 h-4 text-accent-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    {task.tally_count}/{task.tally_goal}
                  </span>
                </motion.button>

                {/* Pomodoro counter */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onPomodoro(task.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-tertiary min-w-[60px]"
                >
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-text-primary">{task.pomodoro_count}</span>
                </motion.button>

                {/* Timer */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onTimer(task.id); }}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-tertiary min-w-[80px]
                    ${isTimerRunning ? "ring-2 ring-blue-500/50" : ""}
                  `}
                >
                  {isTimerRunning ? (
                    <Pause className="w-4 h-4 text-blue-500 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4 text-blue-500" />
                  )}
                  <span className={`text-sm font-mono ${isTimerRunning ? "text-blue-400" : "text-text-primary"}`}>
                    {timerDisplay}
                  </span>
                </motion.button>

                {/* More menu button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-lg bg-dark-tertiary ml-auto"
                >
                  <MoreVertical className="w-4 h-4 text-text-muted" />
                </motion.button>
              </div>

              {/* Quick menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 mt-3 pt-3 border-t border-dark-tertiary">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(task);
                          setShowMenu(false);
                        }}
                        className="flex-1 py-2 rounded-lg bg-dark-tertiary text-sm text-text-secondary hover:text-text-primary"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive?.(task.id);
                          setShowMenu(false);
                        }}
                        className="flex-1 py-2 rounded-lg bg-dark-tertiary text-sm text-text-secondary hover:text-text-primary"
                      >
                        Archive
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(task.id);
                          setShowMenu(false);
                        }}
                        className="flex-1 py-2 rounded-lg bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tally Progress */}
              <div className="mt-3">
                <ProgressBar
                  value={task.tally_count}
                  max={task.tally_goal}
                  color={task.tally_count >= task.tally_goal ? "success" : "primary"}
                  showLabel={false}
                />
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-opacity-20"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="px-2.5 py-1 text-xs rounded-full bg-dark-tertiary text-text-muted">
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Plus one animation */}
          <AnimatePresence>
            {showPlusOne && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-0 left-10 text-accent-primary font-bold text-lg z-20"
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
