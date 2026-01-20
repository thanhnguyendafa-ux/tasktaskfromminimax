# Unified Focus Time Tracking

This module implements a unified focus time tracking system that combines manual time tracking and Pomodoro sessions into a single, comprehensive tracking approach.

## Overview

The unified focus time tracking system refactors the existing dual-tracking approach (Time Tracker + Pomodoro) into a cohesive system that preserves all focus time regardless of the tracking method used.

### Key Features

- **Unified Time Calculation**: Combines manual tracking time, completed Pomodoro sessions, and incomplete Pomodoro time into a single total
- **Real-time Synchronization**: All time updates propagate immediately to the UI
- **Seamless Mode Transitions**: Switch between manual and Pomodoro modes without losing timing data
- **Data Preservation**: All existing data is preserved during migration and system operations
- **Comprehensive Notifications**: Clear feedback for all significant system events

## Architecture

The system follows a layered architecture:

```
┌─────────────────────────────────────────┐
│           User Interface Layer          │
│  (Real-time display, notifications)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Focus Time Manager Layer         │
│  (Unified calculations, state mgmt)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Data Storage Layer              │
│  (Time Tracker + Pomodoro + Unified)    │
└─────────────────────────────────────────┘
```

## Core Interfaces

### FocusTimeManager

The central coordinator that implements unified time tracking logic.

```typescript
interface FocusTimeManager {
  // Core time calculation
  getTotalFocusTime(): number;
  getCurrentSessionTime(): number;
  
  // Session management
  startSession(mode: 'manual' | 'pomodoro'): void;
  endSession(): void;
  switchMode(newMode: 'manual' | 'pomodoro'): void;
  
  // Pomodoro-specific handling
  handlePomodoroComplete(duration: number): void;
  handlePomodoroIncomplete(elapsedTime: number): void;
  
  // Event notifications
  onTimeUpdate(callback: (totalTime: number) => void): void;
  onModeSwitch(callback: (mode: string) => void): void;
}
```

### EnhancedTimeTracker

Extended to handle time from incomplete Pomodoro sessions.

```typescript
interface EnhancedTimeTracker {
  // Existing functionality
  getTotalTime(): number;
  startTracking(): void;
  stopTracking(): void;
  
  // New functionality for Pomodoro integration
  addIncompleteSessionTime(seconds: number): void;
  getTimeBreakdown(): {
    manualTime: number;
    incompletePomodoros: number;
    total: number;
  };
}
```

### PomodoroAdapter

Bridges the Pomodoro system with the unified tracking.

```typescript
interface PomodoroAdapter {
  // Session monitoring
  onSessionStart(callback: () => void): void;
  onSessionComplete(callback: (duration: number) => void): void;
  onSessionAbort(callback: (elapsedTime: number) => void): void;
  
  // State queries
  isSessionActive(): boolean;
  getElapsedTime(): number;
  getCompletedCount(): number;
}
```

## Data Models

### FocusTimeRecord

The primary data structure for storing unified focus time information.

```typescript
interface FocusTimeRecord {
  id: string;
  date: Date;
  
  // Time components (all in seconds)
  manualTrackingTime: number;      // From Time Tracker
  completedPomodoroTime: number;   // From completed Pomodoros
  incompletePomodoroTime: number;  // From aborted Pomodoros
  
  // Calculated fields
  totalFocusTime: number;          // Sum of all components
  
  // Metadata
  pomodoroCount: number;           // Completed sessions only
  sessionCount: number;            // Total sessions
  lastUpdated: Date;
}
```

### SessionState

Represents the current state of an active focus session.

```typescript
interface SessionState {
  isActive: boolean;
  mode: 'manual' | 'pomodoro';
  startTime: Date;
  currentElapsed: number;
  
  // Pomodoro-specific
  pomodoroTarget?: number;
  pomodoroElapsed?: number;
}
```

### MigrationData

Contains all data needed for migrating from the existing dual-tracking system.

```typescript
interface MigrationData {
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
```

## Usage Examples

### Creating a Focus Time Record

```typescript
const record: FocusTimeRecord = {
  id: 'record-123',
  date: new Date(),
  manualTrackingTime: 1800,      // 30 minutes
  completedPomodoroTime: 3000,   // 50 minutes (2 Pomodoros)
  incompletePomodoroTime: 600,   // 10 minutes
  totalFocusTime: 5400,          // 90 minutes total
  pomodoroCount: 2,
  sessionCount: 3,
  lastUpdated: new Date(),
};
```

### Creating a Session State

```typescript
// Manual tracking session
const manualSession: SessionState = {
  isActive: true,
  mode: 'manual',
  startTime: new Date(),
  currentElapsed: 0,
};

// Pomodoro session
const pomodoroSession: SessionState = {
  isActive: true,
  mode: 'pomodoro',
  startTime: new Date(),
  currentElapsed: 0,
  pomodoroTarget: 1500,  // 25 minutes
  pomodoroElapsed: 0,
};
```

### Time Breakdown Display

```typescript
const breakdown: TimeBreakdown = {
  manualTime: 1800,
  completedPomodoroTime: 3000,
  incompletePomodoroTime: 600,
  totalTime: 5400,
  pomodoroCount: 2,
  sessionCount: 3,
};

console.log(`Total Focus Time: ${breakdown.totalTime}s`);
console.log(`  Manual: ${breakdown.manualTime}s`);
console.log(`  Completed Pomodoros: ${breakdown.completedPomodoroTime}s`);
console.log(`  Incomplete Pomodoros: ${breakdown.incompletePomodoroTime}s`);
```

## Testing

The module uses both unit testing and property-based testing with fast-check.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- lib/focus-time/__tests__/types.test.ts
```

### Property-Based Testing

The module includes property-based tests that verify universal properties across all possible inputs:

```typescript
// Example: Verify totalFocusTime calculation property
fc.assert(
  fc.property(
    fc.nat(),
    fc.nat(),
    fc.nat(),
    (manualTime, completedPomodoro, incompletePomodoro) => {
      const record: FocusTimeRecord = {
        // ... create record
        totalFocusTime: manualTime + completedPomodoro + incompletePomodoro,
      };

      const calculatedTotal = record.manualTrackingTime + 
                             record.completedPomodoroTime + 
                             record.incompletePomodoroTime;

      return record.totalFocusTime === calculatedTotal;
    }
  ),
  { numRuns: 100 }
);
```

## Requirements Validation

This module validates the following requirements:

- **Requirement 1.1**: Unified Focus Time Calculation
- **Requirement 4.4**: Data Migration and Compatibility
- **Requirement 6.5**: System State Management

## Next Steps

The following tasks will implement the functionality defined by these interfaces:

1. ✅ Set up core interfaces and data models
2. Implement Focus Time Manager core functionality
3. Enhance Time Tracker for Pomodoro integration
4. Create Pomodoro Integration Adapter
5. Implement mode transition and state management
6. Implement notification and UI feedback system
7. Implement data migration system
8. Integration and system wiring

## Contributing

When adding new interfaces or data models:

1. Add the interface to `types.ts`
2. Add comprehensive JSDoc comments
3. Create unit tests in `__tests__/types.test.ts`
4. Add property-based tests where applicable
5. Update this README with usage examples
6. Ensure all tests pass before committing

## License

This module is part of the TaskTask application.
