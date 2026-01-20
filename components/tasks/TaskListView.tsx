"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Play, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

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

  const formatTimeLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff < 0) return "Overdue";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

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
      <div className="hidden grid-cols-[40px_1fr_100px_80px_80px_80px_80px] gap-2 px-4 py-2 bg-dark-tertiary rounded-t-xl text-xs text-text-muted font-medium">
        <div>#</div>
        <div>Task</div>
        <div>Due</div>
        <div>Tally</div>
        <div>Pomodoro</div>
        <div>Timer</div>
        <div>Priority</div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="grid grid-cols-[40px_1fr_100px_80px_80px_80px_80px] gap-2 items-center px-4 py-3 bg-dark-secondary rounded-xl hover:bg-dark-tertiary transition-colors cursor-pointer"
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

            <div className="text-xs text-text-muted">
              {task.due_date ? formatTimeLeft(task.due_date) : "-"}
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

            <Badge variant={priorityVariant[task.priority]} className="justify-center">
              {task.priority === "high" ? "H" : task.priority === "medium" ? "M" : "L"}
            </Badge>
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
