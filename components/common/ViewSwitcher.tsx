"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, List, Kanban, Calendar, LayoutGrid, BarChart3, Clock, Table } from "lucide-react";
import { ViewType } from "@/types";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: "main", icon: <Layout className="w-4 h-4" />, label: "Main" },
    { id: "list", icon: <List className="w-4 h-4" />, label: "List" },
    { id: "kanban", icon: <Kanban className="w-4 h-4" />, label: "Kanban" },
    { id: "calendar", icon: <Calendar className="w-4 h-4" />, label: "Calendar" },
    { id: "gallery", icon: <LayoutGrid className="w-4 h-4" />, label: "Gallery" },
    { id: "gantt", icon: <BarChart3 className="w-4 h-4" />, label: "Gantt" },
    { id: "timeline", icon: <Clock className="w-4 h-4" />, label: "Timeline" },
    { id: "database", icon: <Table className="w-4 h-4" />, label: "Database" },
  ];

  const visibleViews = views.slice(0, 5);
  const moreViews = views.slice(5);

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-dark-tertiary rounded-xl p-1">
        {visibleViews.map((view) => {
          const isActive = currentView === view.id;

          return (
            <motion.button
              key={view.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs ${
                isActive
                  ? "bg-accent-primary text-white shadow-lg"
                  : "text-text-muted hover:text-text-primary hover:bg-dark-secondary"
              }`}
              title={view.label}
            >
              {view.icon}
              <span className="hidden sm:inline">{view.label}</span>
            </motion.button>
          );
        })}
      </div>
      
      {moreViews.length > 0 && (
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-tertiary rounded-lg text-text-muted hover:text-text-primary transition-all"
          >
            <span className="text-xs">•••</span>
          </motion.button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 bg-dark-secondary rounded-xl p-2 shadow-xl border border-dark-tertiary z-50 min-w-[140px]"
              >
                {moreViews.map((view) => {
                  const isActive = currentView === view.id;

                  return (
                    <motion.button
                      key={view.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onViewChange(view.id);
                        setIsExpanded(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs ${
                        isActive
                          ? "bg-accent-primary text-white"
                          : "text-text-muted hover:text-text-primary hover:bg-dark-tertiary"
                      }`}
                    >
                      {view.icon}
                      {view.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
