import { create } from 'zustand';
import { Task } from '@/types';

// Timer state interface
interface TimerState {
  activeTaskId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  lastTick: number | null;
  
  // Actions
  setActiveTask: (taskId: string | null) => void;
  setElapsed: (seconds: number) => void;
  setRunning: (running: boolean) => void;
  setLastTick: (tick: number | null) => void;
  tick: () => void;
  syncElapsed: (task: Task) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  elapsedSeconds: 0,
  isRunning: false,
  lastTick: null,

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),
  setElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  setRunning: (running) => set({ isRunning: running }),
  setLastTick: (tick) => set({ lastTick: tick }),

  tick: () => {
    const { isRunning, lastTick, elapsedSeconds } = get();
    if (isRunning && lastTick) {
      const now = Date.now();
      const delta = (now - lastTick) / 1000;
      set({
        elapsedSeconds: elapsedSeconds + delta,
        lastTick: now,
      });
    }
  },

  syncElapsed: (task: Task) => {
    const { activeTaskId, isRunning } = get();
    if (activeTaskId === task.id && isRunning && task.timer_started_at) {
      const elapsed = task.total_time_seconds + (Date.now() - new Date(task.timer_started_at).getTime()) / 1000;
      set({ elapsedSeconds: elapsed });
    }
  },
}));
