import { create } from 'zustand';
import { Task, ViewType, TaskFilters } from '@/types';

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
}));
