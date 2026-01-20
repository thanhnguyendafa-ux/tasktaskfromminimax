"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTimeProgressive } from "@/lib/formatDuration";
import { useTaskStore } from "@/stores/useTaskStore";

interface TimeAwayTrackerProps {
  taskId: string;
  onTimeAwayUpdate: (seconds: number) => void;
}

export function TimeAwayTracker({ taskId, onTimeAwayUpdate }: TimeAwayTrackerProps) {
  const { tasks } = useTaskStore();
  const task = tasks.find((t) => t.id === taskId);
  
  const [lastActive, setLastActive] = useState<Date | null>(null);
  const [timeAway, setTimeAway] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  // Track user activity
  useEffect(() => {
    if (!task) return;

    const now = Date.now();
    setLastActive(new Date(task.last_active_at || now));
    setIsTracking(true);

    const intervals = setInterval(() => {
      const lastActiveTime = task.last_active_at
        ? new Date(task.last_active_at).getTime()
        : now;
      const away = Math.floor((now - lastActiveTime) / 1000);
      setTimeAway(away);
    }, 1000);

    return () => {
      clearInterval(intervals);
      setIsTracking(false);
    };
  }, [task]);

  // Update task on activity
  const updateActivity = useCallback(() => {
    const now = new Date().toISOString();
    useTaskStore.getState().updateTask(taskId, {
      last_active_at: now,
      time_away_seconds: 0,
    });
    setTimeAway(0);
    setLastActive(new Date());
  }, [taskId]);

  // Listen for user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      if (timeAway > 30) { // Only update if away for more than 30 seconds
        updateActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeAway, updateActivity]);

  const formatTime = formatTimeProgressive;

  const getUrgency = () => {
    if (timeAway < 300) return "low"; // 5 min
    if (timeAway < 1800) return "medium"; // 30 min
    return "high";
  };

  if (!task || !isTracking) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            getUrgency() === "high"
              ? "bg-red-500/20"
              : getUrgency() === "medium"
              ? "bg-yellow-500/20"
              : "bg-dark-tertiary"
          }`}>
            {timeAway > 300 ? (
              <AlertTriangle className={`w-5 h-5 ${
                getUrgency() === "high"
                  ? "text-red-500"
                  : "text-yellow-500"
              }`} />
            ) : (
              <Clock className="w-5 h-5 text-text-muted" />
            )}
          </div>
          <div>
            <p className="text-sm text-text-secondary">Time Away</p>
            <motion.p
              key={timeAway}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-lg font-mono font-bold ${
                getUrgency() === "high"
                  ? "text-red-400"
                  : getUrgency() === "medium"
                  ? "text-yellow-400"
                  : "text-text-primary"
              }`}
            >
              {formatTime(timeAway)}
            </motion.p>
          </div>
        </div>

        <Badge
          variant={
            getUrgency() === "high"
              ? "danger"
              : getUrgency() === "medium"
              ? "warning"
              : "default"
          }
        >
          {getUrgency() === "high"
            ? "Need attention!"
            : getUrgency() === "medium"
            ? "Getting there"
            : "Active"}
        </Badge>
      </div>

      {timeAway > 60 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={updateActivity}
          className="w-full mt-3 py-2 bg-accent-primary rounded-lg text-white text-sm font-medium"
        >
          I&apos;m back! Resume tracking
        </motion.button>
      )}
    </Card>
  );
}
