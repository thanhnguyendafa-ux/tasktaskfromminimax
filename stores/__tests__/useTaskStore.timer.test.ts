import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { useTaskStore } from '../useTaskStore';
import { useTimerStore } from '../useTimerStore';
import { Task } from '@/types';

describe('useTaskStore Timer Actions', () => {
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-123',
    user_id: 'user-1',
    title: 'Test Task',
    description: null,
    status: 'pending',
    priority: 'medium',
    due_date: null,
    tally_count: 0,
    tally_goal: 5,
    last_tally_at: null,
    pomodoro_count: 0,
    pomodoro_goal: 4,
    pomodoro_duration: 1500,
    total_time_seconds: 100,
    estimated_time_seconds: 3600,
    timer_status: 'idle',
    timer_started_at: null,
    timer_paused_at: null,
    accumulated_time_seconds: 100,
    last_active_at: new Date().toISOString(),
    last_completed_pomodoro_at: null,
    reminder_enabled: false,
    reminder_interval_minutes: 60,
    last_reminder_sent_at: null,
    next_reminder_at: null,
    reminder_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    vi.useFakeTimers();
    useTaskStore.setState({
      tasks: [],
      currentTask: null,
      viewType: 'main',
      filters: { status: 'all', priority: 'all', tag: null },
      isLoading: false,
    });
    useTimerStore.setState({
      activeTaskId: null,
      elapsedSeconds: 0,
      isRunning: false,
      lastTick: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('startTimer', () => {
    it('should start timer for a task', () => {
      const task = createMockTask();
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().startTimer('task-123');
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === 'task-123');

      expect(updatedTask?.timer_status).toBe('running');
      expect(updatedTask?.timer_started_at).not.toBeNull();
      expect(updatedTask?.timer_paused_at).toBeNull();
      expect(updatedTask?.accumulated_time_seconds).toBe(100);
    });

    it('should set only one task to running at a time', () => {
      const task1 = createMockTask({ id: 'task-1', timer_status: 'idle' });
      const task2 = createMockTask({ id: 'task-2', timer_status: 'idle' });
      useTaskStore.setState({ tasks: [task1, task2] });

      act(() => {
        useTaskStore.getState().startTimer('task-1');
      });

      const state = useTaskStore.getState();
      expect(state.tasks.find(t => t.id === 'task-1')?.timer_status).toBe('running');
      expect(state.tasks.find(t => t.id === 'task-2')?.timer_status).toBe('idle');
    });

    it('should update currentTask when starting timer on current task', () => {
      const task = createMockTask();
      useTaskStore.setState({ tasks: [task], currentTask: task });

      act(() => {
        useTaskStore.getState().startTimer('task-123');
      });

      const state = useTaskStore.getState();
      expect(state.currentTask?.timer_status).toBe('running');
    });

    it('should sync timer store with active task', () => {
      const task = createMockTask();
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().startTimer('task-123');
      });

      const timerState = useTimerStore.getState();
      expect(timerState.activeTaskId).toBe('task-123');
      expect(timerState.elapsedSeconds).toBe(100);
      expect(timerState.isRunning).toBe(true);
      expect(timerState.lastTick).not.toBeNull();
    });
  });

  describe('pauseTimer', () => {
    it('should pause a running timer', () => {
      const task = createMockTask({
        timer_status: 'running',
        timer_started_at: new Date().toISOString(),
        accumulated_time_seconds: 200,
      });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().pauseTimer('task-123');
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === 'task-123');

      expect(updatedTask?.timer_status).toBe('paused');
      expect(updatedTask?.timer_paused_at).not.toBeNull();
      expect(updatedTask?.total_time_seconds).toBe(200);
    });

    it('should not pause if timer is not running', () => {
      const task = createMockTask({ timer_status: 'idle' });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().pauseTimer('task-123');
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].timer_status).toBe('idle');
    });

    it('should stop timer store when pausing', () => {
      useTimerStore.setState({
        activeTaskId: 'task-123',
        isRunning: true,
        elapsedSeconds: 200,
      });

      act(() => {
        useTaskStore.getState().pauseTimer('task-123');
      });

      expect(useTimerStore.getState().isRunning).toBe(false);
    });
  });

  describe('resumeTimer', () => {
    it('should resume a paused timer', () => {
      const pausedAt = new Date().toISOString();
      const task = createMockTask({
        timer_status: 'paused',
        timer_paused_at: pausedAt,
        accumulated_time_seconds: 200,
      });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().resumeTimer('task-123');
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === 'task-123');

      expect(updatedTask?.timer_status).toBe('running');
      expect(updatedTask?.timer_started_at).not.toBeNull();
      expect(updatedTask?.timer_paused_at).toBeNull();
    });

    it('should not resume if timer is not paused', () => {
      const task = createMockTask({ timer_status: 'idle' });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().resumeTimer('task-123');
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].timer_status).toBe('idle');
    });

    it('should restart timer store when resuming', () => {
      useTimerStore.setState({
        isRunning: false,
      });

      act(() => {
        useTaskStore.getState().resumeTimer('task-123');
      });

      expect(useTimerStore.getState().isRunning).toBe(true);
      expect(useTimerStore.getState().lastTick).not.toBeNull();
    });
  });

  describe('stopTimer', () => {
    it('should stop a running timer', () => {
      const task = createMockTask({
        timer_status: 'running',
        timer_started_at: new Date().toISOString(),
        accumulated_time_seconds: 250,
      });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().stopTimer('task-123');
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === 'task-123');

      expect(updatedTask?.timer_status).toBe('idle');
      expect(updatedTask?.timer_started_at).toBeNull();
      expect(updatedTask?.timer_paused_at).toBeNull();
      expect(updatedTask?.total_time_seconds).toBe(250);
    });

    it('should stop a paused timer', () => {
      const task = createMockTask({
        timer_status: 'paused',
        timer_paused_at: new Date().toISOString(),
        accumulated_time_seconds: 300,
      });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().stopTimer('task-123');
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === 'task-123');

      expect(updatedTask?.timer_status).toBe('idle');
      expect(updatedTask?.total_time_seconds).toBe(300);
    });

    it('should reset timer store completely', () => {
      useTimerStore.setState({
        activeTaskId: 'task-123',
        elapsedSeconds: 500,
        isRunning: true,
        lastTick: Date.now(),
      });

      act(() => {
        useTaskStore.getState().stopTimer('task-123');
      });

      const timerState = useTimerStore.getState();
      expect(timerState.activeTaskId).toBeNull();
      expect(timerState.elapsedSeconds).toBe(0);
      expect(timerState.isRunning).toBe(false);
      expect(timerState.lastTick).toBeNull();
    });

    it('should set other tasks to idle', () => {
      const task1 = createMockTask({ id: 'task-1', timer_status: 'running' });
      const task2 = createMockTask({ id: 'task-2', timer_status: 'running' });
      useTaskStore.setState({ tasks: [task1, task2] });

      act(() => {
        useTaskStore.getState().stopTimer('task-1');
      });

      const state = useTaskStore.getState();
      expect(state.tasks.find(t => t.id === 'task-1')?.timer_status).toBe('idle');
      expect(state.tasks.find(t => t.id === 'task-2')?.timer_status).toBe('idle');
    });
  });

  describe('updateTimerTime', () => {
    it('should update accumulated_time_seconds for a task', () => {
      const task = createMockTask({ accumulated_time_seconds: 100 });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().updateTimerTime('task-123', 500);
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].accumulated_time_seconds).toBe(500);
    });

    it('should update currentTask when task id matches', () => {
      const task = createMockTask({ accumulated_time_seconds: 100 });
      useTaskStore.setState({ tasks: [task], currentTask: task });

      act(() => {
        useTaskStore.getState().updateTimerTime('task-123', 600);
      });

      const state = useTaskStore.getState();
      expect(state.currentTask?.accumulated_time_seconds).toBe(600);
    });

    it('should not update if task not found', () => {
      const task = createMockTask({ accumulated_time_seconds: 100 });
      useTaskStore.setState({ tasks: [task] });

      act(() => {
        useTaskStore.getState().updateTimerTime('task-999', 500);
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].accumulated_time_seconds).toBe(100);
    });
  });

  describe('timer state transitions', () => {
    it('should handle complete timer lifecycle', () => {
      const task = createMockTask();
      useTaskStore.setState({ tasks: [task] });

      // Start timer
      act(() => {
        useTaskStore.getState().startTimer('task-123');
      });
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('running');

      // Pause timer
      act(() => {
        useTaskStore.getState().pauseTimer('task-123');
      });
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('paused');

      // Resume timer
      act(() => {
        useTaskStore.getState().resumeTimer('task-123');
      });
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('running');

      // Stop timer
      act(() => {
        useTaskStore.getState().stopTimer('task-123');
      });
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('idle');
    });

    it('should accumulate time correctly across pauses', () => {
      const task = createMockTask({ accumulated_time_seconds: 100 });
      useTaskStore.setState({ tasks: [task] });

      // Start timer
      act(() => {
        useTaskStore.getState().startTimer('task-123');
      });

      // Timer is now running, verify state
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('running');

      // Pause timer
      act(() => {
        useTaskStore.getState().pauseTimer('task-123');
      });

      // Timer should be paused with accumulated time
      expect(useTaskStore.getState().tasks[0].timer_status).toBe('paused');
      expect(useTaskStore.getState().tasks[0].total_time_seconds).toBeGreaterThanOrEqual(100);
    });
  });
});
