import { create } from 'zustand';
import { Task, ViewType, TaskFilters } from '@/types';
import { useTimerStore } from './useTimerStore';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  viewType: ViewType;
  filters: TaskFilters;
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task> & { time_away_seconds?: number }) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setViewType: (type: ViewType) => void;
  setFilters: (filters: TaskFilters) => void;
  setLoading: (loading: boolean) => void;
  
  // Timer actions
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  stopTimer: (id: string) => void;
  updateTimerTime: (id: string, seconds: number) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  viewType: 'main',
  filters: { status: 'all', priority: 'all', tag: null },
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
    currentTask: state.currentTask?.id === id ? { ...state.currentTask, ...updates } : state.currentTask,
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    currentTask: state.currentTask?.id === id ? null : state.currentTask,
  })),
  setCurrentTask: (task) => set({ currentTask: task }),
  setViewType: (type) => set({ viewType: type }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Timer actions
  startTimer: (id) => set((state) => {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      useTimerStore.getState().startTimer(task);
    }
    return {
      tasks: state.tasks.map((t) => 
        t.id === id 
          ? { 
              ...t, 
              timer_status: 'running', 
              timer_started_at: new Date().toISOString(),
              timer_paused_at: null,
              accumulated_time_seconds: t.total_time_seconds,
            }
          : { ...t, timer_status: 'idle' }
      ),
      currentTask: state.currentTask?.id === id 
        ? { 
            ...state.currentTask, 
            timer_status: 'running', 
            timer_started_at: new Date().toISOString(),
            timer_paused_at: null,
            accumulated_time_seconds: state.currentTask.total_time_seconds,
          }
        : state.currentTask,
    };
  }),
  
  pauseTimer: (id) => set((state) => {
    useTimerStore.getState().pauseTimer();
    return {
      tasks: state.tasks.map((t) => 
        t.id === id && t.timer_status === 'running'
          ? { 
              ...t, 
              timer_status: 'paused', 
              timer_paused_at: new Date().toISOString(),
              total_time_seconds: t.accumulated_time_seconds,
            }
          : t
      ),
      currentTask: state.currentTask?.id === id && state.currentTask.timer_status === 'running'
        ? { 
            ...state.currentTask, 
            timer_status: 'paused', 
            timer_paused_at: new Date().toISOString(),
            total_time_seconds: state.currentTask.accumulated_time_seconds,
          }
        : state.currentTask,
    };
  }),
  
  resumeTimer: (id) => set((state) => {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      useTimerStore.getState().resumeTimer();
    }
    return {
      tasks: state.tasks.map((t) => 
        t.id === id && t.timer_status === 'paused'
          ? { 
              ...t, 
              timer_status: 'running', 
              timer_started_at: new Date().toISOString(),
              timer_paused_at: null,
              accumulated_time_seconds: t.total_time_seconds,
            }
          : t
      ),
      currentTask: state.currentTask?.id === id && state.currentTask.timer_status === 'paused'
        ? { 
            ...state.currentTask, 
            timer_status: 'running', 
            timer_started_at: new Date().toISOString(),
            timer_paused_at: null,
            accumulated_time_seconds: state.currentTask.total_time_seconds,
          }
        : state.currentTask,
    };
  }),
  
  stopTimer: (id) => set((state) => {
    useTimerStore.getState().stopTimer();
    return {
      tasks: state.tasks.map((t) => 
        t.id === id && (t.timer_status === 'running' || t.timer_status === 'paused')
          ? { 
              ...t, 
              timer_status: 'idle', 
              timer_started_at: null,
              timer_paused_at: null,
              total_time_seconds: t.accumulated_time_seconds,
            }
          : { ...t, timer_status: 'idle' }
      ),
      currentTask: state.currentTask?.id === id
        ? { 
            ...state.currentTask, 
            timer_status: 'idle', 
            timer_started_at: null,
            timer_paused_at: null,
            total_time_seconds: state.currentTask.accumulated_time_seconds,
          }
        : state.currentTask,
    };
  }),
  
  updateTimerTime: (id, seconds) => set((state) => ({
    tasks: state.tasks.map((t) => 
      t.id === id 
        ? { ...t, accumulated_time_seconds: seconds }
        : t
    ),
    currentTask: state.currentTask?.id === id
      ? { ...state.currentTask, accumulated_time_seconds: seconds }
      : state.currentTask,
  })),
}));
