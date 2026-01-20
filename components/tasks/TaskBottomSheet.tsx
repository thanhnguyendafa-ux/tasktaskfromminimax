"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Clock, Calendar, Tag, CheckCircle, Edit, Trash2, Share2, Archive, MoreHorizontal } from "lucide-react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatTimeProgressive } from "@/lib/formatDuration";

interface TaskBottomSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onTally: (id: string) => void;
  onPomodoro: (id: string) => void;
  onTimer: (id: string) => void;
}

export function TaskBottomSheet({
  task,
  isOpen,
  onClose,
  onComplete,
  onEdit,
  onDelete,
  onArchive,
  onTally,
  onPomodoro,
  onTimer,
}: TaskBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!task) return null;

  const formatDueDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDueDateStatus = (date: string) => {
    const d = new Date(date);
    const diff = d.getTime() - Date.now();
    if (diff < 0) return { status: "overdue", text: "Overdue" };
    if (diff < 24 * 60 * 60 * 1000) return { status: "soon", text: "Due soon" };
    return { status: "normal", text: formatDueDate(date) };
  };

  const dueDateStatus = task.due_date ? getDueDateStatus(task.due_date) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-dark-secondary rounded-t-2xl shadow-xl z-50 max-h-[85vh] overflow-hidden"
            style={{
              borderTopLeftRadius: "1.5rem",
              borderTopRightRadius: "1.5rem",
            }}
          >
            {/* Drag handle */}
            <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-dark-tertiary" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-24px)] px-4 pb-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onComplete(task.id)}
                    className={`
                      w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-1
                      ${task.status === "completed"
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-text-muted hover:border-accent-primary"
                      }
                    `}
                  >
                    {task.status === "completed" && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <h2 className={`
                      text-xl font-semibold leading-snug
                      ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}
                    `}>
                      {task.title}
                    </h2>

                    {/* Status & Priority */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}>
                        {task.priority}
                      </Badge>
                      {task.status === "completed" && (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(task)}
                    className="p-2 rounded-lg bg-dark-tertiary text-text-muted hover:text-text-primary"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg bg-dark-tertiary text-text-muted hover:text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Tally */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTally(task.id)}
                  className="p-3 bg-dark-tertiary rounded-xl text-center"
                >
                  <div className="text-lg font-semibold text-text-primary">
                    {task.tally_count}/{task.tally_goal}
                  </div>
                  <div className="text-xs text-text-muted">Tally</div>
                </motion.button>

                {/* Pomodoro */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPomodoro(task.id)}
                  className="p-3 bg-dark-tertiary rounded-xl text-center"
                >
                  <div className="text-lg font-semibold text-text-primary">{task.pomodoro_count}</div>
                  <div className="text-xs text-text-muted">Pomodoros</div>
                </motion.button>

                {/* Timer */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTimer(task.id)}
                  className="p-3 bg-dark-tertiary rounded-xl text-center"
                >
                  <div className="text-lg font-semibold text-text-primary font-mono">
                    {formatTimeProgressive(task.total_time_seconds)}
                  </div>
                  <div className="text-xs text-text-muted">Time</div>
                </motion.button>
              </div>

              {/* Tally Progress */}
              <div className="mb-4 p-3 bg-dark-tertiary rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-text-primary">
                    {Math.round((task.tally_count / task.tally_goal) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={task.tally_count}
                  max={task.tally_goal}
                  color={task.tally_count >= task.tally_goal ? "success" : "primary"}
                  showLabel={false}
                />
              </div>

              {/* Due Date */}
              {dueDateStatus && (
                <div className={`
                  flex items-center gap-3 p-3 rounded-xl mb-4
                  ${dueDateStatus.status === "overdue" ? "bg-red-500/10" : dueDateStatus.status === "soon" ? "bg-yellow-500/10" : "bg-dark-tertiary"}
                `}>
                  <Calendar className={`w-5 h-5 ${
                    dueDateStatus.status === "overdue" ? "text-red-400" : 
                    dueDateStatus.status === "soon" ? "text-yellow-400" : "text-text-muted"
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm text-text-secondary">Due Date</div>
                    <div className={`text-sm font-medium ${
                      dueDateStatus.status === "overdue" ? "text-red-400" : 
                      dueDateStatus.status === "soon" ? "text-yellow-400" : "text-text-primary"
                    }`}>
                      {dueDateStatus.text}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
                  <p className="text-sm text-text-primary leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-opacity-20"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(task.id)}
                  disabled={task.status === "completed"}
                  className={`
                    py-3 rounded-xl font-medium text-sm transition-all
                    ${task.status === "completed"
                      ? "bg-dark-tertiary text-text-muted cursor-not-allowed"
                      : "bg-accent-primary text-white shadow-lg shadow-accent-primary/25"
                    }
                  `}
                >
                  {task.status === "completed" ? "Completed" : "Mark Complete"}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTimer(task.id)}
                  className="py-3 rounded-xl bg-dark-tertiary text-text-primary font-medium text-sm"
                >
                  Start Timer
                </motion.button>
              </div>

              {/* More Actions */}
              <div className="border-t border-dark-tertiary pt-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">More Actions</h3>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(task)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-dark-tertiary"
                  >
                    <Edit className="w-5 h-5 text-text-muted" />
                    <span className="text-xs text-text-secondary">Edit</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onArchive(task.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-dark-tertiary"
                  >
                    <Archive className="w-5 h-5 text-text-muted" />
                    <span className="text-xs text-text-secondary">Archive</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(task.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-red-400">Delete</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
