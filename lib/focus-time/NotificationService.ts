/**
 * Notification Service Implementation
 * 
 * Handles user communication about time tracking changes.
 * Provides feedback for incomplete sessions, mode switches,
 * and time breakdowns.
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

import type { NotificationService as INotificationService, TimeBreakdown, MigrationSummary } from './types';

/**
 * Notification type for categorizing messages
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification message structure
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss duration in milliseconds
}

/**
 * Implementation of the NotificationService interface.
 * 
 * This class provides user-facing notifications for various
 * focus time tracking events, ensuring users understand what
 * happens during mode switches, incomplete sessions, and data migrations.
 */
export class NotificationService implements INotificationService {
  private notifications: Notification[] = [];
  private notificationCallbacks: Array<(notification: Notification) => void> = [];
  private nextId: number = 1;

  /**
   * Show notification for an incomplete Pomodoro session.
   * 
   * Requirement 3.1: Display notification explaining time conversion
   * when a Pomodoro session becomes incomplete.
   * 
   * @param elapsedTime - The elapsed time in seconds
   */
  showIncompletePomodoro(elapsedTime: number): void {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeStr = minutes > 0 
      ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
      : `${seconds} second${seconds !== 1 ? 's' : ''}`;

    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: 'Pomodoro Session Incomplete',
      message: `Your Pomodoro session was not completed. The ${timeStr} you spent focusing has been saved to your total focus time.`,
      timestamp: new Date(),
      duration: 5000, // 5 seconds
    };

    this.addNotification(notification);
  }

  /**
   * Show notification for mode switching.
   * 
   * Requirement 3.2: Show how time will be combined when switching
   * from Pomodoro to manual tracking.
   * Requirement 3.4: Provide clear feedback during mode transitions.
   * 
   * @param fromMode - The mode being switched from
   * @param toMode - The mode being switched to
   */
  showModeSwitch(fromMode: string, toMode: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: 'Mode Switched',
      message: `Switched from ${fromMode} to ${toMode} mode. Your focus time continues to be tracked seamlessly.`,
      timestamp: new Date(),
      duration: 3000, // 3 seconds
    };

    this.addNotification(notification);
  }

  /**
   * Show time breakdown notification.
   * 
   * Requirement 3.3: Show breakdown of time sources when displaying
   * Total_Focus_Time.
   * 
   * @param breakdown - The time breakdown to display
   */
  showTimeBreakdown(breakdown: TimeBreakdown): void {
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    };

    const parts: string[] = [];
    
    if (breakdown.manualTime > 0) {
      parts.push(`Manual tracking: ${formatTime(breakdown.manualTime)}`);
    }
    
    if (breakdown.completedPomodoroTime > 0) {
      parts.push(`Completed Pomodoros (${breakdown.pomodoroCount}): ${formatTime(breakdown.completedPomodoroTime)}`);
    }
    
    if (breakdown.incompletePomodoroTime > 0) {
      parts.push(`Incomplete Pomodoros: ${formatTime(breakdown.incompletePomodoroTime)}`);
    }

    const message = parts.length > 0
      ? `Total Focus Time: ${formatTime(breakdown.totalTime)}\n\n${parts.join('\n')}`
      : `Total Focus Time: ${formatTime(breakdown.totalTime)}\n\nNo focus sessions recorded yet.`;

    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: 'Focus Time Breakdown',
      message,
      timestamp: new Date(),
      duration: 7000, // 7 seconds
    };

    this.addNotification(notification);
  }

  /**
   * Show migration completion notification.
   * 
   * Requirement 3.5: Confirm automatic save actions to the user.
   * 
   * @param migratedData - Summary of the migration
   */
  showMigrationComplete(migratedData: MigrationSummary): void {
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    };

    const type: NotificationType = migratedData.success ? 'success' : 'error';
    const title = migratedData.success ? 'Migration Complete' : 'Migration Failed';
    
    let message = '';
    
    if (migratedData.success) {
      message = `Successfully migrated ${migratedData.totalRecordsMigrated} record${migratedData.totalRecordsMigrated !== 1 ? 's' : ''}.\n\n`;
      message += `Total time preserved: ${formatTime(migratedData.totalTimePreserved)}\n`;
      message += `Pomodoro sessions: ${migratedData.pomodoroSessionsPreserved}\n`;
      message += `Manual sessions: ${migratedData.manualSessionsPreserved}`;
    } else {
      message = 'Migration encountered errors:\n\n';
      if (migratedData.errors && migratedData.errors.length > 0) {
        message += migratedData.errors.slice(0, 3).join('\n');
        if (migratedData.errors.length > 3) {
          message += `\n... and ${migratedData.errors.length - 3} more error${migratedData.errors.length - 3 !== 1 ? 's' : ''}`;
        }
      }
    }

    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      duration: migratedData.success ? 5000 : 10000, // 5s for success, 10s for errors
    };

    this.addNotification(notification);
  }

  /**
   * Show an error notification.
   * 
   * @param message - The error message to display
   */
  showError(message: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'error',
      title: 'Error',
      message,
      timestamp: new Date(),
      duration: 5000, // 5 seconds
    };

    this.addNotification(notification);
  }

  /**
   * Show a custom notification.
   * 
   * @param type - The notification type
   * @param title - The notification title
   * @param message - The notification message
   * @param duration - Optional auto-dismiss duration in milliseconds
   */
  showCustomNotification(
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      duration,
    };

    this.addNotification(notification);
  }

  /**
   * Register a callback to be notified when notifications are added.
   * 
   * @param callback - Function to call when a notification is added
   */
  onNotification(callback: (notification: Notification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Remove a notification callback.
   * 
   * @param callback - The callback to remove
   */
  removeNotificationCallback(callback: (notification: Notification) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  /**
   * Get all notifications.
   * 
   * @returns Array of all notifications
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get notifications by type.
   * 
   * @param type - The notification type to filter by
   * @returns Array of notifications of the specified type
   */
  getNotificationsByType(type: NotificationType): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Clear a specific notification by ID.
   * 
   * @param id - The notification ID to clear
   */
  clearNotification(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * Clear all notifications.
   */
  clearAllNotifications(): void {
    this.notifications = [];
  }

  /**
   * Clear notifications older than a specified age.
   * 
   * @param maxAgeMs - Maximum age in milliseconds
   */
  clearOldNotifications(maxAgeMs: number): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => {
      const age = now.getTime() - n.timestamp.getTime();
      return age < maxAgeMs;
    });
  }

  /**
   * Add a notification and notify listeners.
   * 
   * @param notification - The notification to add
   */
  private addNotification(notification: Notification): void {
    this.notifications.push(notification);
    
    // Notify all listeners
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Auto-dismiss if duration is specified
    if (notification.duration) {
      setTimeout(() => {
        this.clearNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Generate a unique notification ID.
   * 
   * @returns A unique ID string
   */
  private generateId(): string {
    return `notification-${this.nextId++}-${Date.now()}`;
  }
}
