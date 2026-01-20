import { describe, it, expect } from 'vitest';
import { MigrationService } from '../MigrationService';

describe('MigrationService', () => {
  const migrationService = new MigrationService();

  describe('migrateTaskData', () => {
    it('should migrate task with manual time only', async () => {
      const taskData = {
        total_time_seconds: 3600,
        pomodoro_count: 0,
        pomodoro_duration: 1500
      };

      const record = await migrationService.migrateTaskData(taskData);

      expect(record.manualTrackingTime).toBe(3600);
      expect(record.completedPomodoroTime).toBe(0);
      expect(record.incompletePomodoroTime).toBe(0);
      expect(record.totalFocusTime).toBe(3600);
      expect(record.pomodoroCount).toBe(0);
    });

    it('should migrate task with pomodoros only', async () => {
      const taskData = {
        total_time_seconds: 0,
        pomodoro_count: 4,
        pomodoro_duration: 1500
      };

      const record = await migrationService.migrateTaskData(taskData);

      expect(record.manualTrackingTime).toBe(0);
      expect(record.completedPomodoroTime).toBe(6000); // 4 * 1500
      expect(record.incompletePomodoroTime).toBe(0);
      expect(record.totalFocusTime).toBe(6000);
      expect(record.pomodoroCount).toBe(4);
    });

    it('should migrate task with both manual and pomodoro time', async () => {
      const taskData = {
        total_time_seconds: 1800,
        pomodoro_count: 3,
        pomodoro_duration: 1500
      };

      const record = await migrationService.migrateTaskData(taskData);

      expect(record.manualTrackingTime).toBe(1800);
      expect(record.completedPomodoroTime).toBe(4500); // 3 * 1500
      expect(record.incompletePomodoroTime).toBe(0);
      expect(record.totalFocusTime).toBe(6300); // 1800 + 4500
      expect(record.pomodoroCount).toBe(3);
    });

    it('should set session count correctly', async () => {
      const taskData = {
        total_time_seconds: 1800,
        pomodoro_count: 3,
        pomodoro_duration: 1500
      };

      const record = await migrationService.migrateTaskData(taskData);

      expect(record.sessionCount).toBe(4); // 3 pomodoros + 1 manual session
    });
  });

  describe('createMigrationSummary', () => {
    it('should create accurate migration summary', () => {
      const summary = migrationService.createMigrationSummary(
        { totalSeconds: 3600 },
        { completedCount: 5, duration: 1500 }
      );

      expect(summary.existingTimeTracker.totalSeconds).toBe(3600);
      expect(summary.existingPomodoro.completedCount).toBe(5);
      expect(summary.calculatedTotalTime).toBe(11100); // 3600 + (5 * 1500)
      expect(summary.migrationTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('validateMigration', () => {
    it('should validate correct migration', () => {
      const original = {
        timeTracker: 3600,
        pomodoro: 4500
      };

      const migrated = {
        id: '1',
        date: new Date(),
        manualTrackingTime: 3600,
        completedPomodoroTime: 4500,
        incompletePomodoroTime: 0,
        totalFocusTime: 8100,
        pomodoroCount: 3,
        sessionCount: 4,
        lastUpdated: new Date()
      };

      const result = migrationService.validateMigration(original, migrated);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect manual time mismatch', () => {
      const original = {
        timeTracker: 3600,
        pomodoro: 4500
      };

      const migrated = {
        id: '1',
        date: new Date(),
        manualTrackingTime: 3000, // Wrong!
        completedPomodoroTime: 4500,
        incompletePomodoroTime: 0,
        totalFocusTime: 7500,
        pomodoroCount: 3,
        sessionCount: 4,
        lastUpdated: new Date()
      };

      const result = migrationService.validateMigration(original, migrated);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Manual tracking time mismatch');
    });

    it('should detect total calculation error', () => {
      const original = {
        timeTracker: 3600,
        pomodoro: 4500
      };

      const migrated = {
        id: '1',
        date: new Date(),
        manualTrackingTime: 3600,
        completedPomodoroTime: 4500,
        incompletePomodoroTime: 0,
        totalFocusTime: 9000, // Wrong!
        pomodoroCount: 3,
        sessionCount: 4,
        lastUpdated: new Date()
      };

      const result = migrationService.validateMigration(original, migrated);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total focus time calculation error');
    });
  });

  describe('batchMigrate', () => {
    it('should migrate multiple tasks successfully', async () => {
      const tasks = [
        { id: '1', total_time_seconds: 1800, pomodoro_count: 2, pomodoro_duration: 1500 },
        { id: '2', total_time_seconds: 3600, pomodoro_count: 0, pomodoro_duration: 1500 },
        { id: '3', total_time_seconds: 0, pomodoro_count: 4, pomodoro_duration: 1500 }
      ];

      const result = await migrationService.batchMigrate(tasks);

      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].totalFocusTime).toBe(4800); // 1800 + 3000
      expect(result.successful[1].totalFocusTime).toBe(3600);
      expect(result.successful[2].totalFocusTime).toBe(6000); // 4 * 1500
    });
  });

  describe('generateMigrationReport', () => {
    it('should generate formatted report', () => {
      const report = migrationService.generateMigrationReport(45, 5, 180000);

      expect(report).toContain('Successful: 45');
      expect(report).toContain('Failed: 5');
      expect(report).toContain('3000 minutes'); // 180000 / 60
      expect(report).toContain('90.00%'); // 45 / 50 * 100
    });
  });
});
