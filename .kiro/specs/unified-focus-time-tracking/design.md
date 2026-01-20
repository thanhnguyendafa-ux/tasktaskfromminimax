# Design Document: Unified Focus Time Tracking

## Overview

The unified focus time tracking system refactors the existing dual-tracking approach (Time Tracker + Pomodoro) into a cohesive system that preserves all focus time regardless of the tracking method used. The design introduces a central Focus Time Manager that coordinates between existing components while maintaining backward compatibility and providing real-time unified time calculations.

## Architecture

The system follows a layered architecture with a new coordination layer:

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

### Key Architectural Principles

1. **Single Source of Truth**: Focus Time Manager maintains the authoritative total focus time
2. **Non-destructive Migration**: Existing data structures remain intact
3. **Real-time Synchronization**: All time updates propagate immediately
4. **Graceful Degradation**: System continues functioning if individual components fail

## Components and Interfaces

### Focus Time Manager

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

### Enhanced Time Tracker

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

### Pomodoro Integration Adapter

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

### Notification Service

Handles user communication about time tracking changes.

```typescript
interface NotificationService {
  showIncompletePomodoro(elapsedTime: number): void;
  showModeSwitch(fromMode: string, toMode: string): void;
  showTimeBreakdown(breakdown: TimeBreakdown): void;
  showMigrationComplete(migratedData: MigrationSummary): void;
}
```

## Data Models

### Unified Focus Time Record

```typescript
interface FocusTimeRecord {
  id: string;
  date: Date;
  
  // Time components
  manualTrackingTime: number;      // From Time Tracker
  completedPomodoroTime: number;   // From completed Pomodoros
  incompletePomodoroTime: number;  // From aborted Pomodoros
  
  // Calculated fields
  totalFocusTime: number;          // Sum of all components
  
  // Metadata
  pomodoroCount: number;           // Completed sessions only
  sessionCount: number;            // Total sessions (manual + pomodoro)
  lastUpdated: Date;
}
```

### Session State

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

### Migration Data Structure

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

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Total Focus Time Calculation Accuracy
*For any* combination of manual tracking time, completed Pomodoro sessions, and incomplete Pomodoro sessions, the Total_Focus_Time should equal the sum of all time components
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Incomplete Session Time Preservation  
*For any* Pomodoro session that becomes incomplete (aborted or interrupted), the elapsed time should be preserved in the Time_Tracker component without affecting the Pomodoro count
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Real-time Synchronization
*For any* time tracking operation (session start, end, mode switch, incomplete save), the Total_Focus_Time should be updated immediately and reflected in the UI
**Validates: Requirements 1.5, 2.5, 5.4**

### Property 4: Data Preservation During Operations
*For any* system operation (migration, mode transition, error recovery), all existing time tracking data should be preserved without loss
**Validates: Requirements 4.1, 4.2, 6.3, 6.4**

### Property 5: Seamless Mode Transitions
*For any* transition between manual tracking and Pomodoro modes, the current session state and timing continuity should be maintained
**Validates: Requirements 6.1, 6.2**

### Property 6: Comprehensive UI Feedback
*For any* significant system event (incomplete session, mode switch, automatic save), the User_Interface should provide appropriate notifications and feedback
**Validates: Requirements 3.1, 3.2, 3.4, 3.5**

### Property 7: Complete Information Display
*For any* time display operation, the UI should show both current session time and Total_Focus_Time with breakdown of time sources
**Validates: Requirements 3.3, 5.1, 5.5**

### Property 8: Consistent Timing Precision
*For any* time recording operation, the precision should be consistent across manual tracking and Pomodoro modes
**Validates: Requirements 2.4, 6.5**

### Property 9: Historical Data Accuracy
*For any* historical data access or migration operation, the calculated Total_Focus_Time should accurately reflect the sum of historical records while maintaining separate audit trails
**Validates: Requirements 4.3, 4.4, 4.5**

### Property 10: Real-time Display Updates
*For any* active focus session, the UI should update the Total_Focus_Time display at least once per second and maintain continuous display during mode switches
**Validates: Requirements 5.2, 5.3**

## Error Handling

### Migration Errors
- **Data Corruption**: If existing data is corrupted, the system should attempt partial recovery and log detailed error information
- **Version Incompatibility**: If data format versions are incompatible, the system should provide migration tools or fallback options
- **Storage Failures**: If storage operations fail during migration, the system should rollback to the previous state

### Runtime Errors
- **Timer Precision Loss**: If system timing becomes inaccurate, the system should detect and compensate for drift
- **Mode Switch Failures**: If mode transitions fail, the system should maintain the current mode and preserve session data
- **UI Update Failures**: If real-time updates fail, the system should queue updates and retry with exponential backoff

### Data Consistency Errors
- **Time Calculation Errors**: If total time calculations produce invalid results, the system should recalculate from source data
- **Session State Corruption**: If session state becomes invalid, the system should reset to a safe state while preserving accumulated time
- **Notification Failures**: If notifications fail to display, the system should log the events for later review

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of time calculations with known inputs and outputs
- Edge cases like zero-duration sessions, maximum time values, and boundary conditions
- Integration points between Focus Time Manager and existing components
- Error conditions and recovery scenarios
- UI component behavior with specific state changes

**Property-Based Tests** focus on:
- Universal properties that hold across all possible input combinations
- Comprehensive input coverage through randomized test data generation
- Verification of mathematical relationships and invariants
- System behavior under various timing scenarios and mode transitions

### Property-Based Testing Configuration

- **Testing Library**: Use fast-check for TypeScript/JavaScript implementation
- **Test Iterations**: Minimum 100 iterations per property test to ensure thorough coverage
- **Test Tagging**: Each property test must reference its design document property using the format:
  - **Feature: unified-focus-time-tracking, Property 1: Total Focus Time Calculation Accuracy**

### Testing Coverage Requirements

**Core Functionality Tests**:
- Time calculation accuracy across all input combinations
- Session state management during mode transitions  
- Data preservation during system operations
- Real-time synchronization of time updates

**Integration Tests**:
- End-to-end focus session workflows
- Migration from existing data structures
- UI responsiveness during active sessions
- Error recovery and graceful degradation

**Performance Tests**:
- Real-time update frequency validation
- Memory usage during long-running sessions
- Response time for mode transitions
- Scalability with large historical datasets

The combination of unit and property-based tests ensures both concrete behavior validation and comprehensive correctness verification across all possible system states.