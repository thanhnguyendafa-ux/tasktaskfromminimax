"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Task } from "@/types";

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
  // Sort by due date or created date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.due_date || a.created_at || "";
    const dateB = b.due_date || b.created_at || "";
    return dateA.localeCompare(dateB);
  });

  const getTaskProgress = (task: Task) => {
    if (task.status === "completed") return 100;
    if (task.status === "in_progress") return 50;
    return 0;
  };

  const getTimeInfo = (task: Task) => {
    if (task.due_date) {
      const due = new Date(task.due_date);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return { text: "Overdue", urgent: true };
      if (days === 0) return { text: "Due today", urgent: true };
      if (days === 1) return { text: "Due tomorrow", urgent: false };
      return { text: `${days} days left`, urgent: false };
    }
    return { text: "No due date", urgent: false };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {tasks.length} tasks
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-tertiary" />

        {/* Task items */}
        <div className="space-y-4">
          {sortedTasks.map((task, index) => {
            const timeInfo = getTimeInfo(task);
            const progress = getTaskProgress(task);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4"
              >
                {/* Timeline dot */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    task.status === "completed"
                      ? "bg-emerald-500/20 border-2 border-emerald-500"
                      : task.status === "in_progress"
                      ? "bg-blue-500/20 border-2 border-blue-500"
                      : timeInfo.urgent
                      ? "bg-red-500/20 border-2 border-red-500"
                      : "bg-dark-tertiary border-2 border-dark-tertiary"
                  }`}
                >
                  {task.status === "completed" ? (
                    <span className="text-emerald-500">✓</span>
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {task.priority === "high" ? "!" : task.priority === "medium" ? "→" : "○"}
                    </span>
                  )}
                </div>

                {/* Task card */}
                <Card
                  className="flex-1 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                  hover
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3
                        className={`font-medium text-text-primary ${
                          task.status === "completed" ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-text-muted line-clamp-1 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        timeInfo.urgent
                          ? "bg-red-500/20 text-red-400"
                          : "bg-dark-tertiary text-text-muted"
                      }`}
                    >
                      {timeInfo.text}
                    </span>
                  </div>

                  {/* Progress */}
                  <ProgressBar
                    value={progress}
                    color={
                      task.status === "completed"
                        ? "success"
                        : task.status === "in_progress"
                        ? "warning"
                        : "primary"
                    }
                    showLabel
                  />

                  {/* Meta info */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-tertiary">
                    <div className="flex items-center gap-3">
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="text-lg"
                              title={tag.name}
                            >
                              {tag.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>📊 {task.tally_count}</span>
                      <span>🍅 {task.pomodoro_count}</span>
                      <span>
                        ⏱️ {Math.floor(task.total_time_seconds / 60)}m
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {tasks.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-muted">No tasks to display</p>
        </Card>
      )}
    </div>
  );
}
