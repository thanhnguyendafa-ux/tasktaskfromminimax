"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Minus, Play, Pause, Square, Target, Timer, Bell, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Task } from "@/types";
import { formatTimeProgressive } from "@/lib/formatDuration";

interface TaskDetailTrackingProps {
  task: Task;
  onUpdateTally: (increment: number) => void;
  onStartPomodoro: () => void;
  onStopPomodoro: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onAddManualTime: (minutes: number) => void;
  onUpdateReminder: (enabled: boolean, interval: number) => void;
  onUpdateGoal: (goal: number) => void;
}

export function TaskDetailTracking({
  task,
  onUpdateTally,
  onStartPomodoro,
  onStopPomodoro,
  onStartTimer,
  onStopTimer,
  onAddManualTime,
  onUpdateReminder,
  onUpdateGoal,
}: TaskDetailTrackingProps) {
  const [showTallyModal, setShowTallyModal] = useState(false);
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [manualTime, setManualTime] = useState("15");
  const [tallyGoal, setTallyGoal] = useState(task.tally_count > 0 ? task.tally_count + 10 : 10);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [timerTime, setTimerTime] = useState(0);

  // Time Away calculation
  const [timeAway, setTimeAway] = useState(0);
  useEffect(() => {
    const calculateTimeAway = () => {
      const lastActive = new Date(task.last_active_at || task.updated_at);
      const now = new Date();
      const diffMs = now.getTime() - lastActive.getTime();
      setTimeAway(Math.floor(diffMs / 60000));
    };
    calculateTimeAway();
    const interval = setInterval(calculateTimeAway, 60000);
    return () => clearInterval(interval);
  }, [task.last_active_at, task.updated_at]);

  const getTimeAwayStatus = () => {
    if (timeAway < 5) return { color: "text-green-400", bg: "bg-green-500/20", icon: "🟢", label: "Active" };
    if (timeAway < 30) return { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "🟡", label: "Idle" };
    if (timeAway < 60) return { color: "text-orange-400", bg: "bg-orange-500/20", icon: "🟠", label: "Away" };
    return { color: "text-red-400", bg: "bg-red-500/20", icon: "🔴", label: "Forgotten" };
  };

  const timeAwayStatus = getTimeAwayStatus();

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsPomodoroRunning(false);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  const formatTime = formatTimeProgressive;

  const tallyProgress = Math.min(100, (task.tally_count / tallyGoal) * 100);

  return (
    <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">📊 Tracking Dashboard</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xs text-text-muted mb-1">Tally</p>
            <p className="text-2xl font-bold text-accent-primary">{task.tally_count}</p>
            <p className="text-xs text-text-muted">/ {tallyGoal} goal</p>
          </div>
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xs text-text-muted mb-1">Pomodoro</p>
            <p className="text-2xl font-bold text-yellow-400">{task.pomodoro_count}</p>
            <p className="text-xs text-text-muted">sessions</p>
          </div>
          <div className="p-3 bg-dark-tertiary rounded-xl text-center">
            <p className="text-xs text-muted mb-1">Timer</p>
            <p className="text-2xl font-bold text-blue-400">{Math.floor(task.total_time_seconds / 60)}m</p>
            <p className="text-xs text-text-muted">total</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${timeAwayStatus.bg}`}>
            <p className="text-xs text-text-muted mb-1">Time Away</p>
            <p className={`text-2xl font-bold ${timeAwayStatus.color}`}>{timeAway}m</p>
            <p className="text-xs text-text-muted">{timeAwayStatus.label}</p>
          </div>
        </div>

        {/* Tally Counter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">🔢 Tally Counter</span>
            <Button variant="ghost" size="sm" onClick={() => setShowTallyModal(true)}>
              Set Goal
            </Button>
          </div>
          <ProgressBar value={tallyProgress} color="primary" showLabel={false} />
          <div className="flex justify-center gap-2 mt-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onUpdateTally(-1)} className="p-2 bg-dark-tertiary rounded-lg">
              <Minus className="w-4 h-4 text-text-primary" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onUpdateTally(1)} className="p-2 bg-accent-primary rounded-lg">
              <Plus className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onUpdateTally(5)} className="p-2 bg-dark-tertiary rounded-lg">
              <span className="text-sm text-text-primary">+5</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onUpdateTally(10)} className="p-2 bg-dark-tertiary rounded-lg">
              <span className="text-sm text-text-primary">+10</span>
            </motion.button>
          </div>
        </div>

        {/* Pomodoro Tracker */}
        <div className="mb-4 p-4 bg-dark-tertiary rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">🍅 Pomodoro Tracker</span>
            <Badge variant="warning">{task.pomodoro_count}/5</Badge>
          </div>
          <div className="text-center mb-3">
            <p className="text-4xl font-bold text-text-primary">{formatTime(pomodoroTime)}</p>
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= task.pomodoro_count ? "bg-yellow-400" : "bg-dark-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                if (isPomodoroRunning) {
                  setIsPomodoroRunning(false);
                  onStopPomodoro();
                } else {
                  setIsPomodoroRunning(true);
                  onStartPomodoro();
                }
              }}
            >
              {isPomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPomodoroRunning ? "Pause" : "Start 25m"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsPomodoroRunning(false); setPomodoroTime(25 * 60); }}>
              Skip
            </Button>
          </div>
        </div>

        {/* Timer Tracker */}
        <div className="mb-4 p-4 bg-dark-tertiary rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">⏱️ Timer Tracker</span>
            <Button variant="ghost" size="sm" onClick={() => setShowManualTimeModal(true)}>
              + Manual
            </Button>
          </div>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-blue-400">
              {formatTime(Math.floor(task.total_time_seconds % 3600))}
            </p>
            <p className="text-xs text-text-muted">Session Time</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                if (isTimerRunning) {
                  setIsTimerRunning(false);
                  onStopTimer();
                } else {
                  setIsTimerRunning(true);
                  onStartTimer();
                }
              }}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isTimerRunning ? "Pause" : "Start"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsTimerRunning(false); onStopTimer(); }}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Time Away Status */}
        <div className={`mb-4 p-4 rounded-xl ${timeAwayStatus.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{timeAwayStatus.icon}</span>
              <span className="text-sm font-medium text-text-primary">🕐 Time Away Tracking</span>
            </div>
            {timeAway > 30 && (
              <Button size="sm" onClick={() => onUpdateTally(0)}>
                I&apos;m Back!
              </Button>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Last active: {timeAway} minutes ago • {timeAwayStatus.label}
          </p>
        </div>

        {/* Reminders */}
        <div className="p-4 bg-dark-tertiary rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">🔔 Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={task.reminder_enabled}
                onChange={(e) => onUpdateReminder(e.target.checked, task.reminder_interval_minutes)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
            </label>
          </div>
          {task.reminder_enabled && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">
                Interval: Every {task.reminder_interval_minutes} minutes
              </p>
              <p className="text-xs text-text-muted">
                Next reminder: {task.next_reminder_at
                  ? new Date(task.next_reminder_at).toLocaleTimeString()
                  : "Not set"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Tally Goal Modal */}
      <Modal isOpen={showTallyModal} onClose={() => setShowTallyModal(false)} title="Set Tally Goal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Goal</label>
            <input
              type="number"
              value={tallyGoal}
              onChange={(e) => setTallyGoal(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
            />
          </div>
          <Button onClick={() => { onUpdateGoal(tallyGoal); setShowTallyModal(false); }} className="w-full">
            Save
          </Button>
        </div>
      </Modal>

      {/* Manual Time Modal */}
      <Modal isOpen={showManualTimeModal} onClose={() => setShowManualTimeModal(false)} title="Add Manual Time">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Minutes</label>
            <input
              type="number"
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary"
            />
          </div>
          <div className="flex gap-2">
            {[5, 15, 30, 60].map((mins) => (
              <Button
                key={mins}
                variant="ghost"
                size="sm"
                onClick={() => setManualTime(mins.toString())}
                className="flex-1"
              >
                {mins}m
              </Button>
            ))}
          </div>
          <Button
            onClick={() => {
              onAddManualTime(parseInt(manualTime) || 15);
              setShowManualTimeModal(false);
            }}
            className="w-full"
          >
            Add {manualTime} minutes
          </Button>
        </div>
      </Modal>
    </>
  );
}
