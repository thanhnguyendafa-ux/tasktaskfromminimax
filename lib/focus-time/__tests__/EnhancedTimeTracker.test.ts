/**
 * Tests for EnhancedTimeTracker
 * 
 * This test file includes both unit tests and property-based tests
 * to verify the correctness of the EnhancedTimeTracker implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { EnhancedTimeTracker } from '../EnhancedTimeTracker';

describe('EnhancedTimeTracker', () => {
  let tracker: EnhancedTimeTracker;

  beforeEach(() => {
    tracker = new EnhancedTimeTracker();
  });

  describe('Basic Functionality', () => {
    it('should initialize with zero total time', () => {
      expect(tracker.getTotalTime()).toBe(0);
    });

    it('should initialize with tracking inactive', () => {
      expect(tracker.isTrackingActive()).toBe(false);
    });

    it('should return correct time breakdown initially', () => {
      const breakdown = tracker.getTimeBreakdown();
      expect(breakdown.manualTime).toBe(0);
      expect(breakdown.incompletePomodoros).toBe(0);
      expect(breakdown.total).toBe(0);
    });
  });

  describe('Manual Tracking', () => {
    it('should start tracking', () => {
      tracker.startTracking();
      expect(tracker.isTrackingActive()).toBe(true);
    });

    it('should stop tracking and save time', () => {
      tracker.startTracking();
      tracker.stopTracking();
      
      expect(tracker.isTrackingActive()).toBe(false);
      // Time should be at least 0 (may be 0 if stopped immediately)
      expect(tracker.getTotalTime()).toBeGreaterThanOrEqual(0);
    });

    it('should accumulate manual time across multiple sessions', () => {
      tracker.setTimeComponents({ manualTime: 1000 });
      tracker.startTracking();
      tracker.stopTracking();
      
      // Should have at least the initial 1000 seconds
      expect(tracker.getTotalTime()).toBeGreaterThanOrEqual(1000);
    });

    it('should handle stopping when not tracking', () => {
      expect(() => tracker.stopTracking()).not.toThrow();
      expect(tracker.getTotalTime()).toBe(0);
    });

    it('should restart tracking if already active', () => {
      tracker.startTracking();
      const firstStart = tracker.isTrackingActive();
      
      tracker.startTracking();
      const secondStart = tracker.isTrackingActive();
      
      expect(firstStart).toBe(true);
      expect(secondStart).toBe(true);
    });
  });

  describe('Incomplete Pomodoro Handling', () => {
    it('should add incomplete session time', () => {
      tracker.addIncompleteSessionTime(750);
      
      expect(tracker.getTotalTime()).toBe(750);
      
      const breakdown = tracker.getTimeBreakdown();
      expect(breakdown.incompletePomodoros).toBe(750);
    });

    it('should accumulate multiple incomplete sessions', () => {
      tracker.addIncompleteSessionTime(500);
      tracker.addIncompleteSessionTime(300);
      tracker.addIncompleteSessionTime(200);
      
      expect(tracker.getTotalTime()).toBe(1000);
      expect(tracker.getIncompletePomodoros()).toBe(1000);
    });

    it('should throw error for negative incomplete session time', () => {
      expect(() => tracker.addIncompleteSessionTime(-100))
        .toThrow('Incomplete session time cannot be negative');
    });

    it('should maintain precision by flooring fractional seconds', () => {
      tracker.addIncompleteSessionTime(123.7);
      expect(tracker.getIncompletePomodoros()).toBe(123);
    });
  });

  describe('Time Breakdown', () => {
    it('should separate manual time and incomplete Pomodoros', () => {
      tracker.setTimeComponents({
        manualTime: 1000,
        incompletePomodoros: 500,
      });
      
      const breakdown = tracker.getTimeBreakdown();
      expect(breakdown.manualTime).toBe(1000);
      expect(breakdown.incompletePomodoros).toBe(500);
      expect(breakdown.total).toBe(1500);
    });

    it('should include current session in manual time', () => {
      tracker.setTimeComponents({ manualTime: 1000 });
      tracker.startTracking();
      
      const breakdown = tracker.getTimeBreakdown();
      expect(breakdown.manualTime).toBeGreaterThanOrEqual(1000);
      expect(breakdown.total).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('Time Components', () => {
    it('should set time components directly', () => {
      tracker.setTimeComponents({
        manualTime: 2000,
        incompletePomodoros: 800,
      });
      
      expect(tracker.getTotalTime()).toBe(2800);
      expect(tracker.getManualTime()).toBe(2000);
      expect(tracker.getIncompletePomodoros()).toBe(800);
    });

    it('should throw error for negative manual time', () => {
      expect(() => tracker.setTimeComponents({ manualTime: -100 }))
        .toThrow('Manual time cannot be negative');
    });

    it('should throw error for negative incomplete Pomodoros time', () => {
      expect(() => tracker.setTimeComponents({ incompletePomodoros: -100 }))
        .toThrow('Incomplete Pomodoros time cannot be negative');
    });

    it('should floor fractional values when setting components', () => {
      tracker.setTimeComponents({
        manualTime: 123.9,
        incompletePomodoros: 456.1,
      });
      
      expect(tracker.getManualTime()).toBe(123);
      expect(tracker.getIncompletePomodoros()).toBe(456);
    });
  });

  describe('Reset', () => {
    it('should reset all time and stop tracking', () => {
      tracker.setTimeComponents({
        manualTime: 1000,
        incompletePomodoros: 500,
      });
      tracker.startTracking();
      
      tracker.reset();
      
      expect(tracker.getTotalTime()).toBe(0);
      expect(tracker.isTrackingActive()).toBe(false);
      expect(tracker.getManualTime()).toBe(0);
      expect(tracker.getIncompletePomodoros()).toBe(0);
    });
  });

  describe('Current Session Time', () => {
    it('should return zero when not tracking', () => {
      expect(tracker.getCurrentSessionTime()).toBe(0);
    });

    it('should return elapsed time when tracking', () => {
      tracker.startTracking();
      const elapsed = tracker.getCurrentSessionTime();
      
      // Should be at least 0
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Property-Based Tests', () => {
  describe('Property 2: Incomplete Session Time Preservation', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 2: Incomplete Session Time Preservation**
     * 
     * **Validates: Requirements 2.1, 2.2, 2.3**
     * 
     * For any Pomodoro session that becomes incomplete (aborted or interrupted),
     * the elapsed time should be preserved in the Time_Tracker component without
     * affecting the Pomodoro count.
     */
    it('should preserve incomplete Pomodoro time when added', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 3600 }), // Incomplete session time (max 1 hour)
          (incompleteTime) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.addIncompleteSessionTime(incompleteTime);
            
            const totalTime = testTracker.getTotalTime();
            const incompletePomodoros = testTracker.getIncompletePomodoros();
            
            // Time should be preserved exactly (floored to seconds)
            return totalTime === Math.floor(incompleteTime) && 
                   incompletePomodoros === Math.floor(incompleteTime);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accumulate multiple incomplete sessions correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 3600 }), { maxLength: 10 }),
          (incompleteSessions) => {
            const testTracker = new EnhancedTimeTracker();
            
            let expectedTotal = 0;
            for (const sessionTime of incompleteSessions) {
              testTracker.addIncompleteSessionTime(sessionTime);
              expectedTotal += Math.floor(sessionTime);
            }
            
            const actualTotal = testTracker.getIncompletePomodoros();
            
            return actualTotal === expectedTotal;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep incomplete Pomodoro time separate from manual time', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }),
          (manualTime, incompleteTime) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.setTimeComponents({ manualTime });
            testTracker.addIncompleteSessionTime(incompleteTime);
            
            const breakdown = testTracker.getTimeBreakdown();
            
            // Manual time and incomplete Pomodoros should be separate
            return breakdown.manualTime === Math.floor(manualTime) &&
                   breakdown.incompletePomodoros === Math.floor(incompleteTime) &&
                   breakdown.total === Math.floor(manualTime) + Math.floor(incompleteTime);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve time through multiple operations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('manual', 'incomplete'),
              time: fc.nat({ max: 3600 }),
            }),
            { maxLength: 20 }
          ),
          (operations) => {
            const testTracker = new EnhancedTimeTracker();
            let expectedManual = 0;
            let expectedIncomplete = 0;
            
            for (const op of operations) {
              if (op.type === 'manual') {
                testTracker.setTimeComponents({
                  manualTime: testTracker.getManualTime() + op.time,
                });
                expectedManual += Math.floor(op.time);
              } else {
                testTracker.addIncompleteSessionTime(op.time);
                expectedIncomplete += Math.floor(op.time);
              }
            }
            
            const breakdown = testTracker.getTimeBreakdown();
            
            return breakdown.manualTime === expectedManual &&
                   breakdown.incompletePomodoros === expectedIncomplete &&
                   breakdown.total === expectedManual + expectedIncomplete;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Consistent Timing Precision', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 8: Consistent Timing Precision**
     * 
     * **Validates: Requirements 2.4, 6.5**
     * 
     * For any time recording operation, the precision should be consistent
     * across manual tracking and Pomodoro modes (seconds precision).
     */
    it('should maintain seconds precision for all time values', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 86400, noNaN: true }),
          fc.float({ min: 0, max: 3600, noNaN: true }),
          (manualTime, incompleteTime) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.setTimeComponents({
              manualTime,
              incompletePomodoros: incompleteTime,
            });
            
            const breakdown = testTracker.getTimeBreakdown();
            
            // All values should be integers (seconds precision)
            return Number.isInteger(breakdown.manualTime) &&
                   Number.isInteger(breakdown.incompletePomodoros) &&
                   Number.isInteger(breakdown.total);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should floor fractional seconds consistently', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 86400, noNaN: true }),
          (timeValue) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.setTimeComponents({ manualTime: timeValue });
            const manualResult = testTracker.getManualTime();
            
            testTracker.reset();
            testTracker.addIncompleteSessionTime(timeValue);
            const incompleteResult = testTracker.getIncompletePomodoros();
            
            // Both should floor to the same value
            const expected = Math.floor(timeValue);
            
            return manualResult === expected && incompleteResult === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain precision through getTotalTime', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }),
          (manualTime, incompleteTime) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.setTimeComponents({
              manualTime,
              incompletePomodoros: incompleteTime,
            });
            
            const totalTime = testTracker.getTotalTime();
            const breakdown = testTracker.getTimeBreakdown();
            
            // Total should equal sum of components
            return totalTime === breakdown.total &&
                   totalTime === breakdown.manualTime + breakdown.incompletePomodoros;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle zero values with consistent precision', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(0, 0.0, 0.5, 0.9),
          (zeroValue) => {
            const testTracker = new EnhancedTimeTracker();
            
            testTracker.setTimeComponents({ manualTime: zeroValue });
            
            // Should always be 0 (floored)
            return testTracker.getManualTime() === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
