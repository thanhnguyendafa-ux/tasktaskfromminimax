"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Task } from "@/types";

interface TimerControlsProps {
  task: Task;
}

export function TimerControls({ task }: TimerControlsProps) {
  const { startTimer, pauseTimer, resumeTimer, stopTimer } = useTaskStore();
  const { activeTaskId, isRunning } = useTimerStore();

  const isCurrentTask = activeTaskId === task.id;
  const canControl = isCurrentTask || task.timer_status === 'idle';

  const handleTimerAction = () => {
    if (!canControl && !isCurrentTask) return;

    switch (task.timer_status) {
      case 'idle':
        startTimer(task.id);
        break;
      case 'running':
        pauseTimer(task.id);
        break;
      case 'paused':
        resumeTimer(task.id);
        break;
    }
  };

  const handleStop = () => {
    if (isCurrentTask || task.timer_status !== 'idle') {
      stopTimer(task.id);
    }
  };

  const getButtonState = () => {
    if (!isCurrentTask) {
      return { icon: Play, label: 'Start', color: 'text-blue-500' };
    }
    if (isRunning) {
      return { icon: Pause, label: 'Pause', color: 'text-yellow-500' };
    }
    return { icon: Play, label: 'Resume', color: 'text-green-500' };
  };

  const { icon: Icon, label, color } = getButtonState();

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleTimerAction}
        disabled={!canControl}
        className={`p-2 rounded-lg bg-dark-tertiary hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
        title={label}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </motion.button>

      {(task.timer_status === 'running' || task.timer_status === 'paused' || isCurrentTask) && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleStop}
          className="p-2 rounded-lg bg-dark-tertiary hover:bg-opacity-80"
          title="Stop"
        >
          <Square className="w-5 h-5 text-red-500" />
        </motion.button>
      )}
    </div>
  );
}
