# Implementation Plan: Unified Focus Time Tracking

## Overview

This implementation plan refactors the existing Focus Time system by introducing a unified tracking approach that combines manual time tracking and Pomodoro sessions. The implementation maintains backward compatibility while adding new coordination logic and real-time synchronization capabilities.

## Tasks

- [x] 1. Set up core interfaces and data models
  - Create TypeScript interfaces for FocusTimeManager, EnhancedTimeTracker, and PomodoroAdapter
  - Define data models for FocusTimeRecord, SessionState, and MigrationData
  - Set up testing framework with fast-check for property-based testing
  - _Requirements: 1.1, 4.4, 6.5_

- [ ] 2. Implement Focus Time Manager core functionality
  - [x] 2.1 Create FocusTimeManager class with unified time calculation logic
    - Implement getTotalFocusTime() method that sums all time sources
    - Implement session management methods (start, end, switch modes)
    - Add event notification system for time updates and mode switches
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 2.2 Write property test for total focus time calculation accuracy
    - **Property 1: Total Focus Time Calculation Accuracy**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 2.3 Implement real-time synchronization logic
    - Add immediate update mechanisms for all time operations
    - Implement event-driven updates to UI components
    - _Requirements: 1.5, 2.5, 5.4_

  - [x] 2.4 Write property test for real-time synchronization
    - **Property 3: Real-time Synchronization**
    - **Validates: Requirements 1.5, 2.5, 5.4**

- [ ] 3. Enhance Time Tracker for Pomodoro integration
  - [x] 3.1 Extend existing TimeTracker with incomplete session handling
    - Add addIncompleteSessionTime() method
    - Implement getTimeBreakdown() for detailed time source reporting
    - Maintain precision consistency with existing tracking
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 3.2 Write property test for incomplete session time preservation
    - **Property 2: Incomplete Session Time Preservation**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 3.3 Write property test for consistent timing precision
    - **Property 8: Consistent Timing Precision**
    - **Validates: Requirements 2.4, 6.5**

- [ ] 4. Create Pomodoro Integration Adapter
  - [x] 4.1 Implement PomodoroAdapter to bridge existing Pomodoro system
    - Add session monitoring callbacks (start, complete, abort)
    - Implement state query methods for session status
    - Handle elapsed time calculation for incomplete sessions
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Write unit tests for Pomodoro adapter edge cases
    - Test session abortion at various time points
    - Test interruption handling and recovery
    - Test state consistency during rapid mode switches
    - _Requirements: 2.1, 2.2, 6.4_

- [ ] 5. Checkpoint - Core functionality validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement mode transition and state management
  - [x] 6.1 Create seamless mode switching logic
    - Implement state preservation during manual-to-Pomodoro transitions
    - Implement timing continuity during Pomodoro-to-manual transitions
    - Add error recovery mechanisms for failed transitions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Write property test for seamless mode transitions
    - **Property 5: Seamless Mode Transitions**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 6.3 Write property test for data preservation during operations
    - **Property 4: Data Preservation During Operations**
    - **Validates: Requirements 4.1, 4.2, 6.3, 6.4**

- [ ] 7. Implement notification and UI feedback system
  - [x] 7.1 Create NotificationService for user communication
    - Implement notifications for incomplete Pomodoro sessions
    - Add mode switch feedback messages
    - Create time breakdown display notifications
    - Add migration completion confirmations
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [-] 7.2 Write property test for comprehensive UI feedback
    - **Property 6: Comprehensive UI Feedback**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5**

  - [ ] 7.3 Implement real-time UI display updates
    - Add continuous Total_Focus_Time display during active sessions
    - Implement at-least-once-per-second update frequency
    - Create simultaneous current session and total time display
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 7.4 Write property test for complete information display
    - **Property 7: Complete Information Display**
    - **Validates: Requirements 3.3, 5.1, 5.5**

  - [ ] 7.5 Write property test for real-time display updates
    - **Property 10: Real-time Display Updates**
    - **Validates: Requirements 5.2, 5.3**

- [ ] 8. Implement data migration system
  - [ ] 8.1 Create migration logic for existing data
    - Implement preservation of existing Time_Tracker data
    - Implement preservation of existing Pomodoro count data
    - Calculate historical Total_Focus_Time from existing records
    - Maintain separate storage for audit purposes
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 8.2 Write property test for historical data accuracy
    - **Property 9: Historical Data Accuracy**
    - **Validates: Requirements 4.3, 4.4, 4.5**

  - [ ] 8.3 Write unit tests for migration edge cases
    - Test migration with corrupted data
    - Test migration with missing data components
    - Test rollback scenarios for failed migrations
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Integration and system wiring
  - [ ] 9.1 Wire all components together in main application
    - Connect FocusTimeManager with existing Time Tracker
    - Integrate PomodoroAdapter with existing Pomodoro system
    - Wire NotificationService with UI components
    - Implement error handling and graceful degradation
    - _Requirements: 1.1, 1.5, 6.3, 6.4_

  - [ ] 9.2 Write integration tests for end-to-end workflows
    - Test complete focus session workflows (manual and Pomodoro)
    - Test mode switching during active sessions
    - Test system recovery from various error conditions
    - _Requirements: 6.1, 6.2, 6.4_

- [ ] 10. Final checkpoint and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Integration tests ensure end-to-end system functionality
- Migration logic preserves all existing data while adding new unified calculations