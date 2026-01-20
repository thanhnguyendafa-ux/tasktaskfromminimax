"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskGanttViewProps {
  tasks: Task[];
  onClick: (task: Task) => void;
}

export function TaskGanttView({ tasks, onClick }: TaskGanttViewProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [viewRange, setViewRange] = useState<"week" | "month" | "quarter">("week");

  const daysToShow = viewRange === "week" ? 7 : viewRange === "month" ? 30 : 90;
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getTaskPosition = (task: Task) => {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    const startDateCalc = new Date(dueDate);
    startDateCalc.setDate(startDateCalc.getDate() - Math.floor(Math.random() * 5 + 1)); // Random start 1-5 days before

    const startOffset = Math.floor(
      (startDateCalc.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.floor(Math.random() * 3 + 1); // Random duration 1-3 days

    return { start: startOffset, duration };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-500";
  };

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
          <h2 className="text-xl font-bold text-text-primary">
            {formatDate(startDate)} - {formatDate(dates[dates.length - 1])}
          </h2>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const newStart = new Date(startDate);
                newStart.setDate(newStart.getDate() - daysToShow);
                setStartDate(newStart);
              }}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setStartDate(new Date())}
              className="px-3 py-2 rounded-lg bg-dark-tertiary text-sm text-text-primary hover:bg-dark-secondary transition-colors"
            >
              Today
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const newStart = new Date(startDate);
                newStart.setDate(newStart.getDate() + daysToShow);
                setStartDate(newStart);
              }}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </motion.button>
          </div>
        </div>

        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["week", "month", "quarter"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setViewRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                viewRange === range
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="grid grid-cols-[200px_1fr] gap-2 mb-2">
            <div className="text-sm font-medium text-text-muted">Task</div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}>
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`text-center text-xs py-1 ${
                    isToday(date) ? "text-accent-primary font-medium" : "text-text-muted"
                  }`}
                >
                  {formatDate(date).split(" ")[0]}
                  <br />
                  {date.getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-2">
            {tasks.map((task, index) => {
              // Simulate task position for demo
              const position = getTaskPosition(task);
              const progress = Math.floor(Math.random() * 100);
              const left = position ? Math.max(0, position.start) * (100 / daysToShow) : 0;
              const width = position ? Math.min(position.duration, daysToShow - left) * (100 / daysToShow) : 10;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-[200px_1fr] gap-2 items-center"
                >
                  {/* Task Name */}
                  <div
                    onClick={() => onClick(task)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-dark-tertiary p-2 rounded-lg"
                  >
                    <Badge variant={priorityVariant[task.priority]} className="text-xs">
                      {task.priority[0].toUpperCase()}
                    </Badge>
                    <span className={`text-sm truncate ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.title}
                    </span>
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative h-8 bg-dark-tertiary rounded-lg overflow-hidden">
                    {/* Grid lines */}
                    <div
                      className="absolute inset-0 flex"
                      style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}
                    >
                      {dates.map((_, i) => (
                        <div key={i} className="border-r border-dark-primary h-full" />
                      ))}
                    </div>

                    {/* Today line */}
                    {dates.findIndex(isToday) >= 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-accent-primary z-10"
                        style={{ left: `${dates.findIndex(isToday) * (100 / daysToShow)}%` }}
                      />
                    )}

                    {/* Task bar */}
                    {position && left + width > 0 && left < 100 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(width, 100 - left)}%` }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className={`absolute top-1 h-6 rounded-md cursor-pointer ${getProgressColor(progress)}`}
                        style={{ left: `${left}%` }}
                        onClick={() => onClick(task)}
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs text-white font-medium truncate px-2">
                            {progress}%
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>80-100%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>50-79%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>25-49%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-500" />
          <span>0-24%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-accent-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
