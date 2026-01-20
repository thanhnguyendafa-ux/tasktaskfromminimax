"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, ArrowUpDown, Download, Upload, MoreHorizontal, Bell, BellOff, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Task } from "@/types";

interface TaskDatabaseViewProps {
  tasks: Task[];
  onClick: (task: Task) => void;
}

type SortField = "title" | "status" | "priority" | "due_date" | "created_at";
type SortDirection = "asc" | "desc";

export function TaskDatabaseView({ tasks, onClick }: TaskDatabaseViewProps) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const columns = [
    { key: "title", label: "Title", width: "minmax(200px, 1fr)" },
    { key: "status", label: "Status", width: "100px" },
    { key: "priority", label: "Priority", width: "80px" },
    { key: "due_date", label: "Due Date", width: "100px" },
    { key: "countdown", label: "Countdown", width: "80px" },
    { key: "time_away", label: "Time Away", width: "80px" },
    { key: "reminder", label: "Reminder", width: "80px" },
    { key: "tally_count", label: "Tally", width: "60px" },
    { key: "pomodoro_count", label: "Pomodoro", width: "80px" },
  ];

  const filteredTasks = tasks
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .filter((task) => filterPriority === "all" || task.priority === filterPriority)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "due_date":
          comparison = new Date(a.due_date || "9999").getTime() - new Date(b.due_date || "9999").getTime();
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeInfo = (dueDate: string | null) => {
    if (!dueDate) return { text: "", color: "text-text-muted", urgent: false, overdue: false, percent: 0 };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: `${Math.abs(daysLeft)}d overdue`, color: "text-red-400", urgent: true, overdue: true, percent: 100 };
    if (daysLeft === 0) return { text: "Today", color: "text-yellow-400", urgent: true, overdue: false, percent: 90 };
    if (daysLeft === 1) return { text: "1d left", color: "text-yellow-400", urgent: true, overdue: false, percent: 80 };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: "text-orange-400", urgent: false, overdue: false, percent: 60 };
    return { text: `${daysLeft}d left`, color: "text-text-muted", urgent: false, overdue: false, percent: 40 };
  };

  const getCountdownPercent = (dueDate: string | null) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const totalDays = 7;
    return Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
  };

  const getCountdownColor = (percent: number, overdue: boolean) => {
    if (overdue) return "bg-red-500";
    if (percent >= 80) return "bg-yellow-500";
    if (percent >= 60) return "bg-orange-500";
    return "bg-emerald-500";
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "-";
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const toggleRow = (taskId: string) => {
    setSelectedRows((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredTasks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTasks.map((t) => t.id));
    }
  };

  const priorityVariant = {
    low: "low" as const,
    medium: "medium" as const,
    high: "high" as const,
  };

  const statusColors = {
    pending: "text-gray-400 bg-gray-400/10",
    in_progress: "text-blue-400 bg-blue-400/10",
    completed: "text-emerald-400 bg-emerald-400/10",
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-dark-tertiary rounded-lg p-1">
          {(["all", "pending", "in_progress", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs capitalize transition-colors ${
                filterStatus === status
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

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

        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Database Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-dark-tertiary">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-text-muted"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-text-muted cursor-pointer hover:text-text-primary transition-colors"
                    style={{ minWidth: col.width }}
                    onClick={() => handleSort(col.key as SortField)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && (
                        <span className="text-accent-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-dark-tertiary">
              {filteredTasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`hover:bg-dark-tertiary/50 transition-colors ${
                    selectedRows.includes(task.id) ? "bg-accent-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(task.id)}
                      onChange={() => toggleRow(task.id)}
                      className="w-4 h-4 rounded border-text-muted"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded capitalize ${statusColors[task.status]}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariant[task.priority]} className="text-xs">
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-primary">{task.tally_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-primary">{task.pomodoro_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-primary">{formatTime(task.total_time_seconds)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${getTimeInfo(task.due_date).color}`}>
                      {formatDate(task.due_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full">
                      <div className="h-1 bg-dark-primary rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${getCountdownColor(getCountdownPercent(task.due_date), getTimeInfo(task.due_date).overdue)}`}
                          style={{ width: `${getCountdownPercent(task.due_date)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">
                        {Math.round(getCountdownPercent(task.due_date))}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-muted">{formatTimeAgo(task.last_active_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {task.reminder_interval_minutes && task.reminder_interval_minutes > 0 ? (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Bell className="w-3 h-3" />
                        {task.reminder_interval_minutes}m
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-text-muted">
                        <BellOff className="w-3 h-3" />
                        Off
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-dark-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-text-muted" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-dark-tertiary border-t border-dark-primary flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filteredTasks.length} records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Previous
            </Button>
            <span className="text-xs text-text-muted">Page 1 of 1</span>
            <Button variant="ghost" size="sm" className="text-xs">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-dark-secondary rounded-xl p-3 shadow-xl border border-dark-tertiary flex items-center gap-3"
        >
          <span className="text-sm text-text-primary">{selectedRows.length} selected</span>
          <Button variant="secondary" size="sm">Complete</Button>
          <Button variant="secondary" size="sm">Delete</Button>
          <Button variant="secondary" size="sm">Move</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRows([])}>
            Clear
          </Button>
        </motion.div>
      )}
    </div>
  );
}
