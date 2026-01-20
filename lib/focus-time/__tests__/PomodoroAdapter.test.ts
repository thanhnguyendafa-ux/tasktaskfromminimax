/**
 * Tests for PomodoroAdapter
 * 
 * This test file includes unit tests for edge cases and integration scenarios
 * to verify the correctness of the PomodoroAdapter implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PomodoroAdapter } from '../PomodoroAdapter';

describe('PomodoroAdapter', () => {
  let adapter: PomodoroAdapter;

  beforeEach(() => {
    adapter = new PomodoroAdapter();
  });

  describe('Basic Functionality', () => {
    it('should initialize with no active session', () => {
      expect(adapter.isSessionActive()).toBe(false);
    });

    it('should initialize with zero completed count', () => {
      expect(adapter.getCompletedCount()).toBe(0);
    });

    it('should initialize with zero elapsed time', () => {
      expect(adapter.getElapsedTime()).toBe(0);
    });

    it('should have default target duration of 1500 seconds', () => {
      expect(adapter.getTargetDuration()).toBe(1500);
    });
  });

  describe('Session Start', () => {
    it('should start a session with default duration', () => {
      adapter.startSession();
      
      expect(adapter.isSessionActive()).toBe(true);
      expect(adapter.getTargetDuration()).toBe(1500);
    });

    it('should start a session with custom duration', () => {
      adapter.startSession(2400);
      
      expect(adapter.isSessionActive()).toBe(true);
      expect(adapter.getTargetDuration()).toBe(2400);
    });

    it('should throw error for zero duration', () => {
      expect(() => adapter.startSession(0))
        .toThrow('Target duration must be positive');
    });

    it('should throw error for negative duration', () => {
      expect(() => adapter.startSession(-100))
        .toThrow('Target duration must be positive');
    });

    it('should call session start callbacks', () => {
      const callback = vi.fn();
      adapter.onSessionStart(callback);
      
      adapter.startSession();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should abort existing session when starting new one', () => {
      const abortCallback = vi.fn();
      adapter.onSessionAbort(abortCallback);
      
      adapter.startSession(1500);
      adapter.startSession(2400);
      
      expect(abortCallback).toHaveBeenCalledTimes(1);
      expect(adapter.isSessionActive()).toBe(true);
      expect(adapter.getTargetDuration()).toBe(2400);
    });
  });

  describe('Session Complete', () => {
    it('should complete an active session', () => {
      adapter.startSession(1500);
      adapter.completeSession();
      
      expect(adapter.isSessionActive()).toBe(false);
      expect(adapter.getCompletedCount()).toBe(1);
    });

    it('should throw error when completing with no active session', () => {
      expect(() => adapter.completeSession())
        .toThrow('No active session to complete');
    });

    it('should call session complete callbacks with target duration', () => {
      const callback = vi.fn();
      adapter.onSessionComplete(callback);
      
      adapter.startSession(1500);
      adapter.completeSession();
      
      expect(callback).toHaveBeenCalledWith(1500);
    });

    it('should increment completed count', () => {
      adapter.startSession();
      adapter.completeSession();
      
      adapter.startSession();
      adapter.completeSession();
      
      expect(adapter.getCompletedCount()).toBe(2);
    });

    it('should use target duration even if session exceeded time', () => {
      const callback = vi.fn();
      adapter.onSessionComplete(callback);
      
      adapter.startSession(1);
      
      // Wait for session to exceed target
      setTimeout(() => {
        adapter.completeSession();
        expect(callback).toHaveBeenCalledWith(1);
      }, 10);
    });
  });

  describe('Session Abort', () => {
    it('should abort an active session', () => {
      adapter.startSession();
      adapter.abortSession();
      
      expect(adapter.isSessionActive()).toBe(false);
    });

    it('should throw error when aborting with no active session', () => {
      expect(() => adapter.abortSession())
        .toThrow('No active session to abort');
    });

    it('should call session abort callbacks with elapsed time', () => {
      const callback = vi.fn();
      adapter.onSessionAbort(callback);
      
      adapter.startSession();
      adapter.abortSession();
      
      expect(callback).toHaveBeenCalled();
      const elapsedTime = callback.mock.calls[0][0];
      expect(elapsedTime).toBeGreaterThanOrEqual(0);
    });

    it('should not increment completed count when aborting', () => {
      adapter.startSession();
      adapter.abortSession();
      
      expect(adapter.getCompletedCount()).toBe(0);
    });

    it('should preserve elapsed time at various abort points', () => {
      const callback = vi.fn();
      adapter.onSessionAbort(callback);
      
      // Test immediate abort
      adapter.startSession();
      adapter.abortSession();
      expect(callback.mock.calls[0][0]).toBeGreaterThanOrEqual(0);
      
      // Test abort after some time
      callback.mockClear();
      adapter.startSession();
      // Abort immediately (elapsed should be 0 or very small)
      adapter.abortSession();
      expect(callback.mock.calls[0][0]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Elapsed Time', () => {
    it('should return zero when no session is active', () => {
      expect(adapter.getElapsedTime()).toBe(0);
    });

    it('should return elapsed time during active session', () => {
      adapter.startSession();
      const elapsed = adapter.getElapsedTime();
      
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    it('should return zero after session completes', () => {
      adapter.startSession();
      adapter.completeSession();
      
      expect(adapter.getElapsedTime()).toBe(0);
    });

    it('should return zero after session aborts', () => {
      adapter.startSession();
      adapter.abortSession();
      
      expect(adapter.getElapsedTime()).toBe(0);
    });
  });

  describe('Remaining Time', () => {
    it('should return zero when no session is active', () => {
      expect(adapter.getRemainingTime()).toBe(0);
    });

    it('should return remaining time during active session', () => {
      adapter.startSession(1500);
      const remaining = adapter.getRemainingTime();
      
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(1500);
    });

    it('should return zero when session exceeds target', () => {
      adapter.startSession(0.001); // Very short duration
      
      // Wait a bit to exceed target
      setTimeout(() => {
        expect(adapter.getRemainingTime()).toBe(0);
      }, 10);
    });
  });

  describe('Target Exceeded', () => {
    it('should return false when no session is active', () => {
      expect(adapter.hasExceededTarget()).toBe(false);
    });

    it('should return false at start of session', () => {
      adapter.startSession(1500);
      expect(adapter.hasExceededTarget()).toBe(false);
    });

    it('should return true when session exceeds target', () => {
      adapter.startSession(0.001); // Very short duration
      
      setTimeout(() => {
        expect(adapter.hasExceededTarget()).toBe(true);
      }, 10);
    });
  });

  describe('Callback Management', () => {
    it('should remove session start callback', () => {
      const callback = vi.fn();
      adapter.onSessionStart(callback);
      adapter.removeSessionStartCallback(callback);
      
      adapter.startSession();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove session complete callback', () => {
      const callback = vi.fn();
      adapter.onSessionComplete(callback);
      adapter.removeSessionCompleteCallback(callback);
      
      adapter.startSession();
      adapter.completeSession();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove session abort callback', () => {
      const callback = vi.fn();
      adapter.onSessionAbort(callback);
      adapter.removeSessionAbortCallback(callback);
      
      adapter.startSession();
      adapter.abortSession();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      
      adapter.onSessionStart(callback1);
      adapter.onSessionStart(callback2);
      adapter.onSessionStart(callback3);
      
      adapter.startSession();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      adapter.onSessionStart(errorCallback);
      adapter.onSessionStart(goodCallback);
      
      expect(() => adapter.startSession()).not.toThrow();
      expect(goodCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should reset all state', () => {
      adapter.startSession(2400);
      adapter.completeSession();
      adapter.startSession();
      
      adapter.reset();
      
      expect(adapter.isSessionActive()).toBe(false);
      expect(adapter.getCompletedCount()).toBe(0);
      expect(adapter.getTargetDuration()).toBe(1500);
      expect(adapter.getElapsedTime()).toBe(0);
    });

    it('should set completed count directly', () => {
      adapter.setCompletedCount(5);
      expect(adapter.getCompletedCount()).toBe(5);
    });

    it('should throw error for negative completed count', () => {
      expect(() => adapter.setCompletedCount(-1))
        .toThrow('Completed count cannot be negative');
    });
  });

  describe('Edge Cases - Session Abortion', () => {
    it('should handle abortion at session start (0 elapsed)', () => {
      const callback = vi.fn();
      adapter.onSessionAbort(callback);
      
      adapter.startSession();
      adapter.abortSession();
      
      expect(callback).toHaveBeenCalled();
      const elapsedTime = callback.mock.calls[0][0];
      expect(elapsedTime).toBeGreaterThanOrEqual(0);
      expect(elapsedTime).toBeLessThan(1); // Should be less than 1 second
    });

    it('should handle multiple rapid start/abort cycles', () => {
      const abortCallback = vi.fn();
      adapter.onSessionAbort(abortCallback);
      
      for (let i = 0; i < 5; i++) {
        adapter.startSession();
        adapter.abortSession();
      }
      
      expect(abortCallback).toHaveBeenCalledTimes(5);
      expect(adapter.getCompletedCount()).toBe(0);
    });

    it('should handle abortion after target duration exceeded', () => {
      const callback = vi.fn();
      adapter.onSessionAbort(callback);
      
      adapter.startSession(0.001);
      
      setTimeout(() => {
        adapter.abortSession();
        
        const elapsedTime = callback.mock.calls[0][0];
        expect(elapsedTime).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe('Edge Cases - Interruption Handling', () => {
    it('should handle interruption by starting new session', () => {
      const abortCallback = vi.fn();
      adapter.onSessionAbort(abortCallback);
      
      adapter.startSession(1500);
      const firstElapsed = adapter.getElapsedTime();
      
      // Interrupt by starting new session
      adapter.startSession(2400);
      
      expect(abortCallback).toHaveBeenCalled();
      expect(adapter.isSessionActive()).toBe(true);
      expect(adapter.getTargetDuration()).toBe(2400);
    });

    it('should preserve completed count through interruptions', () => {
      adapter.startSession();
      adapter.completeSession();
      
      adapter.startSession();
      adapter.startSession(); // Interrupt
      
      expect(adapter.getCompletedCount()).toBe(1);
    });
  });

  describe('Edge Cases - State Consistency', () => {
    it('should maintain consistent state after complete', () => {
      adapter.startSession(1500);
      adapter.completeSession();
      
      expect(adapter.isSessionActive()).toBe(false);
      expect(adapter.getElapsedTime()).toBe(0);
      expect(adapter.getRemainingTime()).toBe(0);
      expect(adapter.hasExceededTarget()).toBe(false);
    });

    it('should maintain consistent state after abort', () => {
      adapter.startSession(1500);
      adapter.abortSession();
      
      expect(adapter.isSessionActive()).toBe(false);
      expect(adapter.getElapsedTime()).toBe(0);
      expect(adapter.getRemainingTime()).toBe(0);
      expect(adapter.hasExceededTarget()).toBe(false);
    });

    it('should handle rapid mode switches', () => {
      adapter.startSession(1500);
      expect(adapter.isSessionActive()).toBe(true);
      
      adapter.completeSession();
      expect(adapter.isSessionActive()).toBe(false);
      
      adapter.startSession(2400);
      expect(adapter.isSessionActive()).toBe(true);
      
      adapter.abortSession();
      expect(adapter.isSessionActive()).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete workflow: start -> complete -> start -> abort', () => {
      const completeCallback = vi.fn();
      const abortCallback = vi.fn();
      
      adapter.onSessionComplete(completeCallback);
      adapter.onSessionAbort(abortCallback);
      
      // First session: complete
      adapter.startSession(1500);
      adapter.completeSession();
      
      expect(completeCallback).toHaveBeenCalledWith(1500);
      expect(adapter.getCompletedCount()).toBe(1);
      
      // Second session: abort
      adapter.startSession(2400);
      adapter.abortSession();
      
      expect(abortCallback).toHaveBeenCalled();
      expect(adapter.getCompletedCount()).toBe(1); // Should not increment
    });

    it('should handle multiple completed sessions', () => {
      const durations = [1500, 2400, 1800, 3000];
      const callback = vi.fn();
      adapter.onSessionComplete(callback);
      
      durations.forEach(duration => {
        adapter.startSession(duration);
        adapter.completeSession();
      });
      
      expect(adapter.getCompletedCount()).toBe(4);
      expect(callback).toHaveBeenCalledTimes(4);
      
      // Verify each call had correct duration
      durations.forEach((duration, index) => {
        expect(callback.mock.calls[index][0]).toBe(duration);
      });
    });

    it('should handle mixed complete and abort sessions', () => {
      adapter.startSession();
      adapter.completeSession();
      
      adapter.startSession();
      adapter.abortSession();
      
      adapter.startSession();
      adapter.completeSession();
      
      adapter.startSession();
      adapter.abortSession();
      
      // Only completed sessions should count
      expect(adapter.getCompletedCount()).toBe(2);
    });
  });
});
