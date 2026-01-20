"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Play, Calendar, Bell, BellOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";
import { formatTimeProgressive } from "@/lib/formatDuration";

interface TaskTimelineViewProps {
  tasks: Task[];
  onClick: (task: Task) => void;
}

export function TaskTimelineView({ tasks, onClick }: TaskTimelineViewProps) {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  // Simulate timeline data for demo
  const getTaskTimeBlock = (task: Task, index: number) => {
    const startHour = 9 + (index % 6);
    const duration = 1 + (index % 3);
    return {
      start: startHour,
      duration,
      top: (startHour - 9) * 60,
      height: duration * 60,
    };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: "", color: "text-text-muted", urgent: false, overdue: false };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: `${Math.abs(daysLeft)}d overdue`, color: "text-red-400", urgent: true, overdue: true };
    if (daysLeft === 0) return { text: "Today", color: "text-yellow-400", urgent: true, overdue: false };
    if (daysLeft === 1) return { text: "1d left", color: "text-yellow-400", urgent: true, overdue: false };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: "text-orange-400", urgent: false, overdue: false };
    return { text: `${daysLeft}d left`, color: "text-text-muted", urgent: false, overdue: false };
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "-";
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const formatTime = formatTimeProgressive;

  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-primary">Timeline</h2>
          <div className="text-sm text-text-muted">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                viewMode === mode
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card className="p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time Grid */}
          <div className="grid grid-cols-[80px_1fr] gap-2">
            {/* Time Labels */}
            <div className="space-y-4">
              {hours.map((hour) => (
                <div key={hour} className="h-16 text-xs text-text-muted text-right pr-2">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Time Blocks */}
            <div className="relative border-l border-dark-tertiary">
              {/* Hour Grid */}
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-dark-tertiary" />
              ))}

              {/* Task Blocks */}
              {tasks.slice(0, 5).map((task, index) => {
                const timeBlock = getTaskTimeBlock(task, index);
                const progress = Math.floor(Math.random() * 100);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onClick(task)}
                    className="absolute left-2 right-2 rounded-lg cursor-pointer overflow-hidden"
                    style={{
                      top: `${timeBlock.top}px`,
                      height: `${timeBlock.height - 4}px`,
                    }}
                  >
                    <div
                      className={`h-full rounded-lg p-2 border-l-4 ${
                        task.priority === "high"
                          ? "bg-red-500/20 border-red-500"
                          : task.priority === "medium"
                          ? "bg-yellow-500/20 border-yellow-500"
                          : "bg-green-500/20 border-green-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-primary truncate">
                          {task.title}
                        </span>
                        <Badge variant={priorityVariant[task.priority]} className="text-[10px] px-1">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{timeBlock.duration}h</span>
                        <Play className="w-3 h-3" />
                        <span>{formatTime(task.total_time_seconds)}</span>
                        {task.due_date && (
                          <span className={getTimeInfo(task.due_date).color}>
                            • {getTimeInfo(task.due_date).text}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                        <span>{formatTimeAgo(task.last_active_at)}</span>
                        {task.reminder_interval_minutes && task.reminder_interval_minutes > 0 ? (
                          <Bell className="w-3 h-3 text-yellow-400" />
                        ) : (
                          <BellOff className="w-3 h-3 text-text-muted" />
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1 h-1 bg-dark-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="p-4">
        <h3 className="font-semibold text-text-primary mb-3">Upcoming</h3>
        <div className="space-y-2">
          {tasks
            .filter((task) => task.status !== "completed")
            .slice(0, 5)
            .map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onClick(task)}
                className="flex items-center gap-3 p-3 rounded-lg bg-dark-tertiary cursor-pointer hover:bg-dark-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{task.title}</p>
                  <p className="text-xs text-text-muted">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </p>
                </div>
                <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
              </motion.div>
            ))}
        </div>
      </Card>
    </div>
  );
}
