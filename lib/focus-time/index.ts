/**
 * Unified Focus Time Tracking Module
 * 
 * This module provides a unified approach to focus time tracking that combines
 * manual time tracking and Pomodoro sessions into a single, comprehensive system.
 * 
 * @module focus-time
 */

// Export all types and interfaces
export type {
  FocusTimeManager as IFocusTimeManager,
  NotificationService,
  FocusTimeRecord,
  SessionState,
  MigrationData,
  TimeTrackerSession,
  PomodoroSession,
  TimeBreakdown,
  MigrationSummary,
  FocusTimeEvent,
  FocusTimeConfig,
} from './types';

// Export implementations
export { FocusTimeManager } from './FocusTimeManager';
export { EnhancedTimeTracker } from './EnhancedTimeTracker';
export { PomodoroAdapter } from './PomodoroAdapter';
