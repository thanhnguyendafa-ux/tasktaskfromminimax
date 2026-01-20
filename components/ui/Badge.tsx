"use client";

import React from "react";

interface BadgeProps {
  variant?: "low" | "medium" | "high" | "success" | "warning" | "danger" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variants = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
    success: "bg-emerald-500/20 text-emerald-400",
    warning: "bg-orange-500/20 text-orange-400",
    danger: "bg-red-500/20 text-red-400",
    default: "bg-dark-tertiary text-text-secondary",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
