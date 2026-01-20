"use client";

import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Clock, Play, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

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

                    {task.description && (
                      <p className="text-xs text-text-muted line-clamp-2 mb-2">{task.description}</p>
                    )}

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
