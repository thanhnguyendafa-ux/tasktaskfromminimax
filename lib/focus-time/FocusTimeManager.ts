/**
 * Focus Time Manager Implementation
 * 
 * The central coordinator that implements unified time tracking logic.
 * Maintains the authoritative total focus time and coordinates between
 * Time Tracker and Pomodoro components.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

import type { FocusTimeManager as IFocusTimeManager, SessionState, EnhancedTimeTracker, PomodoroAdapter, NotificationService } from './types';

/**
 * Implementation of the FocusTimeManager interface.
 * 
 * This class serves as the single source of truth for total focus time,
 * combining manual tracking time, completed Pomodoro time, and incomplete
 * Pomodoro time into a unified calculation.
 */
export class FocusTimeManager implements IFocusTimeManager {
  private manualTrackingTime: number = 0;
  private completedPomodoroTime: number = 0;
  private incompletePomodoroTime: number = 0;
  
  private tallyCount: number = 0;
  private tallyGoal: number = 0;
  
  private sessionState: SessionState | null = null;
  private sessionStartTime: Date | null = null;
  
  private tracker: EnhancedTimeTracker;
  private pomodoroAdapter: PomodoroAdapter;
  private notificationService: NotificationService;
  
  private timeUpdateCallbacks: Array<(totalTime: number) => void> = [];
  private modeSwitchCallbacks: Array<(mode: string) => void> = [];
  private tallyUpdateCallbacks: Array<(count: number) => void> = [];
  private tallyGoalReachedCallbacks: Array<() => void> = [];
  
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    tracker?: EnhancedTimeTracker,
    pomodoroAdapter?: PomodoroAdapter,
    notificationService?: NotificationService
  ) {
    this.tracker = tracker || this.createDefaultTracker();
    this.pomodoroAdapter = pomodoroAdapter || this.createDefaultPomodoroAdapter();
    this.notificationService = notificationService || this.createDefaultNotificationService();
  }

  private createDefaultTracker(): EnhancedTimeTracker {
    return {
      getTotalTime: () => 0,
      startTracking: () => {},
      stopTracking: () => {},
      addManualTime: () => {},
      addIncompleteSessionTime: () => {},
      getTimeBreakdown: () => ({ manualTime: 0, incompletePomodoros: 0, total: 0 })
    };
  }

  private createDefaultPomodoroAdapter(): PomodoroAdapter {
    return {
      onSessionStart: () => {},
      onSessionComplete: () => {},
      onSessionAbort: () => {},
      isSessionActive: () => false,
      getElapsedTime: () => 0,
      getCompletedCount: () => 0,
      startSession: () => {},
      completeSession: () => {},
      abortSession: () => {}
    };
  }

  private createDefaultNotificationService(): NotificationService {
    return {
      showIncompletePomodoro: () => {},
      showModeSwitch: () => {},
      showTimeBreakdown: () => {},
      showMigrationComplete: () => {},
      showError: () => {}
    };
  }

  /**
   * Get the total focus time across all tracking methods.
   * 
   * Requirement 1.1: Calculate Total_Focus_Time as the sum of Time_Tracker 
   * seconds and all Pomodoro session time.
   * 
   * @returns Total focus time in seconds
   */
  getTotalFocusTime(): number {
    const baseTime = this.manualTrackingTime + 
                     this.completedPomodoroTime + 
                     this.incompletePomodoroTime;
    
    // Add current session time if active
    const currentSessionTime = this.getCurrentSessionTime();
    
    return baseTime + currentSessionTime;
  }

  /**
   * Get the elapsed time of the current session.
   * 
   * @returns Current session time in seconds, or 0 if no active session
   */
  getCurrentSessionTime(): number {
    if (!this.sessionState || !this.sessionState.isActive || !this.sessionStartTime) {
      return 0;
    }
    
    const now = new Date();
    const elapsedMs = now.getTime() - this.sessionStartTime.getTime();
    return Math.floor(elapsedMs / 1000);
  }

  /**
   * Start a new focus session.
   * 
   * Requirement 1.5: Update Total_Focus_Time in real-time during active sessions.
   * 
   * @param mode - The tracking mode ('manual' or 'pomodoro')
   */
  startSession(mode: 'manual' | 'pomodoro'): void {
    // End any existing session first
    if (this.sessionState?.isActive) {
      this.endSession();
    }
    
    this.sessionStartTime = new Date();
    this.sessionState = {
      isActive: true,
      mode,
      startTime: this.sessionStartTime,
      currentElapsed: 0,
    };
    
    // Start real-time updates (every second)
    this.startRealTimeUpdates();
    
    // Notify listeners
    this.notifyTimeUpdate();
  }

  /**
   * End the current focus session.
   * 
   * Saves the elapsed time to the appropriate time component based on mode.
   */
  endSession(): void {
    if (!this.sessionState || !this.sessionState.isActive) {
      return;
    }
    
    const elapsedTime = this.getCurrentSessionTime();
    
    // Save time to appropriate component
    if (this.sessionState.mode === 'manual') {
      this.manualTrackingTime += elapsedTime;
    } else if (this.sessionState.mode === 'pomodoro') {
      // For pomodoro mode, time is added via handlePomodoroComplete or handlePomodoroIncomplete
      // This handles the case where endSession is called directly
      this.incompletePomodoroTime += elapsedTime;
    }
    
    // Clear session state
    this.sessionState = {
      ...this.sessionState,
      isActive: false,
    };
    this.sessionStartTime = null;
    
    // Stop real-time updates
    this.stopRealTimeUpdates();
    
    // Notify listeners of final time
    this.notifyTimeUpdate();
  }

  /**
   * Switch between tracking modes.
   * 
   * Requirement 6.1: Preserve current session state when switching modes.
   * 
   * @param newMode - The new tracking mode
   */
  switchMode(newMode: 'manual' | 'pomodoro'): void {
    if (!this.sessionState) {
      // No active session, just start a new one
      this.startSession(newMode);
      return;
    }
    
    const oldMode = this.sessionState.mode;
    
    if (oldMode === newMode) {
      // No change needed
      return;
    }
    
    // Save current session time before switching
    const elapsedTime = this.getCurrentSessionTime();
    
    if (oldMode === 'manual') {
      this.manualTrackingTime += elapsedTime;
    } else if (oldMode === 'pomodoro') {
      this.manualTrackingTime += elapsedTime;
    }
    
    // Update mode and reset session start time
    this.sessionStartTime = new Date();
    this.sessionState = {
      ...this.sessionState,
      mode: newMode,
      startTime: this.sessionStartTime,
      currentElapsed: 0,
    };
    
    // Notify mode switch
    this.notifyModeSwitch(newMode);
    this.notifyTimeUpdate();
  }

  /**
   * Handle a completed Pomodoro session.
   * 
   * Requirement 1.2: Add full Pomodoro duration to Total_Focus_Time when completed.
   * 
   * @param duration - The duration of the completed Pomodoro in seconds
   */
  handlePomodoroComplete(duration: number): void {
    if (duration < 0) {
      throw new Error('Pomodoro duration cannot be negative');
    }
    
    this.completedPomodoroTime += duration;
    
    // End the current session if it's a pomodoro session
    if (this.sessionState?.isActive && this.sessionState.mode === 'pomodoro') {
      this.sessionState = {
        ...this.sessionState,
        isActive: false,
      };
      this.sessionStartTime = null;
      this.stopRealTimeUpdates();
    }
    
    // Requirement 1.5: Update immediately
    this.notifyTimeUpdate();
  }

  /**
   * Handle an incomplete Pomodoro session.
   * 
   * Requirement 1.3: Add elapsed time to Total_Focus_Time when incomplete.
   * Requirement 2.1: Save elapsed time when user aborts a Pomodoro.
   * 
   * @param elapsedTime - The elapsed time of the incomplete Pomodoro in seconds
   */
  handlePomodoroIncomplete(elapsedTime: number): void {
    if (elapsedTime < 0) {
      throw new Error('Elapsed time cannot be negative');
    }
    
    this.incompletePomodoroTime += elapsedTime;
    
    // End the current session if it's a pomodoro session
    if (this.sessionState?.isActive && this.sessionState.mode === 'pomodoro') {
      this.sessionState = {
        ...this.sessionState,
        isActive: false,
      };
      this.sessionStartTime = null;
      this.stopRealTimeUpdates();
    }
    
    // Requirement 2.5: Update immediately
    this.notifyTimeUpdate();
  }

  /**
   * Increment the tally count by 1.
   */
  incrementTally(): void {
    this.tallyCount++;
    this.notifyTallyUpdate();
    
    // Check if goal is reached
    if (this.tallyGoal > 0 && this.tallyCount >= this.tallyGoal) {
      this.notifyTallyGoalReached();
    }
  }

  /**
   * Decrement the tally count by 1.
   */
  decrementTally(): void {
    if (this.tallyCount > 0) {
      this.tallyCount--;
      this.notifyTallyUpdate();
    }
  }

  /**
   * Get the current tally count.
   * 
   * @returns Current tally count
   */
  getTallyCount(): number {
    return this.tallyCount;
  }

  /**
   * Set the tally goal.
   * 
   * @param goal - The target tally count
   */
  setTallyGoal(goal: number): void {
    if (goal < 0) {
      throw new Error('Tally goal cannot be negative');
    }
    this.tallyGoal = goal;
  }

  /**
   * Get the current tally goal.
   * 
   * @returns Current tally goal
   */
  getTallyGoal(): number {
    return this.tallyGoal;
  }

  /**
   * Get the tally progress as a percentage (0-100).
   * 
   * @returns Progress percentage
   */
  getTallyProgress(): number {
    if (this.tallyGoal === 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.tallyCount / this.tallyGoal) * 100));
  }

  /**
   * Register a callback for tally updates.
   * 
   * @param callback - Function to call when tally updates
   * @returns Cleanup function to remove the callback
   */
  onTallyUpdate(callback: (count: number) => void): () => void {
    this.tallyUpdateCallbacks.push(callback);
    return () => this.removeTallyUpdateCallback(callback);
  }

  /**
   * Register a callback for tally goal reached.
   * 
   * @param callback - Function to call when tally goal is reached
   * @returns Cleanup function to remove the callback
   */
  onTallyGoalReached(callback: () => void): () => void {
    this.tallyGoalReachedCallbacks.push(callback);
    return () => {
      const index = this.tallyGoalReachedCallbacks.indexOf(callback);
      if (index > -1) {
        this.tallyGoalReachedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Remove a tally update callback.
   * 
   * @param callback - The callback to remove
   */
  removeTallyUpdateCallback(callback: (count: number) => void): void {
    const index = this.tallyUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.tallyUpdateCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all tally update listeners.
   */
  private notifyTallyUpdate(): void {
    this.tallyUpdateCallbacks.forEach(callback => {
      try {
        callback(this.tallyCount);
      } catch (error) {
        console.error('Error in tally update callback:', error);
      }
    });
  }

  /**
   * Notify all tally goal reached listeners.
   */
  private notifyTallyGoalReached(): void {
    this.tallyGoalReachedCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in tally goal reached callback:', error);
      }
    });
  }

  /**
   * Register a callback for time updates.
   * 
   * @param callback - Function to call when total time updates
   * @returns Cleanup function to remove the callback
   */
  onTimeUpdate(callback: (totalTime: number) => void): () => void {
    this.timeUpdateCallbacks.push(callback);
    return () => this.removeTimeUpdateCallback(callback);
  }

  /**
   * Register a callback for mode switches.
   * 
   * @param callback - Function to call when mode switches
   * @returns Cleanup function to remove the callback
   */
  onModeSwitch(callback: (mode: string) => void): () => void {
    this.modeSwitchCallbacks.push(callback);
    return () => this.removeModeSwitchCallback(callback);
  }

  /**
   * Remove a time update callback.
   * 
   * @param callback - The callback to remove
   */
  removeTimeUpdateCallback(callback: (totalTime: number) => void): void {
    const index = this.timeUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.timeUpdateCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove a mode switch callback.
   * 
   * @param callback - The callback to remove
   */
  removeModeSwitchCallback(callback: (mode: string) => void): void {
    const index = this.modeSwitchCallbacks.indexOf(callback);
    if (index > -1) {
      this.modeSwitchCallbacks.splice(index, 1);
    }
  }

  /**
   * Get the current session state.
   * 
   * @returns The current session state, or null if no session is active
   */
  getSessionState(): SessionState | null {
    if (!this.sessionState) {
      return null;
    }
    
    return {
      ...this.sessionState,
      currentElapsed: this.getCurrentSessionTime(),
    };
  }

  /**
   * Get the time tracker instance.
   * 
   * @returns The EnhancedTimeTracker instance
   */
  getTracker(): EnhancedTimeTracker {
    return this.tracker;
  }

  /**
   * Get the Pomodoro adapter instance.
   * 
   * @returns The PomodoroAdapter instance
   */
  getPomodoroAdapter(): PomodoroAdapter {
    return this.pomodoroAdapter;
  }

  /**
   * Get a breakdown of time by source.
   * 
   * @returns Object with time breakdown
   */
  getTimeBreakdown(): {
    manualTime: number;
    completedPomodoroTime: number;
    incompletePomodoroTime: number;
    currentSessionTime: number;
    total: number;
    tallyCount: number;
    tallyGoal: number;
    tallyProgress: number;
  } {
    const currentSessionTime = this.getCurrentSessionTime();
    return {
      manualTime: this.manualTrackingTime,
      completedPomodoroTime: this.completedPomodoroTime,
      incompletePomodoroTime: this.incompletePomodoroTime,
      currentSessionTime,
      total: this.getTotalFocusTime(),
      tallyCount: this.tallyCount,
      tallyGoal: this.tallyGoal,
      tallyProgress: this.getTallyProgress(),
    };
  }

  /**
   * Set time components directly (useful for migration/testing).
   * 
   * @param times - Object with time components
   */
  setTimeComponents(times: {
    manualTrackingTime?: number;
    completedPomodoroTime?: number;
    incompletePomodoroTime?: number;
    tallyCount?: number;
    tallyGoal?: number;
  }): void {
    if (times.manualTrackingTime !== undefined) {
      if (times.manualTrackingTime < 0) {
        throw new Error('Manual tracking time cannot be negative');
      }
      this.manualTrackingTime = times.manualTrackingTime;
    }
    
    if (times.completedPomodoroTime !== undefined) {
      if (times.completedPomodoroTime < 0) {
        throw new Error('Completed Pomodoro time cannot be negative');
      }
      this.completedPomodoroTime = times.completedPomodoroTime;
    }
    
    if (times.incompletePomodoroTime !== undefined) {
      if (times.incompletePomodoroTime < 0) {
        throw new Error('Incomplete Pomodoro time cannot be negative');
      }
      this.incompletePomodoroTime = times.incompletePomodoroTime;
    }
    
    if (times.tallyCount !== undefined) {
      if (times.tallyCount < 0) {
        throw new Error('Tally count cannot be negative');
      }
      this.tallyCount = times.tallyCount;
    }
    
    if (times.tallyGoal !== undefined) {
      if (times.tallyGoal < 0) {
        throw new Error('Tally goal cannot be negative');
      }
      this.tallyGoal = times.tallyGoal;
    }
    
    this.notifyTimeUpdate();
  }

  /**
   * Start real-time updates (called when session starts).
   * 
   * Requirement 5.3: Update at least once per second during active sessions.
   */
  private startRealTimeUpdates(): void {
    // Clear any existing interval
    this.stopRealTimeUpdates();
    
    // Update every second
    this.updateInterval = setInterval(() => {
      this.notifyTimeUpdate();
    }, 1000);
  }

  /**
   * Stop real-time updates (called when session ends).
   */
  private stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Notify all time update listeners.
   */
  private notifyTimeUpdate(): void {
    const totalTime = this.getTotalFocusTime();
    this.timeUpdateCallbacks.forEach(callback => {
      try {
        callback(totalTime);
      } catch (error) {
        console.error('Error in time update callback:', error);
      }
    });
  }

  /**
   * Notify all mode switch listeners.
   */
  private notifyModeSwitch(mode: string): void {
    this.modeSwitchCallbacks.forEach(callback => {
      try {
        callback(mode);
      } catch (error) {
        console.error('Error in mode switch callback:', error);
      }
    });
  }

  /**
   * Clean up resources (call when disposing of the manager).
   */
  dispose(): void {
    this.stopRealTimeUpdates();
    this.timeUpdateCallbacks = [];
    this.modeSwitchCallbacks = [];
    this.tallyUpdateCallbacks = [];
    this.tallyGoalReachedCallbacks = [];
  }
}
