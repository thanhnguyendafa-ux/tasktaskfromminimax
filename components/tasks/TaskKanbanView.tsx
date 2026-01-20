"use client";

import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Clock, Play, CheckCircle, Bell, BellOff, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";
import { formatDuration } from "@/lib/formatDuration";

interface TaskKanbanViewProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onClick: (task: Task) => void;
}

type KanbanStatus = "pending" | "in_progress" | "completed";

const columns: { id: KanbanStatus; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "text-gray-400" },
  { id: "in_progress", title: "In Progress", color: "text-blue-400" },
  { id: "completed", title: "Completed", color: "text-emerald-400" },
];

export function TaskKanbanView({
  tasks,
  onComplete,
  onTally,
  onPomodoro,
  onTimer,
  onStatusChange,
  onClick,
}: TaskKanbanViewProps) {
  const [reorderItems, setReorderItems] = useState(tasks);

  const getTasksByStatus = (status: KanbanStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: "", color: "text-text-muted", urgent: false, overdue: false, percent: 0 };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: `${Math.abs(daysLeft)}d overdue`, color: "text-red-400", urgent: true, overdue: true, percent: 100 };
    if (daysLeft === 0) return { text: `${Math.ceil(diff / (1000 * 60 * 60))}h left`, color: "text-yellow-400", urgent: true, overdue: false, percent: 90 };
    if (daysLeft === 1) return { text: "1d left", color: "text-yellow-400", urgent: true, overdue: false, percent: 80 };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: "text-orange-400", urgent: false, overdue: false, percent: 60 };
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

  const formatTime = (seconds: number) => formatDuration(seconds, 'short');

  const getColumnTotals = (status: KanbanStatus) => {
    const columnTasks = getTasksByStatus(status);
    return {
      count: columnTasks.length,
      pomodoro: columnTasks.reduce((sum, t) => sum + t.pomodoro_count, 0),
      time: columnTasks.reduce((sum, t) => sum + t.total_time_seconds, 0),
    };
  };

  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const totals = getColumnTotals(column.id);

        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className="p-4 h-full bg-dark-secondary">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-dark-tertiary text-text-muted">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="p-1 rounded hover:bg-dark-tertiary transition-colors">
                  <Plus className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {/* Column Stats */}
              <div className="flex gap-3 mb-4 text-xs text-text-muted">
                <span>🍅 {totals.pomodoro}</span>
                <span>⏱️ {formatTime(totals.time)}</span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {columnTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onClick(task)}
                    className="p-3 bg-dark-tertiary rounded-xl cursor-pointer hover:bg-dark-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium text-sm ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                        {task.title}
                      </h4>
                      <Badge variant={priorityVariant[task.priority]} className="text-xs">
                        {task.priority === "high" ? "H" : task.priority === "medium" ? "M" : "L"}
                      </Badge>
                    </div>

                    {/* Deadline */}
                    {task.due_date && (
                      <div className={`text-xs mb-2 ${getTimeInfo(task.due_date).color}`}>
                        📅 {formatDate(task.due_date)} • {getTimeInfo(task.due_date).text}
                      </div>
                    )}

                    {task.description && (
                      <p className="text-xs text-text-muted line-clamp-2 mb-2">{task.description}</p>
                    )}

                    {/* Countdown Progress Bar */}
                    {task.due_date && (
                      <div className="mb-2">
                        <div className="h-1 bg-dark-primary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getCountdownPercent(task.due_date)}%` }}
                            className={`h-full rounded-full ${getCountdownColor(getCountdownPercent(task.due_date), getTimeInfo(task.due_date).overdue)}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Time Away & Reminder */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="flex items-center gap-1">
                        {(() => {
                          const status = getActivityStatus(task.last_active_at);
                          return (
                            <>
                              {status === "active" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                              {status === "away" && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                              {status === "inactive" && <span className="w-2 h-2 rounded-full bg-gray-500" />}
                              <span className="text-text-muted">{formatTimeAgo(task.last_active_at)}</span>
                            </>
                          );
                        })()}
                      </span>
                      {task.reminder_interval_minutes && task.reminder_interval_minutes > 0 ? (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Bell className="w-3 h-3" />
                          {task.reminder_interval_minutes}m
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-text-muted">
                          <BellOff className="w-3 h-3" />
                          Off
                        </span>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTally(task.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-accent-primary/20"
                      >
                        <span className="text-accent-primary">+</span>
                        <span className="text-text-primary">{task.tally_count}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPomodoro(task.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20"
                      >
                        <Clock className="w-3 h-3 text-yellow-500" />
                        <span className="text-text-primary">{task.pomodoro_count}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTimer(task.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20"
                      >
                        <Play className="w-3 h-3 text-blue-500" />
                        <span className="text-text-primary">{formatTime(task.total_time_seconds)}</span>
                      </motion.button>
                    </div>

                    {/* Quick Actions */}
                    {task.status !== "completed" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-dark-primary">
                        {column.id !== "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(task.id, "completed");
                            }}
                            className="flex-1 py-1.5 px-3 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {column.id === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(task.id, "in_progress");
                            }}
                            className="flex-1 py-1.5 px-3 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="p-4 text-center text-text-muted text-sm border-2 border-dashed border-dark-tertiary rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
