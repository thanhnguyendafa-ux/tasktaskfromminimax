/**
 * Core interfaces and data models for Unified Focus Time Tracking
 * 
 * This module defines the TypeScript interfaces for the unified focus time tracking system
 * that combines manual time tracking and Pomodoro sessions into a single, comprehensive
 * tracking approach.
 */

/**
 * Focus Time Manager Interface
 * 
 * The central coordinator that implements unified time tracking logic.
 * Maintains the authoritative total focus time and coordinates between
 * Time Tracker, Tally, and Pomodoro components.
 */
export interface FocusTimeManager {
  // Core time calculation
  getTotalFocusTime(): number;
  getCurrentSessionTime(): number;
  
  // Session management
  startSession(mode: 'manual' | 'pomodoro'): void;
  endSession(): void;
  switchMode(newMode: 'manual' | 'pomodoro'): void;
  
  // Tally support (count up)
  incrementTally(): void;
  decrementTally(): void;
  getTallyCount(): number;
  setTallyGoal(goal: number): void;
  getTallyGoal(): number;
  getTallyProgress(): number; // percentage 0-100
  
  // Pomodoro-specific handling
  handlePomodoroComplete(duration: number): void;
  handlePomodoroIncomplete(elapsedTime: number): void;
  
  // Event notifications
  onTimeUpdate(callback: (totalTime: number) => void): void;
  onModeSwitch(callback: (mode: string) => void): void;
  onTallyUpdate(callback: (count: number) => void): void;
  onTallyGoalReached(callback: () => void): void;
}

/**
 * Enhanced Time Tracker Interface
 * 
 * Extended to handle time from incomplete Pomodoro sessions.
 * Maintains backward compatibility with existing time tracking
 * while adding integration with Pomodoro system.
 */
export interface EnhancedTimeTracker {
  // Existing functionality
  getTotalTime(): number;
  startTracking(): void;
  stopTracking(): void;
  addManualTime(seconds: number): void;
  
  // New functionality for Pomodoro integration
  addIncompleteSessionTime(seconds: number): void;
  getTimeBreakdown(): {
    manualTime: number;
    incompletePomodoros: number;
    total: number;
  };
}

/**
 * Pomodoro Integration Adapter Interface
 * 
 * Bridges the Pomodoro system with the unified tracking.
 * Monitors Pomodoro sessions and provides state queries.
 */
export interface PomodoroAdapter {
  // Session monitoring
  onSessionStart(callback: () => void): void;
  onSessionComplete(callback: (duration: number) => void): void;
  onSessionAbort(callback: (elapsedTime: number) => void): void;
  
  // State queries
  isSessionActive(): boolean;
  getElapsedTime(): number;
  getCompletedCount(): number;
  
  // Session control
  startSession(duration: number): void;
  completeSession(): void;
  abortSession(): void;
}

/**
 * Notification Service Interface
 * 
 * Handles user communication about time tracking changes.
 * Provides feedback for incomplete sessions, mode switches,
 * and time breakdowns.
 */
export interface NotificationService {
  showIncompletePomodoro(elapsedTime: number): void;
  showModeSwitch(fromMode: string, toMode: string): void;
  showTimeBreakdown(breakdown: TimeBreakdown): void;
  showMigrationComplete(migratedData: MigrationSummary): void;
  showError(message: string): void;
}

/**
 * Unified Focus Time Record
 * 
 * Represents a complete focus time record with all time components
 * and metadata. This is the primary data structure for storing
 * unified focus time information.
 */
export interface FocusTimeRecord {
  id: string;
  date: Date;
  
  // Tracking mode for this record
  tracking_mode: 'tally' | 'time_tracker' | 'pomodoro';
  
  // Time components
  manualTrackingTime: number;      // From Time Tracker (seconds)
  completedPomodoroTime: number;   // From completed Pomodoros (seconds)
  incompletePomodoroTime: number;  // From aborted Pomodoros (seconds)
  
  // Tally components
  tallyCount: number;
  tallyGoal: number;
  
  // Calculated fields
  totalFocusTime: number;          // Sum of all components (seconds)
  
  // Metadata
  pomodoroCount: number;           // Completed sessions only
  sessionCount: number;            // Total sessions (manual + pomodoro)
  lastUpdated: Date;
}

/**
 * Session State
 * 
 * Represents the current state of an active focus session.
 * Tracks whether a session is active, the mode being used,
 * and timing information.
 */
export interface SessionState {
  isActive: boolean;
  mode: 'manual' | 'pomodoro';
  startTime: Date;
  currentElapsed: number;
  
  // Pomodoro-specific
  pomodoroTarget?: number;
  pomodoroElapsed?: number;
}

/**
 * Migration Data Structure
 * 
 * Contains all data needed for migrating from the existing
 * dual-tracking system to the unified system. Preserves
 * historical data while calculating unified totals.
 */
export interface MigrationData {
  existingTimeTracker: {
    totalSeconds: number;
    sessions: TimeTrackerSession[];
  };
  existingPomodoro: {
    completedCount: number;
    sessions: PomodoroSession[];
  };
  calculatedTotalTime: number;
  migrationTimestamp: Date;
}

/**
 * Time Tracker Session
 * 
 * Represents a single manual time tracking session.
 * Used in migration and historical data access.
 */
export interface TimeTrackerSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  status: 'active' | 'completed' | 'abandoned';
}

/**
 * Pomodoro Session
 * 
 * Represents a single Pomodoro session.
 * Used in migration and historical data access.
 */
export interface PomodoroSession {
  id: string;
  startTime: Date;
  completedAt: Date | null;
  durationSeconds: number;
  targetDuration: number;
  status: 'in_progress' | 'completed' | 'aborted';
}

/**
 * Time Breakdown
 * 
 * Provides a detailed breakdown of time sources for display
 * in the UI. Shows how total focus time is composed.
 */
export interface TimeBreakdown {
  manualTime: number;
  completedPomodoroTime: number;
  incompletePomodoroTime: number;
  totalTime: number;
  pomodoroCount: number;
  sessionCount: number;
}

/**
 * Migration Summary
 * 
 * Summary information about a completed migration.
 * Used for user notifications and audit trails.
 */
export interface MigrationSummary {
  totalRecordsMigrated: number;
  totalTimePreserved: number;
  pomodoroSessionsPreserved: number;
  manualSessionsPreserved: number;
  migrationDate: Date;
  success: boolean;
  errors?: string[];
}

/**
 * Focus Time Event
 * 
 * Represents an event in the focus time tracking system.
 * Used for event-driven updates and notifications.
 */
export interface FocusTimeEvent {
  type: 'session_start' | 'session_end' | 'mode_switch' | 'time_update' | 'pomodoro_complete' | 'pomodoro_incomplete';
  timestamp: Date;
  data: {
    mode?: 'manual' | 'pomodoro';
    elapsedTime?: number;
    totalTime?: number;
    fromMode?: string;
    toMode?: string;
  };
}

/**
 * Focus Time Configuration
 * 
 * Configuration options for the focus time tracking system.
 * Allows customization of behavior and thresholds.
 */
export interface FocusTimeConfig {
  // Update frequency for real-time display (milliseconds)
  updateIntervalMs: number;
  
  // Minimum session duration to record (seconds)
  minSessionDuration: number;
  
  // Default Pomodoro duration (seconds)
  defaultPomodoroDuration: number;
  
  // Enable notifications
  notificationsEnabled: boolean;
  
  // Auto-save interval (milliseconds)
  autoSaveIntervalMs: number;
}
