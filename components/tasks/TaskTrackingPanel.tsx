"use client";

import React from "react";
import { motion } from "framer-motion";
import { TallyCounter } from "./TallyCounter";
import { PomodoroTracker } from "./PomodoroTracker";
import { TimerTracker } from "./TimerTracker";
import { TimeAwayDisplay } from "./TimeAwayDisplay";
import { ReminderSettings } from "./ReminderSettings";
import { Card } from "@/components/ui/Card";
import { Task } from "@/types";

interface TaskTrackingPanelProps {
  task: Task;
  onUpdateTally: (increment: number) => void;
  onDecrementTally: (decrement: number) => void;
  onSetTallyGoal: (goal: number) => void;
  onStartPomodoro: () => void;
  onPausePomodoro: () => void;
  onSkipPomodoro: () => void;
  onCompletePomodoro: () => void;
  onSetPomodoroGoal: (goal: number) => void;
  onSetPomodoroDuration: (duration: number) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onStopTimer: () => void;
  onAddManualTime: (minutes: number) => void;
  onResetTimeAway: () => void;
  onSnoozeReminder: (minutes: number) => void;
  onToggleReminders: (enabled: boolean) => void;
  onSetReminderInterval: (minutes: number) => void;
  onDismissReminder: () => void;
}

export function TaskTrackingPanel({
  task,
  onUpdateTally,
  onDecrementTally,
  onSetTallyGoal,
  onStartPomodoro,
  onPausePomodoro,
  onSkipPomodoro,
  onCompletePomodoro,
  onSetPomodoroGoal,
  onSetPomodoroDuration,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
  onAddManualTime,
  onResetTimeAway,
  onSnoozeReminder,
  onToggleReminders,
  onSetReminderInterval,
  onDismissReminder,
}: TaskTrackingPanelProps) {
  return (
    <div className="space-y-4">
      {/* Task Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">{task.title}</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              task.priority === "high"
                ? "bg-accent-danger/20 text-accent-danger"
                : task.priority === "medium"
                ? "bg-accent-warning/20 text-accent-warning"
                : "bg-accent-success/20 text-accent-success"
            }`}
          >
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-text-muted mt-2">{task.description}</p>
        )}
      </Card>

      {/* Tracking Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4">
        <TallyCounter
          count={task.tally_count}
          goal={task.tally_goal}
          onIncrement={onUpdateTally}
          onDecrement={onDecrementTally}
          onSetGoal={onSetTallyGoal}
          onCustomIncrement={onUpdateTally}
        />
        <PomodoroTracker
          count={task.pomodoro_count}
          goal={task.pomodoro_goal}
          duration={task.pomodoro_duration}
          onStart={onStartPomodoro}
          onPause={onPausePomodoro}
          onSkip={onSkipPomodoro}
          onComplete={onCompletePomodoro}
          onSetGoal={onSetPomodoroGoal}
          onSetDuration={onSetPomodoroDuration}
        />
      </div>

      {/* Timer and Time Away */}
      <TimerTracker
        totalSeconds={task.total_time_seconds}
        estimatedSeconds={task.estimated_time_seconds || 0}
        onStart={onStartTimer}
        onPause={onPauseTimer}
        onStop={onStopTimer}
        onAddManualTime={onAddManualTime}
      />

      <TimeAwayDisplay
        lastActiveAt={task.last_active_at}
        onReset={onResetTimeAway}
        onSnooze={onSnoozeReminder}
      />

      <ReminderSettings
        enabled={task.reminder_enabled}
        intervalMinutes={task.reminder_interval_minutes}
        nextReminderAt={task.next_reminder_at}
        reminderCount={task.reminder_count}
        onToggle={onToggleReminders}
        onSetInterval={onSetReminderInterval}
        onSnooze={onSnoozeReminder}
        onDismiss={onDismissReminder}
      />
    </div>
  );
}
