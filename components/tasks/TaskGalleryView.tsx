"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Play, Plus, Grid, List } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskGalleryViewProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskGalleryView({
  tasks,
  onComplete,
  onTally,
  onPomodoro,
  onTimer,
  onClick,
}: TaskGalleryViewProps) {
  const [sizeMode, setSizeMode] = useState<"compact" | "large">("large");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");

  const filteredTasks = tasks.filter(
    (task) => filterPriority === "all" || task.priority === filterPriority
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["all", "high", "medium", "low"] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                filterPriority === priority
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>

        <div className="flex bg-dark-tertiary rounded-lg p-1 ml-auto">
          <button
            onClick={() => setSizeMode("large")}
            className={`p-2 rounded-md transition-colors ${
              sizeMode === "large" ? "bg-dark-secondary text-accent-primary" : "text-text-muted"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSizeMode("compact")}
            className={`p-2 rounded-md transition-colors ${
              sizeMode === "compact" ? "bg-dark-secondary text-accent-primary" : "text-text-muted"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div
        className={
          sizeMode === "large"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
        }
      >
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => onClick(task)}
            className={`${sizeMode === "large" ? "p-4" : "p-3"} bg-dark-secondary rounded-xl cursor-pointer hover:bg-dark-tertiary transition-colors border border-transparent hover:border-accent-primary/30`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
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
              <Badge variant={priorityVariant[task.priority]} className="text-xs">
                {task.priority}
              </Badge>
            </div>

            {/* Title */}
            <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
              {task.title}
            </h3>

            {/* Description Preview */}
            {sizeMode === "large" && task.description && (
              <p className="text-xs text-text-muted line-clamp-2 mb-3">{task.description}</p>
            )}

            {/* Tags */}
            {sizeMode === "large" && task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-opacity-20"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.icon}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTally(task.id);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-accent-primary/20"
              >
                <Plus className="w-3 h-3 text-accent-primary" />
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

            {/* Due Date */}
            {task.due_date && sizeMode === "large" && (
              <div className="mt-3 pt-3 border-t border-dark-tertiary">
                <p className="text-xs text-text-muted">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-text-muted">No tasks found</p>
        </Card>
      )}
    </div>
  );
}
