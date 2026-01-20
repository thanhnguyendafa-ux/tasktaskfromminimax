import { create } from 'zustand';
import { Task } from '@/types';

interface TimerState {
  activeTaskId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  lastTick: number | null;
  
  startTimer: (task: Task) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  syncElapsed: (task: Task) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  elapsedSeconds: 0,
  isRunning: false,
  lastTick: null,

  startTimer: (task: Task) => {
    set({
      activeTaskId: task.id,
      elapsedSeconds: task.total_time_seconds,
      isRunning: true,
      lastTick: Date.now(),
    });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resumeTimer: () => {
    set({ isRunning: true, lastTick: Date.now() });
  },

  stopTimer: () => {
    set({
      activeTaskId: null,
      elapsedSeconds: 0,
      isRunning: false,
      lastTick: null,
    });
  },

  tick: () => {
    const { isRunning, lastTick } = get();
    if (isRunning && lastTick) {
      const now = Date.now();
      const delta = (now - lastTick) / 1000;
      set({
        elapsedSeconds: get().elapsedSeconds + delta,
        lastTick: now,
      });
    }
  },

  syncElapsed: (task: Task) => {
    const { activeTaskId, isRunning } = get();
    if (activeTaskId === task.id && isRunning) {
      const elapsed = task.timer_started_at
        ? task.total_time_seconds + (Date.now() - new Date(task.timer_started_at).getTime()) / 1000
        : task.total_time_seconds;
      set({ elapsedSeconds: elapsed });
    }
  },
}));
