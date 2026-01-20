/**
 * Pomodoro Integration Adapter Implementation
 * 
 * Bridges the Pomodoro system with the unified tracking.
 * Monitors Pomodoro sessions and provides state queries.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

import type { PomodoroAdapter as IPomodoroAdapter } from './types';

/**
 * Implementation of the PomodoroAdapter interface.
 * 
 * This class serves as a bridge between the existing Pomodoro system
 * and the unified focus time tracking. It monitors Pomodoro sessions
 * and provides callbacks for session events.
 */
export class PomodoroAdapter implements IPomodoroAdapter {
  private sessionActive: boolean = false;
  private sessionStartTime: Date | null = null;
  private completedCount: number = 0;
  private targetDuration: number = 1500; // Default 25 minutes
  
  private sessionStartCallbacks: Array<() => void> = [];
  private sessionCompleteCallbacks: Array<(duration: number) => void> = [];
  private sessionAbortCallbacks: Array<(elapsedTime: number) => void> = [];

  /**
   * Register a callback for session start events.
   * 
   * @param callback - Function to call when a session starts
   */
  onSessionStart(callback: () => void): void {
    this.sessionStartCallbacks.push(callback);
  }

  /**
   * Register a callback for session complete events.
   * 
   * Requirement 2.2: Handle completed Pomodoro sessions.
   * 
   * @param callback - Function to call when a session completes
   */
  onSessionComplete(callback: (duration: number) => void): void {
    this.sessionCompleteCallbacks.push(callback);
  }

  /**
   * Register a callback for session abort events.
   * 
   * Requirement 2.1: Handle aborted Pomodoro sessions.
   * 
   * @param callback - Function to call when a session is aborted
   */
  onSessionAbort(callback: (elapsedTime: number) => void): void {
    this.sessionAbortCallbacks.push(callback);
  }

  /**
   * Check if a Pomodoro session is currently active.
   * 
   * @returns True if a session is active
   */
  isSessionActive(): boolean {
    return this.sessionActive;
  }

  /**
   * Get the elapsed time of the current session.
   * 
   * @returns Elapsed time in seconds, or 0 if no active session
   */
  getElapsedTime(): number {
    if (!this.sessionActive || !this.sessionStartTime) {
      return 0;
    }
    
    const now = new Date();
    const elapsedMs = now.getTime() - this.sessionStartTime.getTime();
    return Math.floor(elapsedMs / 1000);
  }

  /**
   * Get the count of completed Pomodoro sessions.
   * 
   * @returns Number of completed sessions
   */
  getCompletedCount(): number {
    return this.completedCount;
  }

  /**
   * Start a new Pomodoro session.
   * 
   * @param targetDuration - Target duration in seconds (default 1500 = 25 minutes)
   */
  startSession(targetDuration: number = 1500): void {
    if (targetDuration <= 0) {
      throw new Error('Target duration must be positive');
    }
    
    // If a session is already active, abort it first
    if (this.sessionActive) {
      this.abortSession();
    }
    
    this.sessionActive = true;
    this.sessionStartTime = new Date();
    this.targetDuration = targetDuration;
    
    // Notify listeners
    this.notifySessionStart();
  }

  /**
   * Complete the current Pomodoro session.
   * 
   * Requirement 2.2: Track completed Pomodoro sessions.
   */
  completeSession(): void {
    if (!this.sessionActive) {
      throw new Error('No active session to complete');
    }
    
    const elapsedTime = this.getElapsedTime();
    
    // Use target duration for completed sessions
    const duration = this.targetDuration;
    
    this.completedCount++;
    this.sessionActive = false;
    this.sessionStartTime = null;
    
    // Notify listeners
    this.notifySessionComplete(duration);
  }

  /**
   * Abort the current Pomodoro session.
   * 
   * Requirement 2.1: Handle aborted sessions and preserve elapsed time.
   * Requirement 2.3: Preserve elapsed time without affecting Pomodoro count.
   */
  abortSession(): void {
    if (!this.sessionActive) {
      throw new Error('No active session to abort');
    }
    
    const elapsedTime = this.getElapsedTime();
    
    this.sessionActive = false;
    this.sessionStartTime = null;
    
    // Requirement 2.3: Don't increment completed count for aborted sessions
    
    // Notify listeners with elapsed time
    this.notifySessionAbort(elapsedTime);
  }

  /**
   * Get the target duration for the current or last session.
   * 
   * @returns Target duration in seconds
   */
  getTargetDuration(): number {
    return this.targetDuration;
  }

  /**
   * Get the remaining time in the current session.
   * 
   * @returns Remaining time in seconds, or 0 if no active session
   */
  getRemainingTime(): number {
    if (!this.sessionActive) {
      return 0;
    }
    
    const elapsed = this.getElapsedTime();
    const remaining = this.targetDuration - elapsed;
    
    return Math.max(0, remaining);
  }

  /**
   * Check if the current session has exceeded its target duration.
   * 
   * @returns True if session is active and has exceeded target
   */
  hasExceededTarget(): boolean {
    if (!this.sessionActive) {
      return false;
    }
    
    return this.getElapsedTime() >= this.targetDuration;
  }

  /**
   * Remove a session start callback.
   * 
   * @param callback - The callback to remove
   */
  removeSessionStartCallback(callback: () => void): void {
    const index = this.sessionStartCallbacks.indexOf(callback);
    if (index > -1) {
      this.sessionStartCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove a session complete callback.
   * 
   * @param callback - The callback to remove
   */
  removeSessionCompleteCallback(callback: (duration: number) => void): void {
    const index = this.sessionCompleteCallbacks.indexOf(callback);
    if (index > -1) {
      this.sessionCompleteCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove a session abort callback.
   * 
   * @param callback - The callback to remove
   */
  removeSessionAbortCallback(callback: (elapsedTime: number) => void): void {
    const index = this.sessionAbortCallbacks.indexOf(callback);
    if (index > -1) {
      this.sessionAbortCallbacks.splice(index, 1);
    }
  }

  /**
   * Reset the adapter state (for testing/migration).
   */
  reset(): void {
    this.sessionActive = false;
    this.sessionStartTime = null;
    this.completedCount = 0;
    this.targetDuration = 1500;
  }

  /**
   * Set the completed count directly (for migration/testing).
   * 
   * @param count - The completed count to set
   */
  setCompletedCount(count: number): void {
    if (count < 0) {
      throw new Error('Completed count cannot be negative');
    }
    this.completedCount = count;
  }

  /**
   * Notify all session start listeners.
   */
  private notifySessionStart(): void {
    this.sessionStartCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in session start callback:', error);
      }
    });
  }

  /**
   * Notify all session complete listeners.
   */
  private notifySessionComplete(duration: number): void {
    this.sessionCompleteCallbacks.forEach(callback => {
      try {
        callback(duration);
      } catch (error) {
        console.error('Error in session complete callback:', error);
      }
    });
  }

  /**
   * Notify all session abort listeners.
   */
  private notifySessionAbort(elapsedTime: number): void {
    this.sessionAbortCallbacks.forEach(callback => {
      try {
        callback(elapsedTime);
      } catch (error) {
        console.error('Error in session abort callback:', error);
      }
    });
  }
}
