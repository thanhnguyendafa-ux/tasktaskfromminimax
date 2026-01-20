"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: number | string;
  height?: number | string;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClass = "bg-dark-tertiary";

  const variantClass = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  }[variant];

  const animationClass = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: "",
  }[animation];

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`}
      style={{ width, height }}
    />
  );
}

// Task Card Skeleton
interface TaskCardSkeletonProps {
  count?: number;
}

export function TaskCardSkeleton({ count = 1 }: TaskCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-dark-secondary rounded-xl border border-dark-tertiary"
        >
          {/* Header row */}
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="70%" height={20} className="rounded" />
              <Skeleton width="40%" height={14} className="rounded" />
            </div>
            <Skeleton width={40} height={24} className="rounded-full" />
          </div>

          {/* Meta row */}
          <div className="flex gap-2 mt-4">
            <Skeleton width={60} height={32} className="rounded-lg" />
            <Skeleton width={60} height={32} className="rounded-lg" />
            <Skeleton width={80} height={32} className="rounded-lg" />
          </div>

          {/* Progress */}
          <div className="mt-3">
            <Skeleton width="100%" height={8} className="rounded-full" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mt-3">
            <Skeleton width={60} height={24} className="rounded-full" />
            <Skeleton width={60} height={24} className="rounded-full" />
            <Skeleton width={40} height={24} className="rounded-full" />
          </div>
        </motion.div>
      ))}
    </>
  );
}

// Filter Chips Skeleton
export function FilterChipsSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          width={80}
          height={40}
          variant="rounded"
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
}

// Search Bar Skeleton
export function SearchBarSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-tertiary rounded-xl border border-dark-tertiary">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton width="80%" height={20} className="rounded" />
        <Skeleton variant="circular" width={16} height={16} />
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-dark-tertiary flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

// Loading Spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <div className={`${sizeClass} ${className}`}>
      <svg
        className="animate-spin text-accent-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// Inline Loading
export function InlineLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-text-muted">{text}</span>
    </div>
  );
}

// Pull to Refresh indicator
interface PullToRefreshProps {
  isRefreshing: boolean;
  progress: number;
}

export function PullToRefreshIndicator({ isRefreshing, progress }: PullToRefreshProps) {
  return (
    <div className="flex items-center justify-center py-4">
      {isRefreshing ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-text-muted">Refreshing...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ rotate: progress * 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg
              className="w-5 h-5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
          <span className="text-xs text-text-muted">
            {progress > 0 ? "Pull to refresh" : "Release to refresh"}
          </span>
        </div>
      )}
    </div>
  );
}

// Infinite Scroll Loader
export function InfiniteScrollLoader() {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-text-muted ml-2">Loading more...</span>
    </div>
  );
}

// End of list indicator
export function EndOfList({ totalCount }: { totalCount: number }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="flex items-center gap-2 text-text-muted">
        <div className="w-8 h-px bg-dark-tertiary" />
        <span className="text-sm">Showing all {totalCount} tasks</span>
        <div className="w-8 h-px bg-dark-tertiary" />
      </div>
    </div>
  );
}
