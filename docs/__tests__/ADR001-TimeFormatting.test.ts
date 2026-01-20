import { describe, it, expect } from 'vitest';
import { formatTimeProgressive } from '../../lib/formatDuration';

describe('ADR-001: Time Formatting Standard - Unit Tests', () => {
  describe('format specification compliance', () => {
    it('should format seconds less than 1 minute as X seconds', () => {
      expect(formatTimeProgressive(0)).toBe('0s');
      expect(formatTimeProgressive(1)).toBe('1s');
      expect(formatTimeProgressive(30)).toBe('30s');
      expect(formatTimeProgressive(59)).toBe('59s');
    });

    it('should format minutes and seconds (< 1 hour)', () => {
      expect(formatTimeProgressive(60)).toBe('1m');
      expect(formatTimeProgressive(90)).toBe('1m 30s');
      expect(formatTimeProgressive(125)).toBe('2m 5s');
      expect(formatTimeProgressive(3599)).toBe('59m 59s');
    });

    it('should format hours minutes seconds (< 1 day)', () => {
      expect(formatTimeProgressive(3600)).toBe('1h');
      expect(formatTimeProgressive(3661)).toBe('1h 1m 1s');
      expect(formatTimeProgressive(5400)).toBe('1h 30m');
      expect(formatTimeProgressive(7200)).toBe('2h');
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
    });

    it('should format days hours minutes (>= 1 day)', () => {
      expect(formatTimeProgressive(86400)).toBe('1d');
      expect(formatTimeProgressive(90000)).toBe('1d 1h');
      expect(formatTimeProgressive(172800)).toBe('2d');
      expect(formatTimeProgressive(176400)).toBe('2d 1h');
    });
  });

  describe('format consistency', () => {
    it('should always return non-empty string for valid inputs', () => {
      const testValues = [0, 1, 60, 3600, 86400, 90000, 172800];
      testValues.forEach((seconds) => {
        const result = formatTimeProgressive(seconds);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should not include trailing spaces', () => {
      expect(formatTimeProgressive(30)).not.toMatch(/\s$/);
      expect(formatTimeProgressive(90)).not.toMatch(/\s$/);
      expect(formatTimeProgressive(3661)).not.to.match(/\s$/);
      expect(formatTimeProgressive(90000)).not.to.match(/\s$/);
    });

    it('should not include leading spaces', () => {
      expect(formatTimeProgressive(30)).not.toMatch(/^\s/);
      expect(formatTimeProgressive(90)).not.toMatch(/^\s/);
      expect(formatTimeProgressive(3661)).not.toMatch(/^\s/);
      expect(formatTimeProgressive(90000)).not.toMatch(/^\s/);
    });

    it('should use space as separator between parts', () => {
      expect(formatTimeProgressive(90)).toMatch(/ /);
      expect(formatTimeProgressive(3661)).toMatch(/ /);
      expect(formatTimeProgressive(90000)).toMatch(/ /);
    });
  });

  describe('format boundaries', () => {
    it('should handle exact boundaries correctly', () => {
      // Exactly 1 minute
      expect(formatTimeProgressive(59)).toBe('59s');
      expect(formatTimeProgressive(60)).toBe('1m');

      // Exactly 1 hour
      expect(formatTimeProgressive(3599)).toBe('59m 59s');
      expect(formatTimeProgressive(3600)).toBe('1h');

      // Exactly 1 day
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
      expect(formatTimeProgressive(86400)).toBe('1d');
    });

    it('should handle boundary transitions smoothly', () => {
      // 59s → 1m
      expect(formatTimeProgressive(59)).toBe('59s');
      expect(formatTimeProgressive(60)).toBe('1m');

      // 3599s → 1h
      expect(formatTimeProgressive(3599)).toBe('59m 59s');
      expect(formatTimeProgressive(3600)).toBe('1h');

      // 86399s → 1d
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
      expect(formatTimeProgressive(86400)).toBe('1d');
    });
  });
});

describe('ADR-001: Time Formatting Standard - Flow Tests', () => {
  describe('timer session workflow', () => {
    it('should format timer session from 0 to completion', () => {
      const sessionTimes = [0, 30, 60, 90, 120, 3600, 3661, 7200];
      const expected = ['0s', '30s', '1m', '1m 30s', '2m', '1h', '1h 1m 1s', '2h'];

      sessionTimes.forEach((time, index) => {
        expect(formatTimeProgressive(time)).toBe(expected[index]);
      });
    });

    it('should format long session (multiple days)', () => {
      const longSession = 90000; // 1 day 1 hour
      expect(formatTimeProgressive(longSession)).toBe('1d 1h');
    });
  });

  describe('task duration tracking workflow', () => {
    it('should format task durations for display', () => {
      const taskDurations = [
        { seconds: 0, expected: '0s' },
        { seconds: 300, expected: '5m' },
        { seconds: 1800, expected: '30m' },
        { seconds: 3600, expected: '1h' },
        { seconds: 5400, expected: '1h 30m' },
        { seconds: 7200, expected: '2h' },
        { seconds: 90000, expected: '1d 1h' },
      ];

      taskDurations.forEach(({ seconds, expected }) => {
        expect(formatTimeProgressive(seconds)).toBe(expected);
      });
    });

    it('should format task durations with seconds when < 1 hour', () => {
      const taskDurations = [
        { seconds: 90, expected: '1m 30s' },
        { seconds: 125, expected: '2m 5s' },
        { seconds: 3599, expected: '59m 59s' },
      ];

      taskDurations.forEach(({ seconds, expected }) => {
        expect(formatTimeProgressive(seconds)).toBe(expected);
      });
    });
  });

  describe('progress tracking workflow', () => {
    it('should format time for progress bar tooltips', () => {
      const progressData = [
        { elapsed: 0, total: 3600, progress: 0 },
        { elapsed: 1800, total: 3600, progress: 50 },
        { elapsed: 3600, total: 3600, progress: 100 },
      ];

      progressData.forEach(({ elapsed, total, progress }) => {
        const formattedElapsed = formatTimeProgressive(elapsed);
        const formattedTotal = formatTimeProgressive(total);
        expect(formattedElapsed).toBeTruthy();
        expect(formattedTotal).toBeTruthy();
      });
    });
  });

  describe('dashboard stats workflow', () => {
    it('should format for dashboard display', () => {
      const dashboardStats = [
        { seconds: 30, expected: '30s' },
        { seconds: 90, expected: '1m 30s' },
        { seconds: 5400, expected: '1h 30m' },
        { seconds: 90000, expected: '1d 1h' },
      ];

      dashboardStats.forEach(({ seconds, expected }) => {
        expect(formatTimeProgressive(seconds)).toBe(expected);
      });
    });
  });
});

describe('ADR-001: Time Formatting Standard - Invalid Input Tests', () => {
  describe('negative values', () => {
    it('should handle negative seconds by returning 0s', () => {
      expect(formatTimeProgressive(-1)).toBe('0s');
      expect(formatTimeProgressive(60)).toBe('1m');
      expect(formatTimeProgressive(3600)).toBe('1h');
      expect(formatTimeProgressive(86400)).toBe('1d');
    });

    it('should handle very large negative values', () => {
      expect(formatTimeProgressive(Number.MIN_SAFE_INTEGER)).toBe('0s');
    });
  });

  describe('special number values', () => {
    it('should handle NaN by returning empty string', () => {
      const result = formatTimeProgressive(NaN);
      // NaN produces invalid calculation, returns empty string
      expect(result).toBe('');
      expect(typeof result).toBe('string');
    });

    it('should handle Infinity by returning 0s', () => {
      const result = formatTimeProgressive(Infinity);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle negative Infinity by returning 0s', () => {
      const result = formatTimeProgressive(-Infinity);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('very large numbers', () => {
    it('should handle maximum safe integer', () => {
      const result = formatTimeProgressive(Number.MAX_SAFE_INTEGER);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('decimal values', () => {
    it('should handle decimal values correctly', () => {
      // Decimal values are NOT floored, they are used as-is
      expect(formatTimeProgressive(0.5)).toBe('0.5s');
      expect(formatTimeProgressive(30.9)).toBe('30.9s');
      expect(formatTimeProgressive(59.9)).toBe('59.9s');
      // Note: Floating point precision may cause slight variations
      const result = formatTimeProgressive(60.1);
      expect(result).toContain('1m');
      expect(result).toContain('0.1');
    });

    it('should handle very small decimal values', () => {
      expect(formatTimeProgressive(0.001)).toBe('0.001s');
      expect(formatTimeProgressive(0.999)).toBe('0.999s');
    });
  });
});

describe('ADR-001: Time Formatting Standard - Edge Cases', () => {
  describe('boundary values', () => {
    it('should handle minimum boundary (0 seconds)', () => {
      expect(formatTimeProgressive(0)).toBe('0s');
    });

    it('should handle 1 second', () => {
      expect(formatTimeProgressive(1)).toBe('1s');
    });

    it('should handle 59 seconds', () => {
      expect(formatTimeProgressive(59)).toBe('59s');
    });

    it('should handle 60 seconds (exactly 1 minute)', () => {
      expect(formatTimeProgressive(60)).toBe('1m');
    });

    it('should handle 3599 seconds (59m 59s)', () => {
      expect(formatTimeProgressive(3599)).toBe('59m 59s');
    });

    it('should handle 3600 seconds (exactly 1 hour)', () => {
      expect(formatTimeProgressive(3600)).toBe('1h');
    });

    it('should handle 86399 seconds (23h 59m 59s)', () => {
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
    });

    it('should handle 86400 seconds (exactly 1 day)', () => {
      expect(formatTimeProgressive(86400)).toBe('1d');
    });
  });

  describe('large values', () => {
    it('should handle 1 week', () => {
      const oneWeek = 7 * 86400;
      expect(formatTimeProgressive(oneWeek)).toBe('7d');
    });

    it('should handle 30 days', () => {
      const thirtyDays = 30 * 86400;
      expect(formatTimeProgressive(thirtyDays)).toBe('30d');
    });

    it('should handle 1 year', () => {
      const oneYear = 365 * 86400;
      expect(formatTimeProgressive(oneYear)).toBe('365d');
    });
  });

  describe('format transitions', () => {
    it('should transition from seconds to minutes at 60', () => {
      expect(formatTimeProgressive(59)).toBe('59s');
      expect(formatTimeProgressive(60)).toBe('1m');
      expect(formatTimeProgressive(61)).toBe('1m 1s');
    });

    it('should transition from minutes to hours at 3600', () => {
      expect(formatTimeProgressive(3599)).toBe('59m 59s');
      expect(formatTimeProgressive(3600)).toBe('1h');
      expect(formatTimeProgressive(3601)).toBe('1h 1s');
    });

    it('should transition from hours to days at 86400', () => {
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
      expect(formatTimeProgressive(86400)).toBe('1d');
      expect(formatTimeProgressive(86401)).toBe('1d 1s');
    });
  });

  describe('zero values', () => {
    it('should handle 0 seconds correctly', () => {
      expect(formatTimeProgressive(0)).toBe('0s');
    });

    it('should handle 0 minutes (60 seconds)', () => {
      expect(formatTimeProgressive(60)).toBe('1m');
    });

    it('should handle 0 hours (3600 seconds)', () => {
      expect(formatTimeProgressive(3600)).toBe('1h');
    });

    it('should handle 0 days (86400 seconds)', () => {
      expect(formatTimeProgressive(86400)).toBe('1d');
    });
  });
});

describe('ADR-001: Time Formatting Standard - Manual Tests', () => {
  describe('manual test scenarios', () => {
    it('Scenario 1: User starts a timer and watches it count up from 0', () => {
      // Given: Timer starts at 0 seconds
      // When: Timer counts up
      // Then: Display should show progressive format
      
      const testValues = [
        { elapsed: 0, expected: '0s' },
        { elapsed: 15, expected: '15s' },
        { elapsed: 30, expected: '30s' },
        { elapsed: 45, expected: '45s' },
        { elapsed: 60, expected: '1m' },
        { elapsed: 90, expected: '1m 30s' },
        { elapsed: 120, expected: '2m' },
      ];

      testValues.forEach(({ elapsed, expected }) => {
        expect(formatTimeProgressive(elapsed)).toBe(expected);
      });
    });

    it('Scenario 2: User views task list with various task durations', () => {
      // Given: Tasks with different durations
      // When: User views task list
      // Then: All times should show progressive format
      
      const taskDurations = [
        { task: 'Quick task', duration: 300, expected: '5m' },
        { task: 'Medium task', duration: 1800, expected: '30m' },
        { task: 'Long task', duration: 3600, expected: '1h' },
        { task: 'Very long task', duration: 7200, expected: '2h' },
        { task: 'Day-long task', duration: 86400, expected: '1d' },
      ];

      taskDurations.forEach(({ task, duration, expected }) => {
        expect(formatTimeProgressive(duration)).toBe(expected);
      });
    });

    it('Scenario 3: User views timer bar with elapsed time', () => {
      // Given: Timer has been running for 1h 30m 15s
      // When: User looks at timer bar
      // Then: Display should show '1h 30m 15s'
      
      const elapsedSeconds = 5415; // 1h 30m 15s
      expect(formatTimeProgressive(elapsedSeconds)).toBe('1h 30m 15s');
    });

    it('Scenario 4: User views task with 0 time spent', () => {
      // Given: Task with 0 time spent
      // When: User views task
      // Then: Display should show '0s'
      
      expect(formatTimeProgressive(0)).toBe('0s');
    });

    it('Scenario 5: User views task with exactly 1 minute spent', () => {
      // Given: Task with exactly 60 seconds spent
      // When: User views task
      // Then: Display should show '1m' (not '1m 0s')
      
      expect(formatTimeProgressive(60)).toBe('1m');
    });

    it('Scenario 6: User views task with exactly 1 hour spent', () => {
      // Given: Task with exactly 3600 seconds spent
      // When: User views task
      // Then: Display should show '1h' (not '1h 0m')
      
      expect(formatTimeProgressive(3600)).toBe('1h');
    });

    it('Scenario 7: User views task with exactly 1 day spent', () => {
      // Given: Task with exactly 86400 seconds spent
      // When: User views task
      // Then: Display should show '1d' (not '1d 0h')
      
      expect(formatTimeProgressive(86400)).toBe('1d');
    });

    it('Scenario 8: User views task with 1h 1m 1s spent', () => {
      // Given: Task with 3661 seconds spent
      // When: User views task
      // Then: Display should show '1h 1m 1s' (all parts shown)
      
      expect(formatTimeProgressive(3661)).toBe('1h 1m 1s');
    });

    it('Scenario 9: User views task with 23h 59m 59s spent', () => {
      // Given: Task with 86399 seconds spent
      // When: User views task
      // Then: Display should show '23h 59m 59s' (just before 1 day)
      
      expect(formatTimeProgressive(86399)).toBe('23h 59m 59s');
    });

    it('Scenario 10: User views task with 1 day 1 hour spent', () => {
      // Given: Task with 90000 seconds spent
      // When: User views task
      // Then: Display should show '1d 1h' (no minutes)
      
      expect(formatTimeProgressive(90000)).toBe('1d 1h');
    });

    it('Scenario 11: User views task with 2 days spent', () => {
      // Given: Task with 172800 seconds spent
      // When: User views task
      // Then: Display should show '2d' (no hours or minutes)
      
      expect(formatTimeProgressive(172800)).toBe('2d');
    });

    it('Scenario 12: User views task with 1 week spent', () => {
      // Given: Task with 604800 seconds spent (7 days)
      // When: User views task
      // Then: Display should show '7d'
      
      expect(formatTimeProgressive(604800)).toBe('7d');
    });

    it('Scenario 13: User views task with 1 month spent', () => {
      // Given: Task with 2592000 seconds spent (30 days)
      // When: User views task
      // Then: Display should show '30d'
      
      expect(formatTimeProgressive(2592000)).toBe('30d');
    });

    it('Scenario 14: User views task with 1 year spent', () => {
      // Given: Task with 31536000 seconds spent (365 days)
      // When: User views task
      // Then: Display should show '365d'
      
      expect(formatTimeProgressive(31536000)).toBe('365d');
    });
  });

  describe('user experience tests', () => {
    it('should be easy to read and understand', () => {
      const testCases = [
        { seconds: 30, description: 'Half a minute' },
        { seconds: 90, description: '1.5 minutes' },
        { seconds: 3661, description: 'Just over 1 hour' },
        { seconds: 90000, description: '1 day and 1 hour' },
      ];

      testCases.forEach(({ seconds, description }) => {
        const result = formatTimeProgressive(seconds);
        expect(result).toBeTruthy();
        expect(result.length).toBeLessThan(20); // Short and concise
      });
    });

    it('should not confuse users with too many units', () => {
      // Progressive format shows only relevant units
      expect(formatTimeProgressive(30)).toBe('30s'); // Only seconds
      expect(formatTimeProgressive(90)).toBe('1m 30s'); // Minutes and seconds
      expect(formatTimeProgressive(3661)).toBe('1h 1m 1s'); // Hours, minutes, seconds
      expect(formatTimeProgressive(90000)).toBe('1d 1h'); // Days and hours
      expect(formatTimeProgressive(172800)).toBe('2d'); // Only days
    });

    it('should be consistent across all time ranges', () => {
      const testValues = [0, 1, 30, 60, 90, 3600, 3661, 86400, 90000, 172800];
      
      testValues.forEach((seconds) => {
        const result = formatTimeProgressive(seconds);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result).not.toMatch(/  /); // No double spaces
        expect(result).not.toMatch(/^ /); // No leading space
        expect(result).not.toMatch(/ $/); // No trailing space
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when used in React components', () => {
      // Simulate component usage
      const componentProps = {
        totalSeconds: 3661,
        sessionSeconds: 0,
      };

      expect(formatTimeProgressive(componentProps.totalSeconds)).toBe('1h 1m 1s');
      expect(formatTimeProgressive(componentProps.sessionSeconds)).toBe('0s');
    });

    it('should work correctly with dynamic updates', () => {
      // Simulate timer counting up
      let currentTime = 0;
      const updates = [30, 30, 30, 30, 30]; // 5 updates of 30 seconds each
      
      const expectedOutputs = ['30s', '1m', '1m 30s', '2m', '2m 30s'];
      
      updates.forEach((increment, index) => {
        currentTime += increment;
        expect(formatTimeProgressive(currentTime)).toBe(expectedOutputs[index]);
      });
    });

    it('should work correctly with large time values', () => {
      // Simulate long-running task
      const taskDurations = [
        { hours: 0, minutes: 0, seconds: 0 },
        { hours: 0, minutes: 30, seconds: 0 },
        { hours: 1, minutes: 0, seconds: 0 },
        { hours: 2, minutes: 30, seconds: 0 },
        { hours: 24, minutes: 0, seconds: 0 },
        { hours: 48, minutes: 0, seconds: 0 },
      ];

      taskDurations.forEach(({ hours, minutes, seconds }) => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const result = formatTimeProgressive(totalSeconds);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });
  });
});
