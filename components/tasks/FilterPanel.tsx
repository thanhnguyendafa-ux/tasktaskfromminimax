"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, ChevronUp, X, Check } from "lucide-react";

export type FilterStatus = "all" | "pending" | "in_progress" | "completed";
export type FilterPriority = "all" | "high" | "medium" | "low";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterState {
  status: string[];
  priority: string[];
  dateRange: { start: string | null; end: string | null };
  tags: string[];
  sortBy: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Simple filter object interface
  filters?: FilterState;
  onApply?: (filters: FilterState) => void;
  onClear?: () => void;
  
  // Extended interface (optional, for more control)
  statusOptions?: FilterOption[];
  selectedStatus?: FilterStatus[];
  onStatusChange?: (status: FilterStatus[]) => void;
  
  priorityOptions?: FilterOption[];
  selectedPriority?: FilterPriority[];
  onPriorityChange?: (priority: FilterPriority[]) => void;
  
  dateOptions?: FilterOption[];
  selectedDate?: string | null;
  onDateChange?: (date: string | null) => void;
  
  availableTags?: { id: string; name: string; color: string }[];
  selectedTags?: string[];
  onTagChange?: (tags: string[]) => void;
  
  sortOptions?: FilterOption[];
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear,
  statusOptions = [
    { value: "pending", label: "Pending", count: 3 },
    { value: "in_progress", label: "In Progress", count: 2 },
    { value: "completed", label: "Completed", count: 5 },
  ],
  selectedStatus = [],
  onStatusChange,
  priorityOptions = [
    { value: "high", label: "High", count: 2 },
    { value: "medium", label: "Medium", count: 4 },
    { value: "low", label: "Low", count: 1 },
  ],
  selectedPriority = [],
  onPriorityChange,
  dateOptions = [
    { value: "today", label: "Today", count: 1 },
    { value: "tomorrow", label: "Tomorrow", count: 2 },
    { value: "this_week", label: "This Week", count: 3 },
    { value: "overdue", label: "Overdue", count: 1 },
  ],
  selectedDate = null,
  onDateChange,
  availableTags = [
    { id: "work", name: "Work", color: "#6366f1" },
    { id: "personal", name: "Personal", color: "#10b981" },
    { id: "urgent", name: "Urgent", color: "#ef4444" },
  ],
  selectedTags = [],
  onTagChange,
  sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "createdAt", label: "Created" },
    { value: "alphabetical", label: "Alphabetical" },
  ],
  sortBy = "dueDate",
  onSortChange,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(
    filters || {
      status: [],
      priority: [],
      dateRange: { start: null, end: null },
      tags: [],
      sortBy: "dueDate",
    }
  );

  // Toggle status
  const toggleStatus = (value: string) => {
    const newStatus = localFilters.status.includes(value)
      ? localFilters.status.filter((s) => s !== value)
      : [...localFilters.status, value];
    const updated = { ...localFilters, status: newStatus };
    setLocalFilters(updated);
    onStatusChange?.(newStatus as FilterStatus[]);
  };

  // Toggle priority
  const togglePriority = (value: string) => {
    const newPriority = localFilters.priority.includes(value)
      ? localFilters.priority.filter((p) => p !== value)
      : [...localFilters.priority, value];
    const updated = { ...localFilters, priority: newPriority };
    setLocalFilters(updated);
    onPriorityChange?.(newPriority as FilterPriority[]);
  };

  // Toggle tags
  const toggleTag = (tagId: string) => {
    const newTags = localFilters.tags.includes(tagId)
      ? localFilters.tags.filter((t) => t !== tagId)
      : [...localFilters.tags, tagId];
    const updated = { ...localFilters, tags: newTags };
    setLocalFilters(updated);
    onTagChange?.(newTags);
  };

  // Set date
  const setDate = (date: string | null) => {
    const updated = { ...localFilters, dateRange: { start: date, end: date } };
    setLocalFilters(updated);
    onDateChange?.(date);
  };

  // Set sort
  const setSort = (sort: string) => {
    const updated = { ...localFilters, sortBy: sort };
    setLocalFilters(updated);
    onSortChange?.(sort);
  };

  // Apply filters
  const handleApply = () => {
    onApply?.(localFilters);
    onClose();
  };

  // Clear all
  const handleClear = () => {
    const cleared = {
      status: [],
      priority: [],
      dateRange: { start: null, end: null },
      tags: [],
      sortBy: "dueDate",
    };
    setLocalFilters(cleared);
    onClear?.();
    onApply?.(cleared);
    onClose();
  };

  // Get active filter count
  const activeFilterCount =
    localFilters.status.length +
    localFilters.priority.length +
    localFilters.tags.length +
    (localFilters.dateRange.start ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-dark-secondary rounded-t-2xl shadow-xl z-50 max-h-[85vh] overflow-hidden"
          >
            <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-dark-tertiary" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-dark-tertiary">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg bg-dark-tertiary text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => {
                    const isSelected = localFilters.status.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStatus(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                            : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.count !== undefined && (
                          <span className={`text-xs ${isSelected ? "text-accent-primary/70" : "text-text-muted"}`}>
                            {option.count}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Priority</h3>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((option) => {
                    const isSelected = localFilters.priority.includes(option.value);
                    const color = option.value === "high" ? "red" : option.value === "medium" ? "yellow" : "blue";
                    return (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePriority(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? `bg-${color}-500/20 border-${color}-500 text-${color}-400`
                            : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.count !== undefined && (
                          <span className={`text-xs ${isSelected ? `text-${color}-400/70` : "text-text-muted"}`}>
                            {option.count}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Due Date</h3>
                <div className="flex flex-wrap gap-2">
                  {dateOptions.map((option) => {
                    const isSelected = localFilters.dateRange.start === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDate(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                            : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.count !== undefined && (
                          <span className={`text-xs ${isSelected ? "text-accent-primary/70" : "text-text-muted"}`}>
                            {option.count}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = localFilters.tags.includes(tag.id);
                    return (
                      <motion.button
                        key={tag.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                            : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm font-medium">{tag.name}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => {
                    const isSelected = localFilters.sortBy === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSort(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-accent-primary/20 border-accent-primary text-accent-primary"
                            : "bg-dark-tertiary border-dark-tertiary text-text-primary hover:border-text-muted"
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border-t border-dark-tertiary">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl bg-dark-tertiary text-text-primary font-medium"
              >
                Clear All
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                className="flex-1 py-3 rounded-xl bg-accent-primary text-white font-medium shadow-lg shadow-accent-primary/25"
              >
                Apply Filters
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
