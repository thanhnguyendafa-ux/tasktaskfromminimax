/**
 * Enhanced Time Tracker Implementation
 * 
 * Extended to handle time from incomplete Pomodoro sessions.
 * Maintains backward compatibility with existing time tracking
 * while adding integration with Pomodoro system.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import type { EnhancedTimeTracker as IEnhancedTimeTracker } from './types';

/**
 * Implementation of the EnhancedTimeTracker interface.
 * 
 * This class extends the basic time tracking functionality to handle
 * incomplete Pomodoro sessions, maintaining separate tracking for
 * manual time and incomplete Pomodoro time while providing a unified
 * total.
 */
export class EnhancedTimeTracker implements IEnhancedTimeTracker {
  private manualTime: number = 0;
  private incompletePomodoros: number = 0;
  private isTracking: boolean = false;
  private trackingStartTime: Date | null = null;

  /**
   * Get the total tracked time (manual + incomplete Pomodoros).
   * 
   * Requirement 2.4: Record incomplete Pomodoro time with the same
   * precision as manual time tracking.
   * 
   * @returns Total time in seconds
   */
  getTotalTime(): number {
    let total = this.manualTime + this.incompletePomodoros;
    
    // Add current tracking time if active
    if (this.isTracking && this.trackingStartTime) {
      const now = new Date();
      const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
      total += Math.floor(elapsedMs / 1000);
    }
    
    return total;
  }

  /**
   * Start manual time tracking.
   * 
   * If tracking is already active, this will restart tracking from now.
   */
  startTracking(): void {
    // If already tracking, save the current session first
    if (this.isTracking && this.trackingStartTime) {
      const now = new Date();
      const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
      this.manualTime += Math.floor(elapsedMs / 1000);
    }
    
    this.isTracking = true;
    this.trackingStartTime = new Date();
  }

  /**
   * Stop manual time tracking.
   * 
   * Saves the elapsed time to manual time component.
   */
  stopTracking(): void {
    if (!this.isTracking || !this.trackingStartTime) {
      return;
    }
    
    const now = new Date();
    const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
    this.manualTime += Math.floor(elapsedMs / 1000);
    
    this.isTracking = false;
    this.trackingStartTime = null;
  }

  /**
   * Add time from an incomplete Pomodoro session.
   * 
   * Requirement 2.1: Save elapsed time when user aborts a Pomodoro.
   * Requirement 2.4: Maintain same precision as manual tracking.
   * 
   * @param seconds - The elapsed time from the incomplete Pomodoro
   */
  addIncompleteSessionTime(seconds: number): void {
    if (seconds < 0) {
      throw new Error('Incomplete session time cannot be negative');
    }
    
    // Requirement 2.4: Use same precision (seconds) as manual tracking
    this.incompletePomodoros += Math.floor(seconds);
  }

  /**
   * Add manual time directly.
   * 
   * @param seconds - The time to add in seconds
   */
  addManualTime(seconds: number): void {
    if (seconds < 0) {
      throw new Error('Manual time cannot be negative');
    }
    this.manualTime += Math.floor(seconds);
  }

  /**
   * Get a detailed breakdown of time by source.
   * 
   * @returns Object with time breakdown
   */
  getTimeBreakdown(): {
    manualTime: number;
    incompletePomodoros: number;
    total: number;
  } {
    let currentSessionTime = 0;
    
    if (this.isTracking && this.trackingStartTime) {
      const now = new Date();
      const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
      currentSessionTime = Math.floor(elapsedMs / 1000);
    }
    
    return {
      manualTime: this.manualTime + currentSessionTime,
      incompletePomodoros: this.incompletePomodoros,
      total: this.manualTime + currentSessionTime + this.incompletePomodoros,
    };
  }

  /**
   * Check if tracking is currently active.
   * 
   * @returns True if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get the elapsed time of the current tracking session.
   * 
   * @returns Elapsed time in seconds, or 0 if not tracking
   */
  getCurrentSessionTime(): number {
    if (!this.isTracking || !this.trackingStartTime) {
      return 0;
    }
    
    const now = new Date();
    const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
    return Math.floor(elapsedMs / 1000);
  }

  /**
   * Set time components directly (useful for migration/testing).
   * 
   * @param times - Object with time components
   */
  setTimeComponents(times: {
    manualTime?: number;
    incompletePomodoros?: number;
  }): void {
    if (times.manualTime !== undefined) {
      if (times.manualTime < 0) {
        throw new Error('Manual time cannot be negative');
      }
      this.manualTime = Math.floor(times.manualTime);
    }
    
    if (times.incompletePomodoros !== undefined) {
      if (times.incompletePomodoros < 0) {
        throw new Error('Incomplete Pomodoros time cannot be negative');
      }
      this.incompletePomodoros = Math.floor(times.incompletePomodoros);
    }
  }

  /**
   * Reset all time tracking data.
   * 
   * Stops any active tracking and clears all accumulated time.
   */
  reset(): void {
    this.isTracking = false;
    this.trackingStartTime = null;
    this.manualTime = 0;
    this.incompletePomodoros = 0;
  }

  /**
   * Get the manual time component only (excluding incomplete Pomodoros).
   * 
   * @returns Manual time in seconds
   */
  getManualTime(): number {
    let total = this.manualTime;
    
    if (this.isTracking && this.trackingStartTime) {
      const now = new Date();
      const elapsedMs = now.getTime() - this.trackingStartTime.getTime();
      total += Math.floor(elapsedMs / 1000);
    }
    
    return total;
  }

  /**
   * Get the incomplete Pomodoros time component only.
   * 
   * @returns Incomplete Pomodoros time in seconds
   */
  getIncompletePomodoros(): number {
    return this.incompletePomodoros;
  }
}
