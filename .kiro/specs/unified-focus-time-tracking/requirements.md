# Requirements Document

## Introduction

This specification defines the requirements for refactoring the current Focus Time system to create a unified time tracking approach. The current system maintains two separate tracking mechanisms (Time Tracker and Pomodoro) which creates inconsistency and potential data loss when Pomodoro sessions are incomplete. The unified system will combine both approaches into a single, comprehensive Focus Time tracking system.

## Glossary

- **Focus_Time_System**: The unified time tracking system that combines manual time tracking and Pomodoro session time
- **Time_Tracker**: The existing manual time tracking component that records total_time_seconds
- **Pomodoro_System**: The existing Pomodoro timer component that tracks completed sessions (pomodoro_count)
- **Focus_Session**: Any period of focused work, whether from manual timing or Pomodoro sessions
- **Incomplete_Pomodoro**: A Pomodoro session that was started but not completed (aborted or interrupted)
- **Total_Focus_Time**: The combined time from all focus sessions (manual + completed Pomodoros + incomplete Pomodoros)
- **User_Interface**: The system component that displays information and notifications to users

## Requirements

### Requirement 1: Unified Focus Time Calculation

**User Story:** As a user, I want my total focus time to include all time I've actually spent focusing, so that I have an accurate view of my productivity regardless of which timing method I use.

#### Acceptance Criteria

1. THE Focus_Time_System SHALL calculate Total_Focus_Time as the sum of Time_Tracker seconds and all Pomodoro session time
2. WHEN a Pomodoro session is completed, THE Focus_Time_System SHALL add the full Pomodoro duration to Total_Focus_Time
3. WHEN a Pomodoro session is incomplete, THE Focus_Time_System SHALL add the elapsed time to Total_Focus_Time
4. THE Focus_Time_System SHALL maintain backward compatibility with existing time tracking data
5. THE Focus_Time_System SHALL update Total_Focus_Time in real-time during active sessions

### Requirement 2: Incomplete Pomodoro Time Preservation

**User Story:** As a user, I want my partial Pomodoro time to be saved when I don't complete a session, so that I don't lose the time I actually spent focusing.

#### Acceptance Criteria

1. WHEN a user aborts an active Pomodoro session, THE Focus_Time_System SHALL save the elapsed time to the Time_Tracker component
2. WHEN a Pomodoro session is interrupted by external factors, THE Focus_Time_System SHALL preserve the elapsed time
3. WHEN incomplete Pomodoro time is saved, THE Focus_Time_System SHALL maintain the original Pomodoro count unchanged
4. THE Focus_Time_System SHALL record incomplete Pomodoro time with the same precision as manual time tracking
5. WHEN saving incomplete Pomodoro time, THE Focus_Time_System SHALL update the Total_Focus_Time immediately

### Requirement 3: User Notification System

**User Story:** As a user, I want clear notifications about how my time is being tracked, so that I understand what happens when I switch between timing methods or when sessions are incomplete.

#### Acceptance Criteria

1. WHEN a Pomodoro session becomes incomplete, THE User_Interface SHALL display a notification explaining the time conversion
2. WHEN switching from Pomodoro to manual tracking, THE User_Interface SHALL show how the time will be combined
3. WHEN displaying Total_Focus_Time, THE User_Interface SHALL show the breakdown of time sources
4. THE User_Interface SHALL provide clear feedback during time tracking mode transitions
5. WHEN time is automatically saved from incomplete sessions, THE User_Interface SHALL confirm the action to the user

### Requirement 4: Data Migration and Compatibility

**User Story:** As a user with existing focus time data, I want my historical data to be preserved and integrated into the new system, so that I don't lose my tracking history.

#### Acceptance Criteria

1. THE Focus_Time_System SHALL preserve all existing Time_Tracker data during system migration
2. THE Focus_Time_System SHALL preserve all existing Pomodoro count data during system migration
3. WHEN migrating data, THE Focus_Time_System SHALL calculate historical Total_Focus_Time from existing records
4. THE Focus_Time_System SHALL maintain separate storage for Time_Tracker and Pomodoro data for audit purposes
5. WHEN accessing historical data, THE Focus_Time_System SHALL display unified focus time calculations

### Requirement 5: Real-time Focus Time Display

**User Story:** As a user, I want to see my total focus time update in real-time, so that I can monitor my progress throughout the day regardless of which timing method I'm using.

#### Acceptance Criteria

1. WHEN any focus session is active, THE User_Interface SHALL display the current Total_Focus_Time including active session time
2. WHEN switching between Time_Tracker and Pomodoro modes, THE User_Interface SHALL maintain continuous time display
3. THE User_Interface SHALL update Total_Focus_Time display at least once per second during active sessions
4. WHEN a session ends, THE User_Interface SHALL immediately reflect the updated Total_Focus_Time
5. THE User_Interface SHALL show both current session time and Total_Focus_Time simultaneously

### Requirement 6: System State Management

**User Story:** As a user, I want the system to handle transitions between different timing modes seamlessly, so that my focus sessions are not disrupted by technical switching.

#### Acceptance Criteria

1. WHEN switching from manual tracking to Pomodoro mode, THE Focus_Time_System SHALL preserve the current session state
2. WHEN switching from Pomodoro to manual tracking, THE Focus_Time_System SHALL maintain timing continuity
3. THE Focus_Time_System SHALL prevent data loss during mode transitions
4. WHEN system errors occur during transitions, THE Focus_Time_System SHALL recover gracefully and preserve timing data
5. THE Focus_Time_System SHALL maintain consistent timing precision across all modes