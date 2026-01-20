import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerStore } from '../useTimerStore';
import { Task } from '@/types';

describe('useTimerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useTimerStore.getState();
      expect(state.activeTaskId).toBeNull();
      expect(state.elapsedSeconds).toBe(0);
      expect(state.isRunning).toBe(false);
      expect(state.lastTick).toBeNull();
    });
  });

  describe('setActiveTask', () => {
    it('should set active task id', () => {
      const { setActiveTask } = useTimerStore.getState();
      act(() => {
        setActiveTask('task-123');
      });
      expect(useTimerStore.getState().activeTaskId).toBe('task-123');
    });

    it('should clear active task id when null is passed', () => {
      useTimerStore.setState({ activeTaskId: 'task-123' });
      const { setActiveTask } = useTimerStore.getState();
      act(() => {
        setActiveTask(null);
      });
      expect(useTimerStore.getState().activeTaskId).toBeNull();
    });
  });

  describe('setElapsed', () => {
    it('should set elapsed seconds', () => {
      const { setElapsed } = useTimerStore.getState();
      act(() => {
        setElapsed(120);
      });
      expect(useTimerStore.getState().elapsedSeconds).toBe(120);
    });

    it('should handle large elapsed values', () => {
      const { setElapsed } = useTimerStore.getState();
      act(() => {
        setElapsed(3600 * 10); // 10 hours
      });
      expect(useTimerStore.getState().elapsedSeconds).toBe(36000);
    });
  });

  describe('setRunning', () => {
    it('should set isRunning to true', () => {
      const { setRunning } = useTimerStore.getState();
      act(() => {
        setRunning(true);
      });
      expect(useTimerStore.getState().isRunning).toBe(true);
    });

    it('should set isRunning to false', () => {
      useTimerStore.setState({ isRunning: true });
      const { setRunning } = useTimerStore.getState();
      act(() => {
        setRunning(false);
      });
      expect(useTimerStore.getState().isRunning).toBe(false);
    });
  });

  describe('setLastTick', () => {
    it('should set lastTick timestamp', () => {
      const timestamp = Date.now();
      const { setLastTick } = useTimerStore.getState();
      act(() => {
        setLastTick(timestamp);
      });
      expect(useTimerStore.getState().lastTick).toBe(timestamp);
    });

    it('should allow null lastTick', () => {
      useTimerStore.setState({ lastTick: Date.now() });
      const { setLastTick } = useTimerStore.getState();
      act(() => {
        setLastTick(null);
      });
      expect(useTimerStore.getState().lastTick).toBeNull();
    });
  });

  describe('tick', () => {
    it('should not update when timer is not running', () => {
      useTimerStore.setState({
        isRunning: false,
        lastTick: Date.now(),
        elapsedSeconds: 100,
      });
      const { tick } = useTimerStore.getState();
      act(() => {
        tick();
      });
      expect(useTimerStore.getState().elapsedSeconds).toBe(100);
    });

    it('should not update when lastTick is null', () => {
      useTimerStore.setState({
        isRunning: true,
        lastTick: null,
        elapsedSeconds: 100,
      });
      const { tick } = useTimerStore.getState();
      act(() => {
        tick();
      });
      expect(useTimerStore.getState().elapsedSeconds).toBe(100);
    });

    it('should update elapsedSeconds when running with lastTick', () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      useTimerStore.setState({
        isRunning: true,
        lastTick: startTime,
        elapsedSeconds: 100,
      });
      const { tick } = useTimerStore.getState();
      act(() => {
        tick();
      });
      expect(useTimerStore.getState().elapsedSeconds).toBeGreaterThan(100);
      expect(useTimerStore.getState().lastTick).toBeGreaterThan(startTime);
    });
  });

  describe('syncElapsed', () => {
    it('should sync elapsed time from task timer_started_at', () => {
      const task: Task = {
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
        timer_status: 'running',
        timer_started_at: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
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
      };

      useTimerStore.setState({
        activeTaskId: 'task-123',
        isRunning: true,
        elapsedSeconds: 100,
      });

      const { syncElapsed } = useTimerStore.getState();
      act(() => {
        syncElapsed(task);
      });

      // Should be approximately 100 + 10 = 110 seconds
      expect(useTimerStore.getState().elapsedSeconds).toBeGreaterThanOrEqual(109);
    });

    it('should not sync when task id does not match activeTaskId', () => {
      const task: Task = {
        id: 'task-456',
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
        timer_status: 'running',
        timer_started_at: new Date(Date.now() - 10000).toISOString(),
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
      };

      useTimerStore.setState({
        activeTaskId: 'task-123',
        isRunning: true,
        elapsedSeconds: 100,
      });

      const { syncElapsed } = useTimerStore.getState();
      act(() => {
        syncElapsed(task);
      });

      expect(useTimerStore.getState().elapsedSeconds).toBe(100);
    });

    it('should not sync when timer is not running', () => {
      const task: Task = {
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
        timer_status: 'paused',
        timer_started_at: new Date(Date.now() - 10000).toISOString(),
        timer_paused_at: new Date().toISOString(),
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
      };

      useTimerStore.setState({
        activeTaskId: 'task-123',
        isRunning: false,
        elapsedSeconds: 100,
      });

      const { syncElapsed } = useTimerStore.getState();
      act(() => {
        syncElapsed(task);
      });

      expect(useTimerStore.getState().elapsedSeconds).toBe(100);
    });
  });
});
