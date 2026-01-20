"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface TaskCalendarViewProps {
  tasks: Task[];
  onClick: (task: Task) => void;
}

export function TaskCalendarView({ tasks, onClick }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTasksForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return tasks.filter((task) => task.due_date?.startsWith(dateStr));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const formatTimeLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff < 0) return "Overdue";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-primary">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg bg-dark-tertiary text-sm text-text-primary hover:bg-dark-secondary transition-colors"
            >
              Today
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </motion.button>
          </div>
        </div>

        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["month", "week"] as const).map((mode) => (
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

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs text-text-muted font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayTasks = getTasksForDate(day);
            const today = isToday(day);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square p-1 rounded-lg border cursor-pointer transition-colors ${
                  today
                    ? "bg-accent-primary/20 border-accent-primary"
                    : "border-transparent hover:bg-dark-tertiary"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  today ? "text-accent-primary" : "text-text-primary"
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <motion.div
                      key={task.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onClick(task)}
                      className="flex items-center gap-1 px-1 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[10px] truncate"
                    >
                      <span className="truncate">{task.title}</span>
                      {task.due_date && (
                        <span className="text-[10px] opacity-70">
                          {formatTimeLeft(task.due_date)}
                        </span>
                      )}
                    </motion.div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-text-muted text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="p-4">
        <h3 className="font-semibold text-text-primary mb-3">Upcoming Tasks</h3>
        <div className="space-y-2">
          {tasks
            .filter((task) => task.due_date && new Date(task.due_date) >= new Date())
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
            .slice(0, 5)
            .map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 4 }}
                onClick={() => onClick(task)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-tertiary cursor-pointer transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === "high" ? "bg-red-500" :
                  task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{task.title}</p>
                  <p className="text-xs text-text-muted">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                  </p>
                </div>
                <Badge variant={task.priority === "high" ? "high" : task.priority === "medium" ? "medium" : "low"}>
                  {task.priority}
                </Badge>
              </motion.div>
            ))}
        </div>
      </Card>
    </div>
  );
}
