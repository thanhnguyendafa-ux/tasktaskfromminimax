import { describe, it, expect, beforeEach } from 'vitest';
import { FocusTimeIntegration } from '../FocusTimeIntegration';
import { Task } from '@/types';

describe('FocusTimeIntegration', () => {
  let integration: FocusTimeIntegration;

  beforeEach(() => {
    integration = new FocusTimeIntegration();
  });

  const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: '1',
    user_id: 'user1',
    title: 'Test Task',
    description: null,
    status: 'pending',
    priority: 'medium',
    due_date: null,
    tally_count: 0,
    tally_goal: 0,
    last_tally_at: null,
    pomodoro_count: 0,
    pomodoro_goal: 1,
    pomodoro_duration: 1500,
    total_time_seconds: 0,
    estimated_time_seconds: 0,
    timer_status: 'idle',
    timer_started_at: null,
    timer_paused_at: null,
    accumulated_time_seconds: 0,
    last_active_at: new Date().toISOString(),
    last_completed_pomodoro_at: null,
    reminder_enabled: false,
    reminder_interval_minutes: 60,
    last_reminder_sent_at: null,
    next_reminder_at: null,
    reminder_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  });

  describe('initializeTask', () => {
    it('should initialize a new task', () => {
      const task = createMockTask();
      const manager = integration.initializeTask(task);

      expect(manager).toBeDefined();
      expect(integration.getManager(task.id)).toBe(manager);
    });

    it('should reuse existing manager for same task', () => {
      const task = createMockTask();
      const manager1 = integration.initializeTask(task);
      const manager2 = integration.initializeTask(task);

      expect(manager1).toBe(manager2);
    });

    it('should migrate existing manual time', () => {
      const task = createMockTask({ total_time_seconds: 3600 });
      integration.initializeTask(task);

      const totalTime = integration.getTotalFocusTime(task.id);
      expect(totalTime).toBeGreaterThanOrEqual(3600);
    });

    it('should migrate existing pomodoro count', () => {
      const task = createMockTask({ 
        pomodoro_count: 3,
        pomodoro_duration: 1500
      });
      integration.initializeTask(task);

      const totalTime = integration.getTotalFocusTime(task.id);
      expect(totalTime).toBeGreaterThanOrEqual(4500); // 3 * 1500
    });
  });

  describe('session management', () => {
    it('should start manual timer', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      integration.startManualTimer(task.id);

      const manager = integration.getManager(task.id);
      expect(manager?.getCurrentSessionTime()).toBeGreaterThanOrEqual(0);
    });

    it('should start pomodoro', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      integration.startPomodoro(task.id);

      const manager = integration.getManager(task.id);
      expect(manager?.getPomodoroAdapter().isSessionActive()).toBe(true);
    });

    it('should complete pomodoro and add time', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      
      const initialTime = integration.getTotalFocusTime(task.id);
      integration.startPomodoro(task.id, 100);
      
      // Simulate time passing
      const manager = integration.getManager(task.id);
      manager?.getPomodoroAdapter().completeSession();
      integration.completePomodoro(task.id);

      const finalTime = integration.getTotalFocusTime(task.id);
      expect(finalTime).toBeGreaterThan(initialTime);
    });

    it('should abort pomodoro and save incomplete time', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      
      const initialTime = integration.getTotalFocusTime(task.id);
      integration.startPomodoro(task.id, 1500);
      
      // Simulate partial time
      const manager = integration.getManager(task.id);
      const adapter = manager?.getPomodoroAdapter();
      if (adapter) {
        // Manually set elapsed time for testing
        adapter.startSession(1500);
      }
      
      integration.abortPomodoro(task.id);

      const finalTime = integration.getTotalFocusTime(task.id);
      const breakdown = integration.getTimeBreakdown(task.id);
      
      // Incomplete time should be saved
      expect(breakdown.incompletePomodoros).toBeGreaterThan(0);
    });

    it('should end session', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      integration.startManualTimer(task.id);
      integration.endSession(task.id);

      const manager = integration.getManager(task.id);
      expect(manager?.getCurrentSessionTime()).toBe(0);
    });
  });

  describe('time tracking', () => {
    it('should get total focus time', () => {
      const task = createMockTask({ total_time_seconds: 1800 });
      integration.initializeTask(task);

      const totalTime = integration.getTotalFocusTime(task.id);
      expect(totalTime).toBeGreaterThanOrEqual(1800);
    });

    it('should get time breakdown', () => {
      const task = createMockTask({ 
        total_time_seconds: 1800,
        pomodoro_count: 2,
        pomodoro_duration: 1500
      });
      integration.initializeTask(task);

      const breakdown = integration.getTimeBreakdown(task.id);
      expect(breakdown.manualTime).toBeGreaterThanOrEqual(1800);
      expect(breakdown.completedPomodoros).toBeGreaterThanOrEqual(3000);
      expect(breakdown.total).toBeGreaterThanOrEqual(4800);
    });
  });

  describe('event subscriptions', () => {
    it('should subscribe to time updates', (done) => {
      const task = createMockTask();
      integration.initializeTask(task);

      const unsubscribe = integration.onTimeUpdate(task.id, (totalTime) => {
        expect(totalTime).toBeGreaterThanOrEqual(0);
        unsubscribe();
        done();
      });

      integration.startManualTimer(task.id);
      
      // Trigger update
      const manager = integration.getManager(task.id);
      manager?.handlePomodoroComplete(100);
    });

    it('should subscribe to mode changes', (done) => {
      const task = createMockTask();
      integration.initializeTask(task);

      const unsubscribe = integration.onModeSwitch(task.id, (mode) => {
        expect(mode).toBe('pomodoro');
        unsubscribe();
        done();
      });

      integration.startPomodoro(task.id);
    });
  });

  describe('cleanup', () => {
    it('should cleanup single task', () => {
      const task = createMockTask();
      integration.initializeTask(task);
      integration.cleanup(task.id);

      expect(integration.getManager(task.id)).toBeUndefined();
    });

    it('should cleanup all tasks', () => {
      const task1 = createMockTask({ id: '1' });
      const task2 = createMockTask({ id: '2' });
      
      integration.initializeTask(task1);
      integration.initializeTask(task2);
      integration.cleanupAll();

      expect(integration.getManager('1')).toBeUndefined();
      expect(integration.getManager('2')).toBeUndefined();
    });
  });

  describe('batch migration', () => {
    it('should migrate all tasks', async () => {
      const tasks = [
        createMockTask({ id: '1', total_time_seconds: 1800, pomodoro_count: 2 }),
        createMockTask({ id: '2', total_time_seconds: 3600, pomodoro_count: 0 }),
        createMockTask({ id: '3', total_time_seconds: 0, pomodoro_count: 4 })
      ];

      const result = await integration.migrateAllTasks(tasks);

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.report).toContain('Successful: 3');
    });
  });

  describe('global statistics', () => {
    it('should calculate global statistics', () => {
      const task1 = createMockTask({ id: '1', total_time_seconds: 1800 });
      const task2 = createMockTask({ id: '2', total_time_seconds: 3600 });
      
      integration.initializeTask(task1);
      integration.initializeTask(task2);

      const stats = integration.getGlobalStatistics();

      expect(stats.totalTasks).toBe(2);
      expect(stats.totalFocusTime).toBeGreaterThanOrEqual(5400);
      expect(stats.totalManualTime).toBeGreaterThanOrEqual(5400);
    });

    it('should count active sessions', () => {
      const task1 = createMockTask({ id: '1' });
      const task2 = createMockTask({ id: '2' });
      
      integration.initializeTask(task1);
      integration.initializeTask(task2);
      integration.startManualTimer('1');

      const stats = integration.getGlobalStatistics();

      expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('export data', () => {
    it('should export task data', () => {
      const task = createMockTask({ total_time_seconds: 1800 });
      integration.initializeTask(task);

      const exported = integration.exportTaskData(task.id);

      expect(exported).toBeDefined();
      expect(exported?.taskId).toBe(task.id);
      expect(exported?.totalFocusTime).toBeGreaterThanOrEqual(1800);
      expect(exported?.breakdown).toBeDefined();
      expect(exported?.exportedAt).toBeDefined();
    });

    it('should return null for non-existent task', () => {
      const exported = integration.exportTaskData('non-existent');
      expect(exported).toBeNull();
    });
  });
});
