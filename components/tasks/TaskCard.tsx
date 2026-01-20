"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Minus, Play, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, onComplete, onTally, onPomodoro, onTimer, onClick }: TaskCardProps) {
  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  const formatTimeLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now();
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

        <div className="flex items-center gap-4 text-sm">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onTally(task.id); }}
            className="flex items-center gap-1.5 px-2 py-1 bg-dark-tertiary rounded-lg hover:bg-opacity-80"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span className="text-text-primary">{task.tally_count}</span>
          </motion.button>

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
            className="flex items-center gap-1.5 px-2 py-1 bg-dark-tertiary rounded-lg hover:bg-opacity-80"
          >
            <Play className="w-4 h-4 text-blue-500" />
            <span className="text-text-primary">
              {Math.floor(task.total_time_seconds / 60)}m
            </span>
          </motion.button>
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
