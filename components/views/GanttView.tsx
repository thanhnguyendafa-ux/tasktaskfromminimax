"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Task } from "@/types";

interface GanttViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function GanttView({ tasks, onTaskClick }: GanttViewProps) {
  const [startDate] = useState(new Date());
  
  // Calculate task positions based on due date
  const getTaskPosition = (dueDate: string | null, createdAt: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const created = new Date(createdAt);
    const daysDiff = Math.ceil((due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = 0;
    const duration = Math.max(1, Math.min(daysDiff, 30));
    return { startOffset, duration };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500";
      case "in_progress": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {tasks.length} tasks
          </span>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-dark-tertiary">
            <div className="w-1/3 px-4 py-3 text-sm font-medium text-text-muted">
              Task
            </div>
            <div className="w-2/3 flex">
              {Array.from({ length: 14 }).map((_, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                return (
                  <div
                    key={i}
                    className="flex-1 px-2 py-3 text-center text-xs text-text-muted border-l border-dark-tertiary"
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          {tasks.map((task, index) => {
            const position = getTaskPosition(task.due_date, task.created_at || "");
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex border-b border-dark-tertiary/30 hover:bg-dark-tertiary/20 cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                <div className="w-1/3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}
                    />
                    <span
                      className={`text-sm text-text-primary truncate ${
                        task.status === "completed" ? "line-through opacity-60" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(
                        task.priority
                      )} bg-opacity-20 text-white`}
                    >
                      {task.priority}
                    </span>
                    {task.tags && task.tags.length > 0 && (
                      <span className="text-lg">{task.tags[0]?.icon}</span>
                    )}
                  </div>
                </div>
                <div className="w-2/3 relative flex items-center">
                  {/* Grid lines */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-l border-dark-tertiary/30 h-full"
                    />
                  ))}

                  {/* Task bar */}
                  {position && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(position.duration / 14) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={`absolute h-6 rounded-full ${getPriorityColor(
                        task.priority
                      )} opacity-80`}
                      style={{
                        left: `${(position.startOffset / 14) * 100}%`,
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-white font-medium truncate px-2">
                          {task.title.slice(0, 15)}...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Completed overlay */}
                  {task.status === "completed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/30">
                      <span className="text-emerald-400 text-sm font-medium">✓ Done</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {tasks.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-muted">No tasks to display</p>
        </Card>
      )}
    </div>
  );
}
