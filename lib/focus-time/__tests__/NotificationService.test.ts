/**
 * Tests for NotificationService
 * 
 * This test file includes unit tests to verify the correctness
 * of the NotificationService implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '../NotificationService';
import type { TimeBreakdown, MigrationSummary } from '../types';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('Basic Functionality', () => {
    it('should initialize with no notifications', () => {
      expect(service.getNotifications()).toHaveLength(0);
    });

    it('should generate unique IDs for notifications', () => {
      service.showCustomNotification('info', 'Test 1', 'Message 1');
      service.showCustomNotification('info', 'Test 2', 'Message 2');
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(2);
      expect(notifications[0].id).not.toBe(notifications[1].id);
    });
  });

  describe('Incomplete Pomodoro Notifications', () => {
    it('should show notification for incomplete Pomodoro', () => {
      service.showIncompletePomodoro(750); // 12 minutes 30 seconds
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].title).toBe('Pomodoro Session Incomplete');
      expect(notifications[0].message).toContain('12 minutes and 30 seconds');
    });

    it('should format time correctly for seconds only', () => {
      service.showIncompletePomodoro(45);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('45 seconds');
    });

    it('should format time correctly for minutes and seconds', () => {
      service.showIncompletePomodoro(125); // 2 minutes 5 seconds
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('2 minutes and 5 seconds');
    });

    it('should use singular form for 1 minute', () => {
      service.showIncompletePomodoro(61); // 1 minute 1 second
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('1 minute and 1 second');
    });

    it('should call notification callbacks', () => {
      const callback = vi.fn();
      service.onNotification(callback);
      
      service.showIncompletePomodoro(100);
      
      expect(callback).toHaveBeenCalledOnce();
      expect(callback.mock.calls[0][0].type).toBe('info');
    });
  });

  describe('Mode Switch Notifications', () => {
    it('should show notification for mode switch', () => {
      service.showModeSwitch('manual', 'pomodoro');
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].title).toBe('Mode Switched');
      expect(notifications[0].message).toContain('manual');
      expect(notifications[0].message).toContain('pomodoro');
    });

    it('should show notification for reverse mode switch', () => {
      service.showModeSwitch('pomodoro', 'manual');
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('pomodoro');
      expect(notifications[0].message).toContain('manual');
    });

    it('should call notification callbacks', () => {
      const callback = vi.fn();
      service.onNotification(callback);
      
      service.showModeSwitch('manual', 'pomodoro');
      
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('Time Breakdown Notifications', () => {
    it('should show time breakdown with all components', () => {
      const breakdown: TimeBreakdown = {
        manualTime: 1800, // 30 minutes
        completedPomodoroTime: 3000, // 50 minutes
        incompletePomodoroTime: 600, // 10 minutes
        totalTime: 5400, // 90 minutes
        pomodoroCount: 2,
        sessionCount: 5,
      };
      
      service.showTimeBreakdown(breakdown);
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].title).toBe('Focus Time Breakdown');
      expect(notifications[0].message).toContain('Manual tracking');
      expect(notifications[0].message).toContain('Completed Pomodoros');
      expect(notifications[0].message).toContain('Incomplete Pomodoros');
    });

    it('should show time breakdown with only manual time', () => {
      const breakdown: TimeBreakdown = {
        manualTime: 1800,
        completedPomodoroTime: 0,
        incompletePomodoroTime: 0,
        totalTime: 1800,
        pomodoroCount: 0,
        sessionCount: 1,
      };
      
      service.showTimeBreakdown(breakdown);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('Manual tracking');
      expect(notifications[0].message).not.toContain('Completed Pomodoros');
      expect(notifications[0].message).not.toContain('Incomplete Pomodoros');
    });

    it('should show message for zero time', () => {
      const breakdown: TimeBreakdown = {
        manualTime: 0,
        completedPomodoroTime: 0,
        incompletePomodoroTime: 0,
        totalTime: 0,
        pomodoroCount: 0,
        sessionCount: 0,
      };
      
      service.showTimeBreakdown(breakdown);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('No focus sessions recorded yet');
    });

    it('should format time with hours, minutes, and seconds', () => {
      const breakdown: TimeBreakdown = {
        manualTime: 3665, // 1h 1m 5s
        completedPomodoroTime: 0,
        incompletePomodoroTime: 0,
        totalTime: 3665,
        pomodoroCount: 0,
        sessionCount: 1,
      };
      
      service.showTimeBreakdown(breakdown);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('1h 1m 5s');
    });
  });

  describe('Migration Complete Notifications', () => {
    it('should show success notification for successful migration', () => {
      const migrationData: MigrationSummary = {
        totalRecordsMigrated: 10,
        totalTimePreserved: 36000, // 10 hours
        pomodoroSessionsPreserved: 5,
        manualSessionsPreserved: 5,
        migrationDate: new Date(),
        success: true,
      };
      
      service.showMigrationComplete(migrationData);
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Migration Complete');
      expect(notifications[0].message).toContain('10 records');
      expect(notifications[0].message).toContain('10h');
    });

    it('should show error notification for failed migration', () => {
      const migrationData: MigrationSummary = {
        totalRecordsMigrated: 0,
        totalTimePreserved: 0,
        pomodoroSessionsPreserved: 0,
        manualSessionsPreserved: 0,
        migrationDate: new Date(),
        success: false,
        errors: ['Error 1', 'Error 2', 'Error 3'],
      };
      
      service.showMigrationComplete(migrationData);
      
      const notifications = service.getNotifications();
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].title).toBe('Migration Failed');
      expect(notifications[0].message).toContain('Error 1');
      expect(notifications[0].message).toContain('Error 2');
    });

    it('should truncate error list if too many errors', () => {
      const migrationData: MigrationSummary = {
        totalRecordsMigrated: 0,
        totalTimePreserved: 0,
        pomodoroSessionsPreserved: 0,
        manualSessionsPreserved: 0,
        migrationDate: new Date(),
        success: false,
        errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5'],
      };
      
      service.showMigrationComplete(migrationData);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('and 2 more errors');
    });

    it('should use singular form for 1 record', () => {
      const migrationData: MigrationSummary = {
        totalRecordsMigrated: 1,
        totalTimePreserved: 3600,
        pomodoroSessionsPreserved: 1,
        manualSessionsPreserved: 0,
        migrationDate: new Date(),
        success: true,
      };
      
      service.showMigrationComplete(migrationData);
      
      const notifications = service.getNotifications();
      expect(notifications[0].message).toContain('1 record');
    });
  });

  describe('Custom Notifications', () => {
    it('should show custom notification', () => {
      service.showCustomNotification('warning', 'Test Title', 'Test Message');
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('warning');
      expect(notifications[0].title).toBe('Test Title');
      expect(notifications[0].message).toBe('Test Message');
    });

    it('should support all notification types', () => {
      service.showCustomNotification('info', 'Info', 'Info message');
      service.showCustomNotification('success', 'Success', 'Success message');
      service.showCustomNotification('warning', 'Warning', 'Warning message');
      service.showCustomNotification('error', 'Error', 'Error message');
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(4);
      expect(notifications[0].type).toBe('info');
      expect(notifications[1].type).toBe('success');
      expect(notifications[2].type).toBe('warning');
      expect(notifications[3].type).toBe('error');
    });
  });

  describe('Notification Management', () => {
    it('should get notifications by type', () => {
      service.showCustomNotification('info', 'Info', 'Info message');
      service.showCustomNotification('error', 'Error', 'Error message');
      service.showCustomNotification('info', 'Info 2', 'Info message 2');
      
      const infoNotifications = service.getNotificationsByType('info');
      expect(infoNotifications).toHaveLength(2);
      
      const errorNotifications = service.getNotificationsByType('error');
      expect(errorNotifications).toHaveLength(1);
    });

    it('should clear specific notification', () => {
      service.showCustomNotification('info', 'Test 1', 'Message 1');
      service.showCustomNotification('info', 'Test 2', 'Message 2');
      
      const notifications = service.getNotifications();
      const firstId = notifications[0].id;
      
      service.clearNotification(firstId);
      
      const remaining = service.getNotifications();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).not.toBe(firstId);
    });

    it('should clear all notifications', () => {
      service.showCustomNotification('info', 'Test 1', 'Message 1');
      service.showCustomNotification('info', 'Test 2', 'Message 2');
      service.showCustomNotification('info', 'Test 3', 'Message 3');
      
      service.clearAllNotifications();
      
      expect(service.getNotifications()).toHaveLength(0);
    });

    it('should clear old notifications', () => {
      // Create notifications with different timestamps
      service.showCustomNotification('info', 'Old', 'Old message');
      
      // Wait a bit
      const oldNotifications = service.getNotifications();
      const oldNotification = oldNotifications[0];
      
      // Manually set old timestamp
      oldNotification.timestamp = new Date(Date.now() - 10000); // 10 seconds ago
      
      service.showCustomNotification('info', 'New', 'New message');
      
      // Clear notifications older than 5 seconds
      service.clearOldNotifications(5000);
      
      const remaining = service.getNotifications();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('New');
    });
  });

  describe('Callback Management', () => {
    it('should call multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      service.onNotification(callback1);
      service.onNotification(callback2);
      
      service.showCustomNotification('info', 'Test', 'Message');
      
      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });

    it('should remove callback', () => {
      const callback = vi.fn();
      
      service.onNotification(callback);
      service.removeNotificationCallback(callback);
      
      service.showCustomNotification('info', 'Test', 'Message');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      service.onNotification(errorCallback);
      service.onNotification(goodCallback);
      
      expect(() => service.showCustomNotification('info', 'Test', 'Message')).not.toThrow();
      expect(goodCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Timestamps', () => {
    it('should set timestamp on notifications', () => {
      const before = new Date();
      service.showCustomNotification('info', 'Test', 'Message');
      const after = new Date();
      
      const notifications = service.getNotifications();
      const timestamp = notifications[0].timestamp;
      
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
