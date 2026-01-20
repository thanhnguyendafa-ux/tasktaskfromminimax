"use client";

import React from "react";
import { motion } from "framer-motion";
import { Grid } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Task } from "@/types";

interface GalleryViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function GalleryView({ tasks, onTaskClick }: GalleryViewProps) {
  const priorityColors = {
    high: "from-red-500/20 to-red-600/10 border-red-500/30",
    medium: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
    low: "from-green-500/20 to-green-600/10 border-green-500/30",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {tasks.length} tasks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`p-4 border bg-gradient-to-br ${priorityColors[task.priority]} cursor-pointer`}
              onClick={() => onTaskClick(task)}
              hover
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    task.status === "completed"
                      ? "bg-emerald-500"
                      : task.status === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-text-muted"
                  }`}
                />
                <span className="text-xs text-text-muted">
                  {task.tally_count} tally
                </span>
              </div>

              <h3
                className={`font-medium text-text-primary mb-2 line-clamp-2 ${
                  task.status === "completed" ? "line-through opacity-60" : ""
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-sm text-text-muted line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                {task.due_date && (
                  <span className="text-xs text-text-muted">
                    📅 {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 2).map((tag) => (
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

              {task.pomodoro_count > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-tertiary">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>🍅</span>
                    <span>{task.pomodoro_count} pomodoros</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-muted">No tasks to display</p>
        </Card>
      )}
    </div>
  );
}
