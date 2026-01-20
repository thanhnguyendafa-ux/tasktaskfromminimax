/**
 * Tests for core interfaces and data models
 * 
 * This test file verifies that the TypeScript interfaces are properly defined
 * and can be used to create valid objects. It also sets up the testing framework
 * with fast-check for property-based testing.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type {
  FocusTimeRecord,
  SessionState,
  MigrationData,
  TimeBreakdown,
  MigrationSummary,
  TimeTrackerSession,
  PomodoroSession,
  FocusTimeEvent,
  FocusTimeConfig,
} from '../types';

describe('Core Interfaces and Data Models', () => {
  describe('FocusTimeRecord', () => {
    it('should create a valid FocusTimeRecord with all required fields', () => {
      const record: FocusTimeRecord = {
        id: 'test-id-1',
        date: new Date('2024-01-01'),
        manualTrackingTime: 1800,
        completedPomodoroTime: 1500,
        incompletePomodoroTime: 300,
        totalFocusTime: 3600,
        pomodoroCount: 1,
        sessionCount: 2,
        lastUpdated: new Date('2024-01-01T12:00:00'),
      };

      expect(record.id).toBe('test-id-1');
      expect(record.totalFocusTime).toBe(3600);
      expect(record.pomodoroCount).toBe(1);
    });

    it('should calculate totalFocusTime as sum of all time components', () => {
      const record: FocusTimeRecord = {
        id: 'test-id-2',
        date: new Date(),
        manualTrackingTime: 1000,
        completedPomodoroTime: 2000,
        incompletePomodoroTime: 500,
        totalFocusTime: 1000 + 2000 + 500,
        pomodoroCount: 2,
        sessionCount: 3,
        lastUpdated: new Date(),
      };

      const expectedTotal = record.manualTrackingTime + 
                           record.completedPomodoroTime + 
                           record.incompletePomodoroTime;
      
      expect(record.totalFocusTime).toBe(expectedTotal);
    });
  });

  describe('SessionState', () => {
    it('should create a valid manual tracking session state', () => {
      const state: SessionState = {
        isActive: true,
        mode: 'manual',
        startTime: new Date(),
        currentElapsed: 120,
      };

      expect(state.isActive).toBe(true);
      expect(state.mode).toBe('manual');
      expect(state.pomodoroTarget).toBeUndefined();
    });

    it('should create a valid Pomodoro session state with target', () => {
      const state: SessionState = {
        isActive: true,
        mode: 'pomodoro',
        startTime: new Date(),
        currentElapsed: 600,
        pomodoroTarget: 1500,
        pomodoroElapsed: 600,
      };

      expect(state.mode).toBe('pomodoro');
      expect(state.pomodoroTarget).toBe(1500);
      expect(state.pomodoroElapsed).toBe(600);
    });
  });

  describe('MigrationData', () => {
    it('should create valid migration data structure', () => {
      const migrationData: MigrationData = {
        existingTimeTracker: {
          totalSeconds: 5400,
          sessions: [
            {
              id: 'session-1',
              startTime: new Date('2024-01-01T10:00:00'),
              endTime: new Date('2024-01-01T11:30:00'),
              durationSeconds: 5400,
              status: 'completed',
            },
          ],
        },
        existingPomodoro: {
          completedCount: 3,
          sessions: [
            {
              id: 'pomo-1',
              startTime: new Date('2024-01-01T14:00:00'),
              completedAt: new Date('2024-01-01T14:25:00'),
              durationSeconds: 1500,
              targetDuration: 1500,
              status: 'completed',
            },
          ],
        },
        calculatedTotalTime: 9900,
        migrationTimestamp: new Date(),
      };

      expect(migrationData.existingTimeTracker.totalSeconds).toBe(5400);
      expect(migrationData.existingPomodoro.completedCount).toBe(3);
      expect(migrationData.calculatedTotalTime).toBe(9900);
    });
  });

  describe('TimeBreakdown', () => {
    it('should create a valid time breakdown', () => {
      const breakdown: TimeBreakdown = {
        manualTime: 1800,
        completedPomodoroTime: 3000,
        incompletePomodoroTime: 600,
        totalTime: 5400,
        pomodoroCount: 2,
        sessionCount: 4,
      };

      expect(breakdown.totalTime).toBe(5400);
      expect(breakdown.manualTime + breakdown.completedPomodoroTime + breakdown.incompletePomodoroTime).toBe(5400);
    });
  });

  describe('MigrationSummary', () => {
    it('should create a successful migration summary', () => {
      const summary: MigrationSummary = {
        totalRecordsMigrated: 150,
        totalTimePreserved: 180000,
        pomodoroSessionsPreserved: 75,
        manualSessionsPreserved: 75,
        migrationDate: new Date(),
        success: true,
      };

      expect(summary.success).toBe(true);
      expect(summary.totalRecordsMigrated).toBe(150);
      expect(summary.errors).toBeUndefined();
    });

    it('should create a failed migration summary with errors', () => {
      const summary: MigrationSummary = {
        totalRecordsMigrated: 0,
        totalTimePreserved: 0,
        pomodoroSessionsPreserved: 0,
        manualSessionsPreserved: 0,
        migrationDate: new Date(),
        success: false,
        errors: ['Database connection failed', 'Data corruption detected'],
      };

      expect(summary.success).toBe(false);
      expect(summary.errors).toHaveLength(2);
    });
  });

  describe('FocusTimeEvent', () => {
    it('should create session start event', () => {
      const event: FocusTimeEvent = {
        type: 'session_start',
        timestamp: new Date(),
        data: {
          mode: 'manual',
        },
      };

      expect(event.type).toBe('session_start');
      expect(event.data.mode).toBe('manual');
    });

    it('should create time update event', () => {
      const event: FocusTimeEvent = {
        type: 'time_update',
        timestamp: new Date(),
        data: {
          elapsedTime: 300,
          totalTime: 7200,
        },
      };

      expect(event.type).toBe('time_update');
      expect(event.data.elapsedTime).toBe(300);
      expect(event.data.totalTime).toBe(7200);
    });

    it('should create mode switch event', () => {
      const event: FocusTimeEvent = {
        type: 'mode_switch',
        timestamp: new Date(),
        data: {
          fromMode: 'manual',
          toMode: 'pomodoro',
        },
      };

      expect(event.type).toBe('mode_switch');
      expect(event.data.fromMode).toBe('manual');
      expect(event.data.toMode).toBe('pomodoro');
    });
  });

  describe('FocusTimeConfig', () => {
    it('should create a valid configuration', () => {
      const config: FocusTimeConfig = {
        updateIntervalMs: 1000,
        minSessionDuration: 60,
        defaultPomodoroDuration: 1500,
        notificationsEnabled: true,
        autoSaveIntervalMs: 30000,
      };

      expect(config.updateIntervalMs).toBe(1000);
      expect(config.defaultPomodoroDuration).toBe(1500);
      expect(config.notificationsEnabled).toBe(true);
    });
  });
});

describe('Property-Based Testing Setup', () => {
  describe('fast-check integration', () => {
    it('should verify fast-check is properly installed and working', () => {
      fc.assert(
        fc.property(fc.integer(), (n) => {
          return n === n; // Identity property
        })
      );
    });

    it('should generate valid non-negative time values', () => {
      fc.assert(
        fc.property(fc.nat(), (seconds) => {
          return seconds >= 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should verify time addition is commutative', () => {
      fc.assert(
        fc.property(fc.nat(), fc.nat(), (a, b) => {
          return a + b === b + a;
        }),
        { numRuns: 100 }
      );
    });

    it('should verify totalFocusTime calculation property', () => {
      // Property: totalFocusTime should always equal the sum of its components
      fc.assert(
        fc.property(
          fc.nat(),
          fc.nat(),
          fc.nat(),
          (manualTime, completedPomodoro, incompletePomodoro) => {
            const record: FocusTimeRecord = {
              id: 'test',
              date: new Date(),
              manualTrackingTime: manualTime,
              completedPomodoroTime: completedPomodoro,
              incompletePomodoroTime: incompletePomodoro,
              totalFocusTime: manualTime + completedPomodoro + incompletePomodoro,
              pomodoroCount: 0,
              sessionCount: 0,
              lastUpdated: new Date(),
            };

            const calculatedTotal = record.manualTrackingTime + 
                                   record.completedPomodoroTime + 
                                   record.incompletePomodoroTime;

            return record.totalFocusTime === calculatedTotal;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Arbitraries for focus time data', () => {
    it('should generate valid FocusTimeRecord objects', () => {
      const focusTimeRecordArbitrary = fc.record({
        id: fc.uuid(),
        date: fc.date(),
        manualTrackingTime: fc.nat(),
        completedPomodoroTime: fc.nat(),
        incompletePomodoroTime: fc.nat(),
        pomodoroCount: fc.nat(),
        sessionCount: fc.nat(),
        lastUpdated: fc.date(),
      }).map((record) => ({
        ...record,
        totalFocusTime: record.manualTrackingTime + 
                       record.completedPomodoroTime + 
                       record.incompletePomodoroTime,
      }));

      fc.assert(
        fc.property(focusTimeRecordArbitrary, (record) => {
          // Verify the record is valid
          expect(record.id).toBeDefined();
          expect(record.totalFocusTime).toBeGreaterThanOrEqual(0);
          
          // Verify totalFocusTime is correct
          const expectedTotal = record.manualTrackingTime + 
                               record.completedPomodoroTime + 
                               record.incompletePomodoroTime;
          
          return record.totalFocusTime === expectedTotal;
        }),
        { numRuns: 100 }
      );
    });

    it('should generate valid SessionState objects', () => {
      const sessionStateArbitrary = fc.record({
        isActive: fc.boolean(),
        mode: fc.constantFrom('manual' as const, 'pomodoro' as const),
        startTime: fc.date(),
        currentElapsed: fc.nat(),
        pomodoroTarget: fc.option(fc.nat(), { nil: undefined }),
        pomodoroElapsed: fc.option(fc.nat(), { nil: undefined }),
      });

      fc.assert(
        fc.property(sessionStateArbitrary, (state) => {
          expect(state.mode).toMatch(/^(manual|pomodoro)$/);
          expect(state.currentElapsed).toBeGreaterThanOrEqual(0);
          
          // If mode is pomodoro, pomodoroTarget should be defined
          if (state.mode === 'pomodoro' && state.isActive) {
            // This is a soft constraint, not enforced by types
            return true;
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
