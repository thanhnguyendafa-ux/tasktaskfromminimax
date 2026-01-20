"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Tag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Task } from "@/types";

interface DatabaseViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function DatabaseView({ tasks, onTaskClick }: DatabaseViewProps) {
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "due_date") {
      comparison = (a.due_date || "").localeCompare(b.due_date || "");
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
    } else {
      comparison = (a.created_at || "").localeCompare(b.created_at || "");
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const columns = [
    { key: "title", label: "Task", width: "40%" },
    { key: "status", label: "Status", width: "15%" },
    { key: "priority", label: "Priority", width: "15%" },
    { key: "due_date", label: "Due Date", width: "20%" },
    { key: "actions", label: "Actions", width: "10%" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            {tasks.length} tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-dark-tertiary rounded-lg text-sm text-text-primary"
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1.5 bg-dark-tertiary rounded-lg text-sm text-text-primary"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Database Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-tertiary">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-sm font-medium text-text-muted"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-dark-tertiary/50 hover:bg-dark-tertiary/30 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        readOnly
                        className="w-4 h-4 rounded border-text-muted"
                      />
                      <span
                        className={`text-text-primary ${
                          task.status === "completed" ? "line-through text-text-muted" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 ml-7">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                          >
                            {tag.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in_progress"
                          ? "warning"
                          : "default"
                      }
                    >
                      {task.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "high"
                          : task.priority === "medium"
                          ? "medium"
                          : "low"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-muted">
                        {task.tally_count}
                      </span>
                      <Tag className="w-4 h-4 text-text-muted" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
