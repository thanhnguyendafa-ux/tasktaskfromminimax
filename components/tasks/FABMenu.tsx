"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Calendar, Repeat, Upload, X } from "lucide-react";

interface FABMenuProps {
  onCreateTask: (type: "regular" | "with-subtasks" | "recurring" | "import") => void;
  visible?: boolean;
}

export function FABMenu({ onCreateTask, visible = true }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!visible) return null;

  const menuItems = [
    {
      type: "regular" as const,
      icon: List,
      label: "New Task",
      description: "Create a simple task",
      color: "bg-accent-primary",
    },
    {
      type: "with-subtasks" as const,
      icon: List,
      label: "Task with Subtasks",
      description: "Create task with steps",
      color: "bg-blue-500",
    },
    {
      type: "recurring" as const,
      icon: Repeat,
      label: "Recurring Task",
      description: "Repeat automatically",
      color: "bg-green-500",
    },
    {
      type: "import" as const,
      icon: Upload,
      label: "Import from CSV",
      description: "Bulk create tasks",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div ref={fabRef} className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Menu items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 items-end"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.description}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onCreateTask(item.type);
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all
          ${isOpen ? "bg-dark-tertiary" : "bg-accent-primary"}
        `}
        style={{
          boxShadow: isOpen
            ? "none"
            : "0 4px 14px rgba(99, 102, 241, 0.4)",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7 text-text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Plus className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// Compact FAB variant for inline use
interface CompactFABProps {
  onClick: () => void;
  label?: string;
}

export function CompactFAB({ onClick, label = "+ New Task" }: CompactFABProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary rounded-xl text-white font-medium text-sm shadow-lg shadow-accent-primary/25"
    >
      <Plus className="w-5 h-5" />
      {label}
    </motion.button>
  );
}
