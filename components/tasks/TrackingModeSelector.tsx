"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, Timer } from "lucide-react";
import { TrackingMode } from "@/types";

interface TrackingModeSelectorProps {
  mode: TrackingMode;
  onModeChange: (mode: TrackingMode) => void;
  disabled?: boolean;
}

const modeOptions: { value: TrackingMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "tally",
    label: "Tally",
    icon: <Target className="w-4 h-4" />,
    description: "Count up (+1 each time)",
  },
  {
    value: "time_tracker",
    label: "Timer",
    icon: <Clock className="w-4 h-4" />,
    description: "Track elapsed time",
  },
  {
    value: "pomodoro",
    label: "Pomodoro",
    icon: <Timer className="w-4 h-4" />,
    description: "Count down sessions",
  },
];

export function TrackingModeSelector({ mode, onModeChange, disabled }: TrackingModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-background-secondary rounded-lg">
      {modeOptions.map((option) => (
        <motion.button
          key={option.value}
          whileTap={{ scale: 0.95 }}
          onClick={() => onModeChange(option.value)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
            transition-all duration-200
            ${mode === option.value
              ? "bg-accent-primary text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-background-tertiary"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

interface TrackingModeDisplayProps {
  mode: TrackingMode;
  tallyCount?: number;
  tallyGoal?: number;
  timeSeconds?: number;
  pomodoroCount?: number;
  pomodoroGoal?: number;
  pomodoroRemaining?: number;
}

export function TrackingModeDisplay({
  mode,
  tallyCount = 0,
  tallyGoal = 0,
  timeSeconds = 0,
  pomodoroCount = 0,
  pomodoroGoal = 0,
  pomodoroRemaining = 0,
}: TrackingModeDisplayProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatPomodoroTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  switch (mode) {
    case "tally":
      return (
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent-primary" />
          <span className="font-mono font-medium">
            {tallyCount} / {tallyGoal}
          </span>
          {tallyGoal > 0 && (
            <div className="w-16 h-1.5 bg-background-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (tallyCount / tallyGoal) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      );
    
    case "time_tracker":
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-primary" />
          <span className="font-mono font-medium">
            {formatTime(timeSeconds)}
          </span>
        </div>
      );
    
    case "pomodoro":
      return (
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-accent-primary" />
          <span className="font-mono font-medium">
            {formatPomodoroTime(pomodoroRemaining)}
          </span>
          <span className="text-xs text-text-muted">
            ({pomodoroCount}/{pomodoroGoal})
          </span>
        </div>
      );
    
    default:
      return null;
  }
}
