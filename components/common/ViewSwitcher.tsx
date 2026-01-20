"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, List, Kanban, Calendar } from "lucide-react";
import { ViewType } from "@/types";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: "main", icon: <Layout className="w-5 h-5" />, label: "Main" },
    { id: "list", icon: <List className="w-5 h-5" />, label: "List" },
    { id: "kanban", icon: <Kanban className="w-5 h-5" />, label: "Kanban" },
    { id: "calendar", icon: <Calendar className="w-5 h-5" />, label: "Calendar" },
  ];

  return (
    <div className="flex bg-dark-tertiary rounded-xl p-1">
      {views.map((view) => {
        const isActive = currentView === view.id;

        return (
          <motion.button
            key={view.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isActive
                ? "bg-accent-primary text-white shadow-lg"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {view.icon}
            <span className="text-sm hidden sm:inline">{view.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
