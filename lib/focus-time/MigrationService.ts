import { FocusTimeRecord, MigrationData } from './types';
import type { TrackingMode } from '@/types';

/**
 * MigrationService handles data migration from the old dual-tracking system
 * to the new unified focus time tracking system.
 */
export class MigrationService {
  /**
   * Detect the appropriate tracking mode for a task based on its existing data
   */
  detectTrackingMode(taskData: {
    total_time_seconds: number;
    pomodoro_count: number;
    tally_count: number;
  }): TrackingMode {
    // Priority: tally > pomodoro > time_tracker
    if (taskData.tally_count > 0) {
      return 'tally';
    }
    if (taskData.pomodoro_count > 0) {
      return 'pomodoro';
    }
    if (taskData.total_time_seconds > 0) {
      return 'time_tracker';
    }
    return 'time_tracker'; // Default mode
  }

  /**
   * Migrates existing task data to the unified focus time format
   */
  async migrateTaskData(taskData: {
    total_time_seconds: number;
    pomodoro_count: number;
    pomodoro_duration: number;
    tally_count?: number;
    tally_goal?: number;
  }): Promise<FocusTimeRecord> {
    // Calculate historical pomodoro time from completed sessions
    const completedPomodoroTime = taskData.pomodoro_count * taskData.pomodoro_duration;
    
    // Existing total_time_seconds represents manual tracking time
    const manualTrackingTime = taskData.total_time_seconds;
    
    // Detect tracking mode
    const trackingMode = this.detectTrackingMode({
      total_time_seconds: taskData.total_time_seconds,
      pomodoro_count: taskData.pomodoro_count,
      tally_count: taskData.tally_count || 0,
    });

    // Calculate total focus time
    const totalFocusTime = manualTrackingTime + completedPomodoroTime;

    const record: FocusTimeRecord = {
      id: crypto.randomUUID(),
      date: new Date(),
      tracking_mode: trackingMode,
      manualTrackingTime,
      completedPomodoroTime,
      incompletePomodoroTime: 0, // No historical incomplete data
      tallyCount: taskData.tally_count || 0,
      tallyGoal: taskData.tally_goal || 0,
      totalFocusTime,
      pomodoroCount: taskData.pomodoro_count,
      sessionCount: taskData.pomodoro_count + (manualTrackingTime > 0 ? 1 : 0),
      lastUpdated: new Date()
    };

    return record;
  }

  /**
   * Migrate a task to a new tracking mode
   */
  async migrateTrackingMode(
    taskId: string,
    newMode: TrackingMode,
    currentData: {
      total_time_seconds: number;
      pomodoro_count: number;
      tally_count: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    // Validate mode change
    if (newMode === 'tally' && currentData.tally_count === 0) {
      // Initialize tally if switching to tally mode
      return { success: true, message: `Task ${taskId} switched to tally mode` };
    }
    
    if (newMode === 'pomodoro' && currentData.pomodoro_count === 0) {
      // Initialize pomodoro if switching to pomodoro mode
      return { success: true, message: `Task ${taskId} switched to pomodoro mode` };
    }
    
    return { success: true, message: `Task ${taskId} tracking mode updated` };
  }

  /**
   * Creates migration data summary for audit purposes
   */
  createMigrationSummary(
    existingTimeTracker: { totalSeconds: number },
    existingPomodoro: { completedCount: number; duration: number }
  ): MigrationData {
    const calculatedTotalTime = 
      existingTimeTracker.totalSeconds + 
      (existingPomodoro.completedCount * existingPomodoro.duration);

    return {
      existingTimeTracker: {
        totalSeconds: existingTimeTracker.totalSeconds,
        sessions: []
      },
      existingPomodoro: {
        completedCount: existingPomodoro.completedCount,
        sessions: []
      },
      calculatedTotalTime,
      migrationTimestamp: new Date()
    };
  }

  /**
   * Validates migration data integrity
   */
  validateMigration(
    original: { timeTracker: number; pomodoro: number },
    migrated: FocusTimeRecord
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if manual time is preserved
    if (migrated.manualTrackingTime !== original.timeTracker) {
      errors.push('Manual tracking time mismatch');
    }

    // Check if pomodoro time is calculated correctly
    const expectedPomodoroTime = original.pomodoro;
    if (migrated.completedPomodoroTime !== expectedPomodoroTime) {
      errors.push('Pomodoro time calculation error');
    }

    // Check if total is sum of components
    const expectedTotal = original.timeTracker + original.pomodoro;
    if (migrated.totalFocusTime !== expectedTotal) {
      errors.push('Total focus time calculation error');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rollback migration if errors occur
   */
  async rollbackMigration(
    taskId: string,
    originalData: { total_time_seconds: number; pomodoro_count: number }
  ): Promise<void> {
    // In a real implementation, this would restore the original data
    console.log(`Rolling back migration for task ${taskId}`, originalData);
  }

  /**
   * Batch migrate multiple tasks
   */
  async batchMigrate(
    tasks: Array<{
      id: string;
      total_time_seconds: number;
      pomodoro_count: number;
      pomodoro_duration: number;
    }>
  ): Promise<{
    successful: FocusTimeRecord[];
    failed: Array<{ taskId: string; error: string }>;
  }> {
    const successful: FocusTimeRecord[] = [];
    const failed: Array<{ taskId: string; error: string }> = [];

    for (const task of tasks) {
      try {
        const record = await this.migrateTaskData(task);
        successful.push(record);
      } catch (error) {
        failed.push({
          taskId: task.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Export migration report
   */
  generateMigrationReport(
    successful: number,
    failed: number,
    totalTime: number
  ): string {
    return `
Migration Report
================
Date: ${new Date().toISOString()}
Successful: ${successful}
Failed: ${failed}
Total Focus Time Migrated: ${Math.floor(totalTime / 60)} minutes
Success Rate: ${((successful / (successful + failed)) * 100).toFixed(2)}%
    `.trim();
  }
}
