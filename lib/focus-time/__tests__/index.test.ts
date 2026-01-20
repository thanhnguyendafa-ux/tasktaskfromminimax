/**
 * Integration tests for the focus-time module
 * 
 * Verifies that all exports are available and can be imported correctly.
 */

import { describe, it, expect } from 'vitest';
import * as FocusTime from '../index';

describe('Focus Time Module Exports', () => {
  it('should export all type definitions', () => {
    // This test verifies that the module exports are available
    // TypeScript will catch any missing exports at compile time
    
    // We can't directly test type exports at runtime, but we can verify
    // that the module itself is importable and has the expected structure
    expect(FocusTime).toBeDefined();
  });

  it('should allow creating objects with exported types', () => {
    // Verify that we can use the exported types to create objects
    const record: FocusTime.FocusTimeRecord = {
      id: 'test-1',
      date: new Date(),
      manualTrackingTime: 1000,
      completedPomodoroTime: 2000,
      incompletePomodoroTime: 500,
      totalFocusTime: 3500,
      pomodoroCount: 2,
      sessionCount: 3,
      lastUpdated: new Date(),
    };

    expect(record.totalFocusTime).toBe(3500);
  });

  it('should allow creating session state objects', () => {
    const state: FocusTime.SessionState = {
      isActive: true,
      mode: 'manual',
      startTime: new Date(),
      currentElapsed: 120,
    };

    expect(state.isActive).toBe(true);
    expect(state.mode).toBe('manual');
  });

  it('should allow creating time breakdown objects', () => {
    const breakdown: FocusTime.TimeBreakdown = {
      manualTime: 1800,
      completedPomodoroTime: 3000,
      incompletePomodoroTime: 600,
      totalTime: 5400,
      pomodoroCount: 2,
      sessionCount: 3,
    };

    expect(breakdown.totalTime).toBe(5400);
  });

  it('should allow creating migration data objects', () => {
    const migrationData: FocusTime.MigrationData = {
      existingTimeTracker: {
        totalSeconds: 5400,
        sessions: [],
      },
      existingPomodoro: {
        completedCount: 3,
        sessions: [],
      },
      calculatedTotalTime: 9900,
      migrationTimestamp: new Date(),
    };

    expect(migrationData.calculatedTotalTime).toBe(9900);
  });

  it('should allow creating focus time config objects', () => {
    const config: FocusTime.FocusTimeConfig = {
      updateIntervalMs: 1000,
      minSessionDuration: 60,
      defaultPomodoroDuration: 1500,
      notificationsEnabled: true,
      autoSaveIntervalMs: 30000,
    };

    expect(config.updateIntervalMs).toBe(1000);
    expect(config.defaultPomodoroDuration).toBe(1500);
  });
});
