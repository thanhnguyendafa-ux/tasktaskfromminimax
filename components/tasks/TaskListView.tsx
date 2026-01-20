"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Play, Plus, Bell, BellOff, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";
import { formatTimeProgressive } from "@/lib/formatDuration";

interface TaskListViewProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onClick: (task: Task) => void;
}

type SortField = "title" | "due_date" | "priority" | "tally_count" | "pomodoro_count" | "total_time_seconds";
type SortDirection = "asc" | "desc";

export function TaskListView({
  tasks,
  onComplete,
  onTally,
  onPomodoro,
  onTimer,
  onClick,
}: TaskListViewProps) {
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: "No due date", color: "text-text-muted", urgent: false, overdue: false, percent: 0 };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.ceil(diff / (1000 * 60 * 60));
    
    if (daysLeft < 0) {
      return { text: `${Math.abs(daysLeft)}d overdue`, color: "text-red-400", urgent: true, overdue: true, percent: 100 };
    }
    if (daysLeft === 0) {
      return { text: `${hoursLeft}h left`, color: "text-yellow-400", urgent: true, overdue: false, percent: 90 };
    }
    if (daysLeft === 1) {
      return { text: "1d left", color: "text-yellow-400", urgent: true, overdue: false, percent: 80 };
    }
    if (daysLeft <= 3) {
      return { text: `${daysLeft}d left`, color: "text-orange-400", urgent: false, overdue: false, percent: 60 };
    }
    return { text: `${daysLeft}d left`, color: "text-text-muted", urgent: false, overdue: false, percent: 40 };
  };

  const getCountdownPercent = (dueDate: string | null) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const totalDays = 7;
    return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
  };

  const getCountdownColor = (percent: number, overdue: boolean) => {
    if (overdue) return "bg-red-500";
    if (percent >= 80) return "bg-yellow-500";
    if (percent >= 60) return "bg-orange-500";
    return "bg-emerald-500";
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "-";
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const getActivityStatus = (timestamp: string | null) => {
    if (!timestamp) return "inactive";
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return "active";
    if (hours < 24) return "away";
    return "inactive";
  };

  const formatTime = formatTimeProgressive;

  const filteredTasks = tasks
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "due_date":
          comparison = new Date(a.due_date || "9999").getTime() - new Date(b.due_date || "9999").getTime();
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "tally_count":
          comparison = a.tally_count - b.tally_count;
          break;
        case "pomodoro_count":
          comparison = a.pomodoro_count - b.pomodoro_count;
          break;
        case "total_time_seconds":
          comparison = a.total_time_seconds - b.total_time_seconds;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  return (
    <div className="space-y-4">
      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["all", "pending", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                filterStatus === status
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex bg-dark-tertiary rounded-lg p-1 ml-auto">
          {(["title", "due_date", "priority", "tally_count", "pomodoro_count"] as const).map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                sortField === field
                  ? "bg-dark-secondary text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {field.replace("_", " ")}
              {sortField === field && (
                <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden grid-cols-[40px_1.5fr_100px_80px_80px_70px_70px] gap-2 px-4 py-2 bg-dark-tertiary rounded-t-xl text-xs text-text-muted font-medium">
        <div>#</div>
        <div>Task</div>
        <div>Due</div>
        <div>Countdown</div>
        <div>Time Away</div>
        <div>Tally</div>
        <div>Pomodoro</div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="grid grid-cols-[40px_1.5fr_100px_80px_80px_70px_70px] gap-2 items-center px-4 py-3 bg-dark-secondary rounded-xl hover:bg-dark-tertiary transition-colors cursor-pointer"
            onClick={() => onClick(task)}
          >
            <div className="text-xs text-text-muted">{index + 1}</div>
            
            <div className="flex items-center gap-3 min-w-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(task.id);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.status === "completed"
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-text-muted hover:border-accent-primary"
                }`}
              >
                {task.status === "completed" && <CheckCircle className="w-4 h-4 text-white" />}
              </motion.button>
              <div className="min-w-0">
                <h3 className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                  {task.title}
                </h3>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-opacity-20"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="text-xs">
              <div className={`font-medium ${getTimeInfo(task.due_date).color}`}>
                {formatDate(task.due_date)}
              </div>
              <div className={`text-[10px] ${getTimeInfo(task.due_date).color}`}>
                {getTimeInfo(task.due_date).text}
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="space-y-1">
              <div className="h-1.5 bg-dark-primary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCountdownPercent(task.due_date)}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
                  className={`h-full rounded-full ${getCountdownColor(getCountdownPercent(task.due_date), getTimeInfo(task.due_date).overdue)}`}
                />
              </div>
              <span className="text-[10px] text-text-muted">
                {Math.round(getCountdownPercent(task.due_date))}%
              </span>
            </div>

            {/* Time Away */}
            <div className="text-xs">
              <div className="flex items-center gap-1">
                {(() => {
                  const status = getActivityStatus(task.last_active_at);
                  return (
                    <>
                      {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {status === "away" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                      {status === "inactive" && <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />}
                      <span className="text-text-primary">{formatTimeAgo(task.last_active_at)}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTally(task.id);
                }}
                className="w-6 h-6 rounded bg-accent-primary/20 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 text-accent-primary" />
              </motion.button>
              <span className="text-xs text-text-primary font-medium">{task.tally_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPomodoro(task.id);
                }}
                className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center"
              >
                <Clock className="w-3 h-3 text-yellow-500" />
              </motion.button>
              <span className="text-xs text-text-primary font-medium">{task.pomodoro_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTimer(task.id);
                }}
                className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center"
              >
                <Play className="w-3 h-3 text-blue-500" />
              </motion.button>
              <span className="text-xs text-text-primary font-medium">{formatTime(task.total_time_seconds)}</span>
            </div>

            {/* Tally */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTally(task.id);
                }}
                className="w-5 h-5 rounded bg-accent-primary/20 flex items-center justify-center"
              >
                <Plus className="w-2.5 h-2.5 text-accent-primary" />
              </motion.button>
              <span className="text-xs text-text-primary font-medium">{task.tally_count}</span>
            </div>

            {/* Pomodoro */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPomodoro(task.id);
                }}
                className="w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center"
              >
                <Clock className="w-2.5 h-2.5 text-yellow-500" />
              </motion.button>
              <span className="text-xs text-text-primary font-medium">{task.pomodoro_count}</span>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-text-muted">No tasks found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
