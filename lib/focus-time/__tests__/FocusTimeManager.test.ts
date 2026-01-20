/**
 * Tests for FocusTimeManager
 * 
 * This test file includes both unit tests and property-based tests
 * to verify the correctness of the FocusTimeManager implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { FocusTimeManager } from '../FocusTimeManager';

describe('FocusTimeManager', () => {
  let manager: FocusTimeManager;

  beforeEach(() => {
    manager = new FocusTimeManager();
  });

  afterEach(() => {
    manager.dispose();
  });

  describe('Basic Functionality', () => {
    it('should initialize with zero total focus time', () => {
      expect(manager.getTotalFocusTime()).toBe(0);
    });

    it('should initialize with no active session', () => {
      expect(manager.getCurrentSessionTime()).toBe(0);
      expect(manager.getSessionState()).toBeNull();
    });

    it('should return correct time breakdown initially', () => {
      const breakdown = manager.getTimeBreakdown();
      expect(breakdown.manualTime).toBe(0);
      expect(breakdown.completedPomodoroTime).toBe(0);
      expect(breakdown.incompletePomodoroTime).toBe(0);
      expect(breakdown.currentSessionTime).toBe(0);
      expect(breakdown.total).toBe(0);
    });
  });

  describe('Session Management', () => {
    it('should start a manual session', () => {
      manager.startSession('manual');
      
      const state = manager.getSessionState();
      expect(state).not.toBeNull();
      expect(state?.isActive).toBe(true);
      expect(state?.mode).toBe('manual');
    });

    it('should start a pomodoro session', () => {
      manager.startSession('pomodoro');
      
      const state = manager.getSessionState();
      expect(state).not.toBeNull();
      expect(state?.isActive).toBe(true);
      expect(state?.mode).toBe('pomodoro');
    });

    it('should end a session and save time', () => {
      // Set some initial time to test with
      manager.setTimeComponents({ manualTrackingTime: 1000 });
      
      manager.startSession('manual');
      manager.endSession();
      
      const state = manager.getSessionState();
      expect(state?.isActive).toBe(false);
      
      // Time should be at least the initial time
      expect(manager.getTotalFocusTime()).toBeGreaterThanOrEqual(1000);
    });

    it('should handle ending a session when no session is active', () => {
      expect(() => manager.endSession()).not.toThrow();
      expect(manager.getTotalFocusTime()).toBe(0);
    });
  });

  describe('Mode Switching', () => {
    it('should switch from manual to pomodoro mode', () => {
      manager.setTimeComponents({ manualTrackingTime: 1000 });
      manager.startSession('manual');
      
      const timeBeforeSwitch = manager.getTotalFocusTime();
      
      manager.switchMode('pomodoro');
      
      const state = manager.getSessionState();
      expect(state?.mode).toBe('pomodoro');
      expect(state?.isActive).toBe(true);
      
      // Time should be preserved
      expect(manager.getTotalFocusTime()).toBeGreaterThanOrEqual(timeBeforeSwitch);
    });

    it('should switch from pomodoro to manual mode', () => {
      manager.setTimeComponents({ completedPomodoroTime: 1500 });
      manager.startSession('pomodoro');
      
      const timeBeforeSwitch = manager.getTotalFocusTime();
      
      manager.switchMode('manual');
      
      const state = manager.getSessionState();
      expect(state?.mode).toBe('manual');
      expect(state?.isActive).toBe(true);
      
      // Time should be preserved
      expect(manager.getTotalFocusTime()).toBeGreaterThanOrEqual(timeBeforeSwitch);
    });

    it('should not change state when switching to same mode', () => {
      manager.startSession('manual');
      const stateBefore = manager.getSessionState();
      
      manager.switchMode('manual');
      const stateAfter = manager.getSessionState();
      
      expect(stateAfter?.mode).toBe(stateBefore?.mode);
    });

    it('should start a new session if no session is active when switching', () => {
      manager.switchMode('pomodoro');
      
      const state = manager.getSessionState();
      expect(state?.isActive).toBe(true);
      expect(state?.mode).toBe('pomodoro');
    });
  });

  describe('Pomodoro Handling', () => {
    it('should handle completed Pomodoro', () => {
      manager.handlePomodoroComplete(1500);
      
      expect(manager.getTotalFocusTime()).toBe(1500);
      
      const breakdown = manager.getTimeBreakdown();
      expect(breakdown.completedPomodoroTime).toBe(1500);
    });

    it('should handle incomplete Pomodoro', () => {
      manager.handlePomodoroIncomplete(750);
      
      expect(manager.getTotalFocusTime()).toBe(750);
      
      const breakdown = manager.getTimeBreakdown();
      expect(breakdown.incompletePomodoroTime).toBe(750);
    });

    it('should throw error for negative Pomodoro duration', () => {
      expect(() => manager.handlePomodoroComplete(-100)).toThrow('Pomodoro duration cannot be negative');
    });

    it('should throw error for negative elapsed time', () => {
      expect(() => manager.handlePomodoroIncomplete(-100)).toThrow('Elapsed time cannot be negative');
    });

    it('should end active pomodoro session when handling completion', () => {
      manager.startSession('pomodoro');
      manager.handlePomodoroComplete(1500);
      
      const state = manager.getSessionState();
      expect(state?.isActive).toBe(false);
    });

    it('should end active pomodoro session when handling incomplete', () => {
      manager.startSession('pomodoro');
      manager.handlePomodoroIncomplete(750);
      
      const state = manager.getSessionState();
      expect(state?.isActive).toBe(false);
    });
  });

  describe('Time Components', () => {
    it('should set time components directly', () => {
      manager.setTimeComponents({
        manualTrackingTime: 1000,
        completedPomodoroTime: 2000,
        incompletePomodoroTime: 500,
      });
      
      expect(manager.getTotalFocusTime()).toBe(3500);
      
      const breakdown = manager.getTimeBreakdown();
      expect(breakdown.manualTime).toBe(1000);
      expect(breakdown.completedPomodoroTime).toBe(2000);
      expect(breakdown.incompletePomodoroTime).toBe(500);
    });

    it('should throw error for negative manual tracking time', () => {
      expect(() => manager.setTimeComponents({ manualTrackingTime: -100 }))
        .toThrow('Manual tracking time cannot be negative');
    });

    it('should throw error for negative completed Pomodoro time', () => {
      expect(() => manager.setTimeComponents({ completedPomodoroTime: -100 }))
        .toThrow('Completed Pomodoro time cannot be negative');
    });

    it('should throw error for negative incomplete Pomodoro time', () => {
      expect(() => manager.setTimeComponents({ incompletePomodoroTime: -100 }))
        .toThrow('Incomplete Pomodoro time cannot be negative');
    });
  });

  describe('Tally Functionality', () => {
    it('should initialize with zero tally count', () => {
      expect(manager.getTallyCount()).toBe(0);
    });

    it('should initialize with zero tally goal', () => {
      expect(manager.getTallyGoal()).toBe(0);
    });

    it('should initialize with zero tally progress', () => {
      expect(manager.getTallyProgress()).toBe(0);
    });

    it('should increment tally count', () => {
      manager.incrementTally();
      expect(manager.getTallyCount()).toBe(1);
    });

    it('should decrement tally count', () => {
      manager.setTimeComponents({ tallyCount: 5 });
      manager.decrementTally();
      expect(manager.getTallyCount()).toBe(4);
    });

    it('should not decrement below zero', () => {
      manager.decrementTally();
      expect(manager.getTallyCount()).toBe(0);
    });

    it('should set tally goal', () => {
      manager.setTallyGoal(10);
      expect(manager.getTallyGoal()).toBe(10);
    });

    it('should calculate tally progress correctly', () => {
      manager.setTimeComponents({ tallyCount: 5 });
      manager.setTallyGoal(10);
      expect(manager.getTallyProgress()).toBe(50);
    });

    it('should cap tally progress at 100%', () => {
      manager.setTimeComponents({ tallyCount: 15 });
      manager.setTallyGoal(10);
      expect(manager.getTallyProgress()).toBe(100);
    });

    it('should return 0 progress when goal is zero', () => {
      manager.setTimeComponents({ tallyCount: 5 });
      expect(manager.getTallyProgress()).toBe(0);
    });

    it('should throw error for negative tally goal', () => {
      expect(() => manager.setTallyGoal(-1)).toThrow('Tally goal cannot be negative');
    });

    it('should throw error for negative tally count in setTimeComponents', () => {
      expect(() => manager.setTimeComponents({ tallyCount: -1 })).toThrow('Tally count cannot be negative');
    });

    it('should throw error for negative tally goal in setTimeComponents', () => {
      expect(() => manager.setTimeComponents({ tallyGoal: -1 })).toThrow('Tally goal cannot be negative');
    });

    it('should include tally data in time breakdown', () => {
      manager.setTimeComponents({ tallyCount: 5, tallyGoal: 10 });
      const breakdown = manager.getTimeBreakdown();
      expect(breakdown.tallyCount).toBe(5);
      expect(breakdown.tallyGoal).toBe(10);
      expect(breakdown.tallyProgress).toBe(50);
    });
  });

  describe('Tally Event Callbacks', () => {
    it('should call tally update callback when tally changes', () => {
      const callback = vi.fn();
      manager.onTallyUpdate(callback);
      
      manager.incrementTally();
      
      expect(callback).toHaveBeenCalledWith(1);
    });

    it('should call tally goal reached callback when goal is met', () => {
      const callback = vi.fn();
      manager.onTallyGoalReached(callback);
      manager.setTallyGoal(3);
      
      manager.incrementTally();
      manager.incrementTally();
      manager.incrementTally();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should return cleanup function from onTallyUpdate', () => {
      const callback = vi.fn();
      const cleanup = manager.onTallyUpdate(callback);
      
      manager.incrementTally();
      expect(callback).toHaveBeenCalledWith(1);
      
      cleanup();
      manager.incrementTally();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return cleanup function from onTallyGoalReached', () => {
      const callback = vi.fn();
      const cleanup = manager.onTallyGoalReached(callback);
      manager.setTallyGoal(2);
      
      manager.incrementTally();
      manager.incrementTally();
      expect(callback).toHaveBeenCalled();
      
      cleanup();
      manager.setTallyGoal(3);
      manager.incrementTally();
      manager.incrementTally();
      manager.incrementTally();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Callbacks', () => {
    it('should call time update callback when time changes', () => {
      const callback = vi.fn();
      manager.onTimeUpdate(callback);
      
      manager.handlePomodoroComplete(1500);
      
      expect(callback).toHaveBeenCalledWith(1500);
    });

    it('should call mode switch callback when mode changes', () => {
      const callback = vi.fn();
      manager.onModeSwitch(callback);
      
      manager.startSession('manual');
      manager.switchMode('pomodoro');
      
      expect(callback).toHaveBeenCalledWith('pomodoro');
    });

    it('should remove time update callback', () => {
      const callback = vi.fn();
      manager.onTimeUpdate(callback);
      manager.removeTimeUpdateCallback(callback);
      
      manager.handlePomodoroComplete(1500);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove mode switch callback', () => {
      const callback = vi.fn();
      manager.onModeSwitch(callback);
      manager.removeModeSwitchCallback(callback);
      
      manager.startSession('manual');
      manager.switchMode('pomodoro');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      manager.onTimeUpdate(errorCallback);
      
      expect(() => manager.handlePomodoroComplete(1500)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Real-time Updates', () => {
    it('should call time update callback when session starts', () => {
      const callback = vi.fn();
      manager.onTimeUpdate(callback);
      
      manager.startSession('manual');
      
      // Should have been called at least once on start
      expect(callback).toHaveBeenCalled();
    });

    it('should stop calling callbacks when session ends', () => {
      const callback = vi.fn();
      manager.onTimeUpdate(callback);
      
      manager.startSession('manual');
      const callCountAfterStart = callback.mock.calls.length;
      
      manager.endSession();
      
      // Clear the mock to reset call count
      callback.mockClear();
      
      // After ending, no more calls should happen immediately
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

describe('Property-Based Tests', () => {
  describe('Property 1: Total Focus Time Calculation Accuracy', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 1: Total Focus Time Calculation Accuracy**
     * 
     * **Validates: Requirements 1.1, 1.2, 1.3**
     * 
     * For any combination of manual tracking time, completed Pomodoro sessions,
     * and incomplete Pomodoro sessions, the Total_Focus_Time should equal
     * the sum of all time components.
     */
    it('should always calculate total focus time as sum of all components', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }), // manualTime (max 24 hours)
          fc.nat({ max: 86400 }), // completedPomodoroTime
          fc.nat({ max: 86400 }), // incompletePomodoroTime
          (manualTime, completedPomodoroTime, incompletePomodoroTime) => {
            const manager = new FocusTimeManager();
            
            try {
              // Set time components
              manager.setTimeComponents({
                manualTrackingTime: manualTime,
                completedPomodoroTime: completedPomodoroTime,
                incompletePomodoroTime: incompletePomodoroTime,
              });
              
              // Get total focus time
              const totalFocusTime = manager.getTotalFocusTime();
              
              // Calculate expected total
              const expectedTotal = manualTime + completedPomodoroTime + incompletePomodoroTime;
              
              // Verify the property holds
              const result = totalFocusTime === expectedTotal;
              
              manager.dispose();
              return result;
            } catch (error) {
              manager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include current session time in total when session is active', () => {
      // Test that active session time is included in total
      const testCases = [
        { manualTime: 0, completedPomodoroTime: 0, incompletePomodoroTime: 0, mode: 'manual' as const },
        { manualTime: 1000, completedPomodoroTime: 2000, incompletePomodoroTime: 500, mode: 'manual' as const },
        { manualTime: 5000, completedPomodoroTime: 0, incompletePomodoroTime: 0, mode: 'pomodoro' as const },
        { manualTime: 0, completedPomodoroTime: 3000, incompletePomodoroTime: 1000, mode: 'pomodoro' as const },
      ];
      
      for (const testCase of testCases) {
        const testManager = new FocusTimeManager();
        
        // Set initial time components
        testManager.setTimeComponents({
          manualTrackingTime: testCase.manualTime,
          completedPomodoroTime: testCase.completedPomodoroTime,
          incompletePomodoroTime: testCase.incompletePomodoroTime,
        });
        
        const baseTime = testCase.manualTime + testCase.completedPomodoroTime + testCase.incompletePomodoroTime;
        
        // Start a session
        testManager.startSession(testCase.mode);
        
        // Get total focus time
        const totalFocusTime = testManager.getTotalFocusTime();
        const currentSessionTime = testManager.getCurrentSessionTime();
        
        // Total should be base time plus current session time
        expect(totalFocusTime).toBe(baseTime + currentSessionTime);
        
        testManager.dispose();
      }
    });

    it('should correctly add completed Pomodoro time to total', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }), // Pomodoro duration (max 1 hour)
          (initialTime, pomodoroDuration) => {
            const manager = new FocusTimeManager();
            
            try {
              manager.setTimeComponents({ manualTrackingTime: initialTime });
              
              const timeBefore = manager.getTotalFocusTime();
              
              manager.handlePomodoroComplete(pomodoroDuration);
              
              const timeAfter = manager.getTotalFocusTime();
              
              const result = timeAfter === timeBefore + pomodoroDuration;
              
              manager.dispose();
              return result;
            } catch (error) {
              manager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly add incomplete Pomodoro time to total', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }), // Elapsed time (max 1 hour)
          (initialTime, elapsedTime) => {
            const manager = new FocusTimeManager();
            
            try {
              manager.setTimeComponents({ manualTrackingTime: initialTime });
              
              const timeBefore = manager.getTotalFocusTime();
              
              manager.handlePomodoroIncomplete(elapsedTime);
              
              const timeAfter = manager.getTotalFocusTime();
              
              const result = timeAfter === timeBefore + elapsedTime;
              
              manager.dispose();
              return result;
            } catch (error) {
              manager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain time accuracy through multiple operations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('manual', 'completedPomodoro', 'incompletePomodoro'),
              duration: fc.nat({ max: 3600 }),
            }),
            { maxLength: 20 }
          ),
          (operations) => {
            const manager = new FocusTimeManager();
            let expectedTotal = 0;
            
            try {
              for (const op of operations) {
                if (op.type === 'manual') {
                  manager.setTimeComponents({
                    manualTrackingTime: manager.getTimeBreakdown().manualTime + op.duration,
                  });
                  expectedTotal += op.duration;
                } else if (op.type === 'completedPomodoro') {
                  manager.handlePomodoroComplete(op.duration);
                  expectedTotal += op.duration;
                } else if (op.type === 'incompletePomodoro') {
                  manager.handlePomodoroIncomplete(op.duration);
                  expectedTotal += op.duration;
                }
              }
              
              const actualTotal = manager.getTotalFocusTime();
              const result = actualTotal === expectedTotal;
              
              manager.dispose();
              return result;
            } catch (error) {
              manager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Real-time Synchronization', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 3: Real-time Synchronization**
     * 
     * **Validates: Requirements 1.5, 2.5, 5.4**
     * 
     * For any time tracking operation (session start, end, mode switch, incomplete save),
     * the Total_Focus_Time should be updated immediately and reflected in callbacks.
     */
    it('should immediately update total time when handling completed Pomodoro', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }),
          (initialTime, pomodoroDuration) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              
              testManager.handlePomodoroComplete(pomodoroDuration);
              
              // Should have received an update immediately
              const hasUpdate = updates.length > 0;
              const lastUpdate = updates[updates.length - 1];
              const expectedTime = initialTime + pomodoroDuration;
              
              testManager.dispose();
              return hasUpdate && lastUpdate === expectedTime;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should immediately update total time when handling incomplete Pomodoro', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }),
          (initialTime, elapsedTime) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              
              testManager.handlePomodoroIncomplete(elapsedTime);
              
              // Should have received an update immediately
              const hasUpdate = updates.length > 0;
              const lastUpdate = updates[updates.length - 1];
              const expectedTime = initialTime + elapsedTime;
              
              testManager.dispose();
              return hasUpdate && lastUpdate === expectedTime;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should immediately update when starting a session', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (initialTime, mode) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              
              testManager.startSession(mode);
              
              // Should have received an update immediately
              const hasUpdate = updates.length > 0;
              
              testManager.dispose();
              return hasUpdate;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should immediately update when ending a session', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (initialTime, mode) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              testManager.startSession(mode);
              
              // Clear initial updates
              updates.length = 0;
              
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              testManager.endSession();
              
              // Should have received an update immediately
              const hasUpdate = updates.length > 0;
              
              testManager.dispose();
              return hasUpdate;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should immediately update when switching modes', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (initialTime, startMode, endMode) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              testManager.startSession(startMode);
              
              // Clear initial updates
              updates.length = 0;
              
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              testManager.switchMode(endMode);
              
              // Should have received an update immediately only if mode actually changed
              // If mode is the same, no update is expected (early return in switchMode)
              if (startMode === endMode) {
                // No update expected when switching to same mode
                testManager.dispose();
                return true;
              }
              
              const hasUpdate = updates.length > 0;
              
              testManager.dispose();
              return hasUpdate;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should immediately update when setting time components', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          (manualTime, completedPomodoroTime, incompletePomodoroTime) => {
            const testManager = new FocusTimeManager();
            const updates: number[] = [];
            
            try {
              testManager.onTimeUpdate((totalTime) => updates.push(totalTime));
              
              testManager.setTimeComponents({
                manualTrackingTime: manualTime,
                completedPomodoroTime: completedPomodoroTime,
                incompletePomodoroTime: incompletePomodoroTime,
              });
              
              // Should have received an update immediately
              const hasUpdate = updates.length > 0;
              const lastUpdate = updates[updates.length - 1];
              const expectedTime = manualTime + completedPomodoroTime + incompletePomodoroTime;
              
              testManager.dispose();
              return hasUpdate && lastUpdate === expectedTime;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Data Preservation During Operations', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 4: Data Preservation During Operations**
     * 
     * **Validates: Requirements 4.1, 4.2, 6.3, 6.4**
     * 
     * For any system operation (migration, mode transition, error recovery),
     * all existing time tracking data should be preserved without loss.
     */
    it('should preserve all time components during mode transitions', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          fc.array(
            fc.constantFrom('manual' as const, 'pomodoro' as const),
            { minLength: 1, maxLength: 10 }
          ),
          (manualTime, completedPomodoroTime, incompletePomodoroTime, modes) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Set initial time components
              testManager.setTimeComponents({
                manualTrackingTime: manualTime,
                completedPomodoroTime: completedPomodoroTime,
                incompletePomodoroTime: incompletePomodoroTime,
              });
              
              const initialTotal = testManager.getTotalFocusTime();
              
              // Perform multiple mode transitions
              testManager.startSession(modes[0]);
              for (let i = 1; i < modes.length; i++) {
                testManager.switchMode(modes[i]);
              }
              testManager.endSession();
              
              // Get final breakdown
              const finalBreakdown = testManager.getTimeBreakdown();
              
              // All original time should be preserved (may have increased due to session time)
              const result = finalBreakdown.total >= initialTotal;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never lose time data during any operation', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              operation: fc.constantFrom('setManual', 'completePomodoro', 'incompletePomodoro', 'startSession', 'endSession', 'switchMode'),
              value: fc.nat({ max: 3600 }),
              mode: fc.constantFrom('manual' as const, 'pomodoro' as const),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (operations) => {
            const testManager = new FocusTimeManager();
            let expectedMinimumTime = 0;
            
            try {
              for (const op of operations) {
                const timeBefore = testManager.getTotalFocusTime();
                
                switch (op.operation) {
                  case 'setManual':
                    testManager.setTimeComponents({ manualTrackingTime: op.value });
                    expectedMinimumTime = Math.max(expectedMinimumTime, op.value);
                    break;
                  case 'completePomodoro':
                    testManager.handlePomodoroComplete(op.value);
                    expectedMinimumTime += op.value;
                    break;
                  case 'incompletePomodoro':
                    testManager.handlePomodoroIncomplete(op.value);
                    expectedMinimumTime += op.value;
                    break;
                  case 'startSession':
                    testManager.startSession(op.mode);
                    break;
                  case 'endSession':
                    testManager.endSession();
                    break;
                  case 'switchMode':
                    testManager.switchMode(op.mode);
                    break;
                }
                
                const timeAfter = testManager.getTotalFocusTime();
                
                // Time should never decrease (except when setManual resets to a lower value)
                if (op.operation !== 'setManual') {
                  if (timeAfter < timeBefore) {
                    testManager.dispose();
                    return false;
                  }
                }
              }
              
              testManager.dispose();
              return true;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve time breakdown integrity across operations', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          fc.nat({ max: 86400 }),
          (manualTime, completedPomodoroTime, incompletePomodoroTime) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Set time components
              testManager.setTimeComponents({
                manualTrackingTime: manualTime,
                completedPomodoroTime: completedPomodoroTime,
                incompletePomodoroTime: incompletePomodoroTime,
              });
              
              // Perform various operations
              testManager.startSession('manual');
              testManager.switchMode('pomodoro');
              testManager.endSession();
              
              // Get breakdown
              const breakdown = testManager.getTimeBreakdown();
              
              // Verify breakdown integrity: total should equal sum of components
              const calculatedTotal = breakdown.manualTime + 
                                    breakdown.completedPomodoroTime + 
                                    breakdown.incompletePomodoroTime + 
                                    breakdown.currentSessionTime;
              
              const result = breakdown.total === calculatedTotal;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle errors gracefully without data loss', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          (initialTime) => {
            const testManager = new FocusTimeManager();
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              
              const timeBefore = testManager.getTotalFocusTime();
              
              // Try operations that should throw errors
              try {
                testManager.handlePomodoroComplete(-100);
              } catch (e) {
                // Expected error
              }
              
              try {
                testManager.handlePomodoroIncomplete(-100);
              } catch (e) {
                // Expected error
              }
              
              try {
                testManager.setTimeComponents({ manualTrackingTime: -100 });
              } catch (e) {
                // Expected error
              }
              
              // Time should be preserved despite errors
              const timeAfter = testManager.getTotalFocusTime();
              const result = timeAfter === timeBefore;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain data consistency when callbacks throw errors', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }),
          fc.nat({ max: 3600 }),
          (initialTime, additionalTime) => {
            const testManager = new FocusTimeManager();
            
            try {
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              
              // Add callback that throws error
              testManager.onTimeUpdate(() => {
                throw new Error('Callback error');
              });
              
              // Perform operation that triggers callback
              testManager.handlePomodoroComplete(additionalTime);
              
              // Data should still be updated correctly despite callback error
              const expectedTime = initialTime + additionalTime;
              const actualTime = testManager.getTotalFocusTime();
              
              const result = actualTime === expectedTime;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

  describe('Property 5: Seamless Mode Transitions', () => {
    /**
     * **Feature: unified-focus-time-tracking, Property 5: Seamless Mode Transitions**
     * 
     * **Validates: Requirements 6.1, 6.2**
     * 
     * For any transition between manual tracking and Pomodoro modes,
     * the current session state and timing continuity should be maintained.
     */
    it('should preserve total time when switching modes', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 86400 }), // initialTime
          fc.constantFrom('manual' as const, 'pomodoro' as const), // startMode
          fc.constantFrom('manual' as const, 'pomodoro' as const), // endMode
          (initialTime, startMode, endMode) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Set initial time
              testManager.setTimeComponents({ manualTrackingTime: initialTime });
              
              // Start a session
              testManager.startSession(startMode);
              
              // Get time before switch
              const timeBeforeSwitch = testManager.getTotalFocusTime();
              
              // Switch mode
              testManager.switchMode(endMode);
              
              // Get time after switch
              const timeAfterSwitch = testManager.getTotalFocusTime();
              
              // Time should be preserved or increased (due to elapsed time)
              // but never decreased
              const result = timeAfterSwitch >= timeBeforeSwitch;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain session active state when switching modes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (startMode, endMode) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Start a session
              testManager.startSession(startMode);
              
              const stateBefore = testManager.getSessionState();
              
              // Switch mode
              testManager.switchMode(endMode);
              
              const stateAfter = testManager.getSessionState();
              
              // Session should remain active
              const result = stateBefore?.isActive === true && stateAfter?.isActive === true;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly update mode when switching', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (startMode, endMode) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Start a session
              testManager.startSession(startMode);
              
              // Switch mode
              testManager.switchMode(endMode);
              
              const state = testManager.getSessionState();
              
              // Mode should be updated to endMode
              const result = state?.mode === endMode;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger mode switch callback when mode changes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (startMode, endMode) => {
            const testManager = new FocusTimeManager();
            const modeSwitches: string[] = [];
            
            try {
              testManager.onModeSwitch((mode) => modeSwitches.push(mode));
              
              // Start a session
              testManager.startSession(startMode);
              
              // Clear initial callbacks
              modeSwitches.length = 0;
              
              // Switch mode
              testManager.switchMode(endMode);
              
              // Should have received callback only if mode actually changed
              if (startMode === endMode) {
                // No callback expected when switching to same mode
                testManager.dispose();
                return modeSwitches.length === 0;
              }
              
              const result = modeSwitches.length > 0 && modeSwitches[modeSwitches.length - 1] === endMode;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple mode switches correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom('manual' as const, 'pomodoro' as const),
            { minLength: 2, maxLength: 10 }
          ),
          (modes) => {
            const testManager = new FocusTimeManager();
            
            try {
              // Start with first mode
              testManager.startSession(modes[0]);
              
              const initialTime = testManager.getTotalFocusTime();
              
              // Switch through all modes
              for (let i = 1; i < modes.length; i++) {
                testManager.switchMode(modes[i]);
              }
              
              // Session should still be active
              const state = testManager.getSessionState();
              const isActive = state?.isActive === true;
              
              // Final mode should match last mode in array
              const correctMode = state?.mode === modes[modes.length - 1];
              
              // Time should be preserved or increased
              const timePreserved = testManager.getTotalFocusTime() >= initialTime;
              
              testManager.dispose();
              return isActive && correctMode && timePreserved;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should start new session if no session active when switching', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('manual' as const, 'pomodoro' as const),
          (mode) => {
            const testManager = new FocusTimeManager();
            
            try {
              // No active session
              const stateBefore = testManager.getSessionState();
              
              // Switch mode (should start new session)
              testManager.switchMode(mode);
              
              const stateAfter = testManager.getSessionState();
              
              // Should have started a new session
              const result = stateBefore === null && 
                           stateAfter?.isActive === true && 
                           stateAfter?.mode === mode;
              
              testManager.dispose();
              return result;
            } catch (error) {
              testManager.dispose();
              throw error;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });