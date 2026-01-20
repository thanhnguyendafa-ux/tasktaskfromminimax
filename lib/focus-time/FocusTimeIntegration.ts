import { FocusTimeManager } from './FocusTimeManager';
import { EnhancedTimeTracker } from './EnhancedTimeTracker';
import { PomodoroAdapter } from './PomodoroAdapter';
import { NotificationService } from './NotificationService';
import { MigrationService } from './MigrationService';
import { Task } from '@/types';

/**
 * FocusTimeIntegration provides the main integration point between
 * the unified focus time system and the existing application.
 */
export class FocusTimeIntegration {
  private focusManagers: Map<string, FocusTimeManager> = new Map();
  private migrationService: MigrationService;
  private notificationService: NotificationService;

  constructor() {
    this.migrationService = new MigrationService();
    this.notificationService = new NotificationService();
  }

  /**
   * Initialize focus time tracking for a task
   */
  initializeTask(task: Task): FocusTimeManager {
    // Check if manager already exists
    if (this.focusManagers.has(task.id)) {
      return this.focusManagers.get(task.id)!;
    }

    // Create new components
    const tracker = new EnhancedTimeTracker();
    const pomodoroAdapter = new PomodoroAdapter();
    const manager = new FocusTimeManager(tracker, pomodoroAdapter, this.notificationService);

    // Migrate existing data
    this.migrateExistingData(task, manager);

    // Set tracking mode from task
    const trackingMode = task.tracking_mode || 'time_tracker';
    
    // Set tally data if tally mode
    if (trackingMode === 'tally') {
      manager.setTallyGoal(task.tally_goal || 1);
    }

    // Store manager
    this.focusManagers.set(task.id, manager);

    return manager;
  }

  /**
   * Migrate existing task data to unified format
   */
  private async migrateExistingData(task: Task, manager: FocusTimeManager): Promise<void> {
    try {
      // Migrate existing time tracker data
      if (task.total_time_seconds > 0) {
        manager.getTracker().addManualTime(task.total_time_seconds);
      }

      // Migrate existing pomodoro data
      if (task.pomodoro_count > 0) {
        const pomodoroTime = task.pomodoro_count * task.pomodoro_duration;
        // Add as completed pomodoro time
        for (let i = 0; i < task.pomodoro_count; i++) {
          manager.handlePomodoroComplete(task.pomodoro_duration);
        }
      }

      // Migrate tally data
      if (task.tally_count > 0) {
        manager.setTimeComponents({ tallyCount: task.tally_count });
      }
      if (task.tally_goal > 0) {
        manager.setTallyGoal(task.tally_goal);
      }

      console.log(`Migrated task ${task.id}: ${task.total_time_seconds}s manual + ${task.pomodoro_count} pomodoros + ${task.tally_count} tallies`);
    } catch (error) {
      console.error(`Failed to migrate task ${task.id}:`, error);
      this.notificationService.showError('Failed to migrate task data');
    }
  }

  /**
   * Get focus time manager for a task
   */
  getManager(taskId: string): FocusTimeManager | undefined {
    return this.focusManagers.get(taskId);
  }

  /**
   * Increment tally for a task (count up)
   */
  incrementTally(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.incrementTally();
    }
  }

  /**
   * Decrement tally for a task (count down)
   */
  decrementTally(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.decrementTally();
    }
  }

  /**
   * Get tally count for a task
   */
  getTallyCount(taskId: string): number {
    const manager = this.focusManagers.get(taskId);
    return manager ? manager.getTallyCount() : 0;
  }

  /**
   * Set tally goal for a task
   */
  setTallyGoal(taskId: string, goal: number): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.setTallyGoal(goal);
    }
  }

  /**
   * Get tally goal for a task
   */
  getTallyGoal(taskId: string): number {
    const manager = this.focusManagers.get(taskId);
    return manager ? manager.getTallyGoal() : 0;
  }

  /**
   * Get tally progress for a task (0-100)
   */
  getTallyProgress(taskId: string): number {
    const manager = this.focusManagers.get(taskId);
    return manager ? manager.getTallyProgress() : 0;
  }

  /**
   * Subscribe to tally updates for a task
   */
  onTallyUpdate(taskId: string, callback: (count: number) => void): () => void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      return manager.onTallyUpdate(callback);
    }
    return () => {};
  }

  /**
   * Start manual timer for a task
   */
  startManualTimer(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.startSession('manual');
    }
  }

  /**
   * Start pomodoro for a task
   */
  startPomodoro(taskId: string, duration: number = 1500): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.startSession('pomodoro');
      manager.getPomodoroAdapter().startSession(duration);
    }
  }

  /**
   * Complete pomodoro session
   */
  completePomodoro(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      const adapter = manager.getPomodoroAdapter();
      const elapsedTime = adapter.getElapsedTime();
      adapter.completeSession();
      manager.handlePomodoroComplete(elapsedTime);
    }
  }

  /**
   * Abort pomodoro session (saves incomplete time)
   */
  abortPomodoro(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      const adapter = manager.getPomodoroAdapter();
      const elapsedTime = adapter.getElapsedTime();
      adapter.abortSession();
      manager.handlePomodoroIncomplete(elapsedTime);
      
      // Show notification about saved time
      this.notificationService.showIncompletePomodoro(elapsedTime);
    }
  }

  /**
   * End current session
   */
  endSession(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.endSession();
    }
  }

  /**
   * Get total focus time for a task
   */
  getTotalFocusTime(taskId: string): number {
    const manager = this.focusManagers.get(taskId);
    return manager ? manager.getTotalFocusTime() : 0;
  }

  /**
   * Get time breakdown for a task
   */
  getTimeBreakdown(taskId: string) {
    const manager = this.focusManagers.get(taskId);
    return manager ? manager.getTimeBreakdown() : {
      manualTime: 0,
      completedPomodoroTime: 0,
      incompletePomodoroTime: 0,
      currentSessionTime: 0,
      total: 0,
      tallyCount: 0,
      tallyGoal: 0,
      tallyProgress: 0
    };
  }

  /**
   * Subscribe to time updates for a task
   */
  onTimeUpdate(taskId: string, callback: (totalTime: number) => void): () => void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      return manager.onTimeUpdate(callback);
    }
    return () => {};
  }

  /**
   * Subscribe to mode changes for a task
   */
  onModeSwitch(taskId: string, callback: (mode: string) => void): () => void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      return manager.onModeSwitch(callback);
    }
    return () => {};
  }

  /**
   * Cleanup manager for a task
   */
  cleanup(taskId: string): void {
    const manager = this.focusManagers.get(taskId);
    if (manager) {
      manager.endSession();
      this.focusManagers.delete(taskId);
    }
  }

  /**
   * Cleanup all managers
   */
  cleanupAll(): void {
    this.focusManagers.forEach((manager, taskId) => {
      manager.endSession();
    });
    this.focusManagers.clear();
  }

  /**
   * Batch migrate all tasks
   */
  async migrateAllTasks(tasks: Task[]): Promise<{
    successful: number;
    failed: number;
    report: string;
  }> {
    const taskData = tasks.map(t => ({
      id: t.id,
      total_time_seconds: t.total_time_seconds,
      pomodoro_count: t.pomodoro_count,
      pomodoro_duration: t.pomodoro_duration
    }));

    const result = await this.migrationService.batchMigrate(taskData);
    
    const totalTime = result.successful.reduce((sum, record) => sum + record.totalFocusTime, 0);
    const report = this.migrationService.generateMigrationReport(
      result.successful.length,
      result.failed.length,
      totalTime
    );

    return {
      successful: result.successful.length,
      failed: result.failed.length,
      report
    };
  }

  /**
   * Export focus time data for a task
   */
  exportTaskData(taskId: string) {
    const manager = this.focusManagers.get(taskId);
    if (!manager) {
      return null;
    }

    return {
      taskId,
      totalFocusTime: manager.getTotalFocusTime(),
      currentSessionTime: manager.getCurrentSessionTime(),
      breakdown: manager.getTimeBreakdown(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Get statistics across all tasks
   */
  getGlobalStatistics() {
    let totalFocusTime = 0;
    let totalManualTime = 0;
    let totalPomodoroTime = 0;
    let totalIncompleteTime = 0;
    let totalTallyCount = 0;
    let activeSessions = 0;

    this.focusManagers.forEach(manager => {
      const breakdown = manager.getTimeBreakdown();
      totalFocusTime += breakdown.total;
      totalManualTime += breakdown.manualTime;
      totalPomodoroTime += breakdown.completedPomodoroTime;
      totalIncompleteTime += breakdown.incompletePomodoroTime;
      totalTallyCount += breakdown.tallyCount;
      
      if (manager.getCurrentSessionTime() > 0) {
        activeSessions++;
      }
    });

    return {
      totalFocusTime,
      totalManualTime,
      totalPomodoroTime,
      totalIncompleteTime,
      totalTallyCount,
      activeSessions,
      totalTasks: this.focusManagers.size
    };
  }
}

// Singleton instance
let integrationInstance: FocusTimeIntegration | null = null;

export function getFocusTimeIntegration(): FocusTimeIntegration {
  if (!integrationInstance) {
    integrationInstance = new FocusTimeIntegration();
  }
  return integrationInstance;
}
