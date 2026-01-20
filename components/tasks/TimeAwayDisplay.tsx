"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TimeAwayDisplayProps {
  lastActiveAt: string | Date;
  onReset: () => void;
  onSnooze: (minutes: number) => void;
}

export function TimeAwayDisplay({
  lastActiveAt,
  onReset,
  onSnooze,
}: TimeAwayDisplayProps) {
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  const getTimeAwayText = () => {
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  };

  const getState = () => {
    if (diffMinutes < 5) return "active";
    if (diffMinutes < 30) return "idle";
    if (diffMinutes < 60) return "away";
    return "forgotten";
  };

  const state = getState();
  const stateConfig = {
    active: { color: "text-accent-success", bg: "bg-accent-success", icon: CheckCircle, label: "Active", description: "Task is being worked on" },
    idle: { color: "text-accent-warning", bg: "bg-accent-warning", icon: Clock, label: "Idle", description: "Task has been inactive" },
    away: { color: "text-orange-500", bg: "bg-orange-500", icon: AlertCircle, label: "Away", description: "Consider returning to this task" },
    forgotten: { color: "text-accent-danger", bg: "bg-accent-danger", icon: AlertCircle, label: "Forgotten", description: "Task needs attention!" },
  };

  const config = stateConfig[state as keyof typeof stateConfig];
  const Icon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">Time Away</h3>
        <motion.div
          className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} bg-opacity-20`}
          animate={{ scale: state === "forgotten" ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </motion.div>
      </div>

      {/* Last Active Time */}
      <div className="text-center mb-4">
        <div className="text-sm text-text-muted mb-1">Last active</div>
        <div className="text-2xl font-bold text-text-primary">{getTimeAwayText()}</div>
      </div>

      {/* State Description */}
      <div className="text-center text-sm text-text-muted mb-4">
        {config.description}
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>0m</span>
          <span>30m</span>
          <span>60m</span>
          <span>2h</span>
        </div>
        <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.bg.replace("bg-", "bg-").replace(" bg-opacity-20", "")}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((diffMinutes / 120) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onSnooze(15)} className="flex-1 text-sm">
          Snooze 15m
        </Button>
        <Button variant="secondary" onClick={() => onSnooze(30)} className="flex-1 text-sm">
          Snooze 30m
        </Button>
        <Button onClick={onReset} className="flex-1">
          I&apos;m Back
        </Button>
      </div>
    </Card>
  );
}
