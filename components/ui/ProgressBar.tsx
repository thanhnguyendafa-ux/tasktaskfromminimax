"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: "bg-accent-primary",
    success: "bg-emerald-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-text-secondary">Progress</span>
          <span className="text-sm font-medium text-text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}
