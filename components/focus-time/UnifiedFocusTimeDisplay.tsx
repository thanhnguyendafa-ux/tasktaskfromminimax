"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Timer, TrendingUp, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatTimeProgressive } from "@/lib/formatDuration";
import { FocusTimeManager } from "@/lib/focus-time/FocusTimeManager";
import { EnhancedTimeTracker } from "@/lib/focus-time/EnhancedTimeTracker";
import { PomodoroAdapter } from "@/lib/focus-time/PomodoroAdapter";
import { NotificationService } from "@/lib/focus-time/NotificationService";

interface UnifiedFocusTimeDisplayProps {
  taskId: string;
  onTimeUpdate?: (totalTime: number) => void;
}

export function UnifiedFocusTimeDisplay({ taskId, onTimeUpdate }: UnifiedFocusTimeDisplayProps) {
  const [focusManager] = useState(() => new FocusTimeManager());
  const [tracker] = useState(() => new EnhancedTimeTracker());
  const [pomodoroAdapter] = useState(() => new PomodoroAdapter());
  const [notificationService] = useState(() => new NotificationService());

  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [currentMode, setCurrentMode] = useState<'manual' | 'pomodoro'>('manual');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [timeBreakdown, setTimeBreakdown] = useState({
    manualTime: 0,
    completedPomodoroTime: 0,
    incompletePomodoroTime: 0,
    currentSessionTime: 0,
    total: 0,
    tallyCount: 0,
    tallyGoal: 0,
    tallyProgress: 0
  });

  // Subscribe to time updates
  useEffect(() => {
    focusManager.onTimeUpdate((newTotalTime) => {
      setTotalFocusTime(newTotalTime);
      if (onTimeUpdate) {
        onTimeUpdate(newTotalTime);
      }
    });
  }, [focusManager, onTimeUpdate]);

  // Subscribe to mode changes
  useEffect(() => {
    focusManager.onModeSwitch((newMode) => {
      setCurrentMode(newMode as 'manual' | 'pomodoro');
    });
  }, [focusManager]);

  // Update display every second during active session
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionTime = focusManager.getCurrentSessionTime();
      setCurrentSessionTime(sessionTime);
      
      const total = focusManager.getTotalFocusTime();
      setTotalFocusTime(total);
    }, 1000);

    return () => clearInterval(interval);
  }, [focusManager]);

  const handleShowBreakdown = () => {
    const breakdown = focusManager.getTimeBreakdown();
    setTimeBreakdown(breakdown);
    setShowBreakdown(true);
  };

  const formatTime = formatTimeProgressive;

  return (
    <>
      <Card className="p-4 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border-2 border-accent-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Total Focus Time</h3>
          </div>
          <button
            onClick={handleShowBreakdown}
            className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
          >
            <Info className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Total Focus Time Display */}
        <div className="text-center mb-4">
          <motion.div
            className="text-4xl font-bold text-accent-primary mb-1"
            animate={{ scale: currentSessionTime > 0 ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {formatTime(totalFocusTime)}
          </motion.div>
          <p className="text-xs text-text-muted">Combined from all focus sessions</p>
        </div>

        {/* Current Session Display */}
        {currentSessionTime > 0 && (
          <div className="p-3 bg-dark-tertiary rounded-lg mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentMode === 'pomodoro' ? (
                  <Timer className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-sm text-text-secondary">Current Session</span>
              </div>
              <Badge variant={currentMode === 'pomodoro' ? 'warning' : 'medium'}>
                {currentMode === 'pomodoro' ? '🍅 Pomodoro' : '⏱️ Manual'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-text-primary mt-2 text-center">
              {formatTime(currentSessionTime)}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-dark-tertiary rounded-lg">
            <p className="text-xs text-text-muted">Manual</p>
            <p className="text-sm font-semibold text-blue-400">
              {Math.floor(timeBreakdown.manualTime / 60)}m
            </p>
          </div>
          <div className="text-center p-2 bg-dark-tertiary rounded-lg">
            <p className="text-xs text-text-muted">Completed</p>
            <p className="text-sm font-semibold text-green-400">
              {Math.floor(timeBreakdown.completedPomodoroTime / 60)}m
            </p>
          </div>
          <div className="text-center p-2 bg-dark-tertiary rounded-lg">
            <p className="text-xs text-text-muted">Partial</p>
            <p className="text-sm font-semibold text-yellow-400">
              {Math.floor(timeBreakdown.incompletePomodoroTime / 60)}m
            </p>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-text-muted">
            💡 All your focus time is tracked, even incomplete Pomodoros!
          </p>
        </div>
      </Card>

      {/* Breakdown Modal */}
      <Modal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        title="Focus Time Breakdown"
      >
        <div className="space-y-4">
          <div className="p-4 bg-dark-tertiary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-text-primary">Manual Timer</span>
              </div>
              <span className="text-lg font-bold text-blue-400">
                {formatTime(timeBreakdown.manualTime)}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Time tracked using the manual timer
            </p>
          </div>

          <div className="p-4 bg-dark-tertiary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-text-primary">Completed Pomodoros</span>
              </div>
              <span className="text-lg font-bold text-green-400">
                {formatTime(timeBreakdown.completedPomodoroTime)}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Full 25-minute Pomodoro sessions completed
            </p>
          </div>

          <div className="p-4 bg-dark-tertiary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-text-primary">Incomplete Pomodoros</span>
              </div>
              <span className="text-lg font-bold text-yellow-400">
                {formatTime(timeBreakdown.incompletePomodoroTime)}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Partial Pomodoro time automatically saved
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-lg border-2 border-accent-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                <span className="text-sm font-medium text-text-primary">Total Focus Time</span>
              </div>
              <span className="text-xl font-bold text-accent-primary">
                {formatTime(timeBreakdown.total)}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Sum of all focus time from every source
            </p>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400">
              ℹ️ <strong>Smart Tracking:</strong> When you don&apos;t complete a Pomodoro session, 
              the time you actually spent focusing is automatically saved to your total focus time. 
              No time is ever lost!
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
