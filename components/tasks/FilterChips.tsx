"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FilterChip {
  id: string;
  label: string;
  badge?: number;
}

interface FilterChipsProps {
  chips?: FilterChip[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onClear?: () => void;
  // New props for simpler usage
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  taskCounts?: {
    all?: number;
    today?: number;
    overdue?: number;
    high?: number;
    completed?: number;
  };
}

export function FilterChips({
  chips,
  selectedIds = [],
  onSelect,
  onClear,
  activeFilter,
  onFilterChange,
  taskCounts,
}: FilterChipsProps) {
  // Build chips from taskCounts if provided
  const displayChips = chips || [
    { id: "all", label: "All", badge: taskCounts?.all },
    { id: "today", label: "Today", badge: taskCounts?.today },
    { id: "overdue", label: "Overdue", badge: taskCounts?.overdue },
    { id: "high", label: "High Priority", badge: taskCounts?.high },
    { id: "completed", label: "Completed", badge: taskCounts?.completed },
  ];

  // Determine selected state
  const getSelectedIds = () => {
    if (activeFilter) return [activeFilter];
    return selectedIds;
  };

  const handleSelect = (id: string) => {
    if (onFilterChange) {
      onFilterChange(id);
    } else if (onSelect) {
      onSelect(id);
    }
  };

  const currentSelected = getSelectedIds();
  const hasSelection = currentSelected.length > 0;

  return (
    <div className="w-full">
      {/* Filter chips scroll container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <AnimatePresence>
          {displayChips.map((chip) => {
            const isSelected = currentSelected.includes(chip.id);
            const hasBadge = chip.badge !== undefined && chip.badge > 0;

            return (
              <motion.button
                key={chip.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(chip.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap
                  transition-all duration-200 border
                  ${isSelected
                    ? "bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/25"
                    : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                  }
                `}
              >
                <span className="text-sm font-medium">{chip.label}</span>
                {(hasBadge || isSelected) && (
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-xs font-semibold
                      ${isSelected ? "bg-white/20 text-white" : "bg-dark-secondary text-text-muted"}
                    `}
                  >
                    {chip.badge || ""}
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Clear button when selection exists */}
        {hasSelection && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-dark-tertiary border border-dark-tertiary text-text-muted hover:text-red-400 hover:border-red-500/50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </motion.button>
        )}
      </div>

      {/* Selected count indicator */}
      {hasSelection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-text-muted"
        >
          {selectedIds.length} filter{selectedIds.length > 1 ? "s" : ""} applied
        </motion.div>
      )}
    </div>
  );
}
