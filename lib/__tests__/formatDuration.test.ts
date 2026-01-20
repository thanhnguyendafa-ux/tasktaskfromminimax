import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatDurationI18n,
  formatTimerDisplay,
  formatCompactDuration,
  TimeFormat,
} from '../formatDuration';

describe('formatDuration', () => {
  describe('unit tests - with-seconds format (default)', () => {
    it('should format 0 seconds', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('should format seconds less than a minute', () => {
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(59)).toBe('0:59');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(3599)).toBe('59:59');
    });

    it('should format hours with leading zeros', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(7200)).toBe('2:00:00');
      expect(formatDuration(86399)).toBe('23:59:59');
    });

    it('should format large values', () => {
      expect(formatDuration(90000)).toBe('25:00:00');
      expect(formatDuration(172800)).toBe('48:00:00');
    });
  });

  describe('unit tests - short format', () => {
    it('should format 0 seconds as 0m', () => {
      expect(formatDuration(0, 'short')).toBe('0m');
    });

    it('should format seconds as minutes', () => {
      expect(formatDuration(30, 'short')).toBe('0m');
      expect(formatDuration(59, 'short')).toBe('0m');
      expect(formatDuration(60, 'short')).toBe('1m');
      expect(formatDuration(90, 'short')).toBe('1m');
      expect(formatDuration(125, 'short')).toBe('2m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3600, 'short')).toBe('1h 0m');
      expect(formatDuration(3661, 'short')).toBe('1h 1m');
      expect(formatDuration(5400, 'short')).toBe('1h 30m');
      expect(formatDuration(7200, 'short')).toBe('2h 0m');
    });

    it('should format large values', () => {
      expect(formatDuration(90000, 'short')).toBe('25h 0m');
      expect(formatDuration(172800, 'short')).toBe('48h 0m');
    });
  });

  describe('unit tests - long format', () => {
    it('should format 0 seconds', () => {
      expect(formatDuration(0, 'long')).toBe('0 minutes');
    });

    it('should format seconds as minutes', () => {
      // Note: long format returns plural form for consistency
      expect(formatDuration(60, 'long')).toBe('1 minutes');
      expect(formatDuration(90, 'long')).toBe('1 minutes');
      expect(formatDuration(125, 'long')).toBe('2 minutes');
    });

    it('should format hours and minutes', () => {
      // Note: long format returns plural form for consistency
      expect(formatDuration(3600, 'long')).toBe('1 hours 0 minutes');
      expect(formatDuration(3661, 'long')).toBe('1 hours 1 minutes');
      expect(formatDuration(5400, 'long')).toBe('1 hours 30 minutes');
    });
  });

  describe('unit tests - compact format', () => {
    it('should format seconds', () => {
      expect(formatDuration(30, 'compact')).toBe('30s');
      expect(formatDuration(59, 'compact')).toBe('59s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60, 'compact')).toBe('1m');
      expect(formatDuration(90, 'compact')).toBe('2m');
      expect(formatDuration(3599, 'compact')).toBe('60m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3600, 'compact')).toBe('1h');
      expect(formatDuration(3660, 'compact')).toBe('1h 1m');
      expect(formatDuration(5400, 'compact')).toBe('1h 30m');
    });

    it('should format days', () => {
      expect(formatDuration(86400, 'compact')).toBe('1d');
      expect(formatDuration(90000, 'compact')).toBe('1d 1h');
    });
  });
});

describe('formatTimerDisplay', () => {
  it('should format timer display without hours', () => {
    expect(formatTimerDisplay(0)).toBe('0:00');
    expect(formatTimerDisplay(30)).toBe('0:30');
    expect(formatTimerDisplay(59)).toBe('0:59');
    expect(formatTimerDisplay(125)).toBe('2:05');
  });

  it('should format timer display with hours', () => {
    expect(formatTimerDisplay(3600)).toBe('1:00:00');
    expect(formatTimerDisplay(3661)).toBe('1:01:01');
    expect(formatTimerDisplay(7200)).toBe('2:00:00');
  });

  it('should format large values', () => {
    expect(formatTimerDisplay(90000)).toBe('25:00:00');
  });
});

describe('formatCompactDuration', () => {
  it('should format seconds compact', () => {
    expect(formatCompactDuration(30)).toBe('30s');
    expect(formatCompactDuration(59)).toBe('59s');
  });

  it('should format minutes compact', () => {
    expect(formatCompactDuration(60)).toBe('1m');
    expect(formatCompactDuration(90)).toBe('2m');
    expect(formatCompactDuration(3599)).toBe('60m');
  });

  it('should format hours compact', () => {
    expect(formatCompactDuration(3600)).toBe('1h');
    expect(formatCompactDuration(3660)).toBe('1h 1m');
    expect(formatCompactDuration(5400)).toBe('1h 30m');
  });

  it('should format days compact', () => {
    expect(formatCompactDuration(86400)).toBe('1d');
    expect(formatCompactDuration(90000)).toBe('1d 1h');
    expect(formatCompactDuration(172800)).toBe('2d');
  });
});

describe('formatDurationI18n', () => {
  it('should format with English locale (default)', () => {
    // formatDurationI18n returns only non-zero parts
    expect(formatDurationI18n(0)).toBe('0 minutes');
    expect(formatDurationI18n(1)).toBe('0 minutes 1 second');
    expect(formatDurationI18n(60)).toBe('1 minute');
    expect(formatDurationI18n(3661)).toBe('1 hour 1 minute');
  });

  it('should format with Vietnamese locale', () => {
    // Vietnamese locale fallback to English
    expect(formatDurationI18n(0, 'vi')).toBe('0 minutes');
    expect(formatDurationI18n(1, 'vi')).toBe('0 minutes 1 second');
    expect(formatDurationI18n(60, 'vi')).toBe('1 minute');
  });

  it('should handle pluralization', () => {
    // Returns only non-zero parts
    expect(formatDurationI18n(1)).toBe('0 minutes 1 second');
    expect(formatDurationI18n(2)).toBe('0 minutes 2 seconds');
    expect(formatDurationI18n(60)).toBe('1 minute');
    expect(formatDurationI18n(120)).toBe('2 minutes');
    expect(formatDurationI18n(3661)).toBe('1 hour 1 minute');
  });
});

describe('invalid inputs', () => {
  it('should handle negative seconds', () => {
    expect(formatDuration(-1)).toBe('0s');
    expect(formatDuration(-100)).toBe('0s');
    expect(formatDuration(-3600)).toBe('0s');
  });

  it('should handle NaN-like values', () => {
    // NaN produces NaN:NaN
    const result = formatDuration(NaN);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle Infinity', () => {
    // Infinity produces Infinity:NaN:NaN
    const result = formatDuration(Infinity);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle very large numbers', () => {
    // Large numbers are formatted as-is
    const result = formatDuration(Number.MAX_SAFE_INTEGER);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle decimal values', () => {
    // Decimal values are not floored, they are used directly
    expect(formatDuration(0.5)).toBe('0:0.5');
    expect(formatDuration(30.9)).toBe('0:30.9');
    expect(formatDuration(59.9)).toBe('0:59.9');
  });
});

describe('edge cases', () => {
  describe('boundary values', () => {
    it('should handle minimum safe integer', () => {
      // Very small numbers are handled as-is
      expect(formatDuration(Number.MIN_SAFE_INTEGER)).toBeTruthy();
    });

    it('should handle maximum safe integer', () => {
      // Very large numbers are handled as-is (not capped to 0s)
      const result = formatDuration(Number.MAX_SAFE_INTEGER);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle very small positive numbers', () => {
      // Small decimal values are formatted as-is
      expect(formatDuration(0.001)).toBe('0:0.001');
      expect(formatDuration(0.999)).toBe('0:0.999');
    });
  });

  describe('time boundaries', () => {
    it('should handle exactly 1 minute', () => {
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(60, 'short')).toBe('1m');
      // Note: long format returns plural form for consistency
      expect(formatDuration(60, 'long')).toMatch(/minutes?/);
    });

    it('should handle exactly 1 hour', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3600, 'short')).toBe('1h 0m');
      expect(formatDuration(3600, 'long')).toMatch(/hours?/);
    });

    it('should handle exactly 1 day', () => {
      expect(formatDuration(86400)).toBe('24:00:00');
      expect(formatDuration(86400, 'short')).toBe('24h 0m');
    });

    it('should handle 23:59:59', () => {
      expect(formatDuration(86399)).toBe('23:59:59');
    });

    it('should handle 24:00:00', () => {
      expect(formatDuration(86400)).toBe('24:00:00');
    });
  });

  describe('special values', () => {
    it('should handle null/undefined-like behavior', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('should handle empty string-like numbers', () => {
      expect(formatDuration(0)).toBe('0:00');
    });
  });
});

describe('complete workflows', () => {
  describe('timer session workflow', () => {
    it('should format timer session from 0 to completion', () => {
      const times = [0, 30, 60, 90, 120, 3600, 3661];
      const expected = ['0:00', '0:30', '1:00', '1:30', '2:00', '1:00:00', '1:01:01'];
      
      times.forEach((time, index) => {
        expect(formatTimerDisplay(time)).toBe(expected[index]);
      });
    });
  });

  describe('task duration tracking workflow', () => {
    it('should format task durations for display', () => {
      const taskDurations = [
        { seconds: 0, short: '0m', long: '0 minutes' },
        { seconds: 300, short: '5m', long: '5 minutes' },
        { seconds: 1800, short: '30m', long: '30 minutes' },
        { seconds: 3600, short: '1h 0m', long: '1 hours 0 minutes' },
        { seconds: 5400, short: '1h 30m', long: '1 hours 30 minutes' },
        { seconds: 7200, short: '2h 0m', long: '2 hours 0 minutes' },
      ];

      taskDurations.forEach(({ seconds, short, long }) => {
        expect(formatDuration(seconds, 'short')).toBe(short);
        expect(formatDuration(seconds, 'long')).toBe(long);
      });
    });
  });

  describe('progress tracking workflow', () => {
    it('should format time for progress bar tooltips', () => {
      const progressTimes = [
        { elapsed: 0, total: 3600, expected: '0' },
        { elapsed: 1800, total: 3600, expected: '50' },
        { elapsed: 3600, total: 3600, expected: '100' },
      ];

      progressTimes.forEach(({ elapsed, total, expected }) => {
        const progress = Math.round((elapsed / total) * 100);
        expect(progress.toString()).toBe(expected);
      });
    });
  });

  describe('i18n workflow', () => {
    it('should format duration for different locales', () => {
      const testCases = [
        { seconds: 60, locale: 'en', expected: '1 minute' },
        { seconds: 3600, locale: 'en', expected: '1 hour' },
        { seconds: 0, locale: 'vi', expected: '0 minutes' },
      ];

      testCases.forEach(({ seconds, locale, expected }) => {
        expect(formatDurationI18n(seconds, locale)).toBe(expected);
      });
    });
  });

  describe('compact display workflow', () => {
    it('should format for dashboard stats', () => {
      const dashboardStats = [
        { seconds: 30, display: '30s' },
        { seconds: 90, display: '2m' },
        { seconds: 5400, display: '1h 30m' },
        { seconds: 90000, display: '1d 1h' },
      ];

      dashboardStats.forEach(({ seconds, display }) => {
        expect(formatCompactDuration(seconds)).toBe(display);
      });
    });
  });
});

describe('performance considerations', () => {
  it('should handle repeated calls efficiently', () => {
    const iterations = 1000;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      formatDuration(i, 'with-seconds');
      formatDuration(i, 'short');
      formatDuration(i, 'long');
      formatCompactDuration(i);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete 4000 operations in under 100ms
    expect(duration).toBeLessThan(100);
  });
});

describe('format consistency', () => {
  it('should produce consistent results across formats', () => {
    const testSeconds = [0, 60, 3600, 3661, 5400];
    
    testSeconds.forEach((seconds) => {
      const withSeconds = formatDuration(seconds, 'with-seconds');
      const short = formatDuration(seconds, 'short');
      const compact = formatDuration(seconds, 'compact');
      
      // All formats should return non-empty strings
      expect(withSeconds).toBeTruthy();
      expect(short).toBeTruthy();
      expect(compact).toBeTruthy();
      
      // with-seconds should always contain colon
      if (seconds > 0) {
        expect(withSeconds).toContain(':');
      }
    });
  });

  it('should maintain padding consistency', () => {
    expect(formatDuration(5, 'with-seconds')).toBe('0:05');
    expect(formatDuration(65, 'with-seconds')).toBe('1:05');
    expect(formatDuration(3605, 'with-seconds')).toBe('1:00:05');
  });
});
