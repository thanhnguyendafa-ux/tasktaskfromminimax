# ADR-001: Time Formatting Standard

## Status
Accepted

## Context
Multiple time formats across components causing inconsistency:
- TaskCard: `formatDuration()` → "1:01:01" (HH:MM:SS)
- TimerBar: `formatDuration()` → "1:01:01" (HH:MM:SS)
- PomodoroTimer: Local `formatTime` → "25:00" (MM:SS)
- ManualTimer: Local `formatTime` → "01:01:01" (HH:MM:SS)
- TimeAwayTracker: Local `formatTime` → "1h 30m" (compact)
- TimerTracker: `formatTimeProgressive` → "1h 1m 1s" (progressive)

This inconsistency causes:
- User confusion when seeing different formats
- Difficult to maintain code
- Hard to add new features
- Testing complexity

## Decision
Use [`formatTimeProgressive`](../lib/formatDuration.ts) as the standard time format across the entire application.

## Format Specification

### Format Rules
- **< 1 minute**: Display as seconds only
  - Example: `30s`, `59s`
  
- **< 1 hour**: Display as minutes and seconds
  - Example: `1m 30s`, `59m 59s`
  
- **< 1 day**: Display as hours, minutes, and seconds
  - Example: `1h 30m 15s`, `23h 59m 59s`
  
- **>= 1 day**: Display as days, hours, and minutes
  - Example: `1d 2h 30m`, `7d 0h`

### Examples

| Seconds | Output |
|---------|--------|
| 0 | `0s` |
| 30 | `30s` |
| 90 | `1m 30s` |
| 3661 | `1h 1m 1s` |
| 5400 | `1h 30m` |
| 86399 | `23h 59m 59s` |
| 86400 | `1d` |
| 90000 | `1d 1h` |
| 172800 | `2d` |

## Implementation

### Standard Function
```typescript
// lib/formatDuration.ts
export function formatTimeProgressive(seconds: number): string {
  if (seconds < 0) return '0s';
  if (seconds < 60) return `${seconds}s`;

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600)) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
```

### Usage
```typescript
import { formatTimeProgressive } from '@/lib/formatDuration';

// In components
const timeDisplay = formatTimeProgressive(task.total_time_seconds);
```

## Migration Plan

### Phase 1: Documentation (Completed)
- [x] Create ADR-001
- [x] Document format specification
- [x] Create migration checklist

### Phase 2: Component Updates
- [ ] Update TaskCard.tsx
- [ ] Update TimerBar.tsx
- [ ] Update PomodoroTimer.tsx
- [ ] Update ManualTimer.tsx
- [ ] Update TimeAwayTracker.tsx
- [ ] Update FocusAnalytics.tsx

### Phase 3: Testing
- [ ] Update unit tests
- [ ] Add integration tests
- [ ] Add visual regression tests
- [ ] Verify all tests pass

### Phase 4: Code Review
- [ ] Review all changes
- [ ] Ensure no breaking changes
- [ ] Update documentation

## Migration Checklist

For each component:
- [ ] Import `formatTimeProgressive` from `@/lib/formatDuration`
- [ ] Remove local `formatTime` function
- [ ] Replace all time formatting calls with `formatTimeProgressive`
- [ ] Update tests to expect new format
- [ ] Verify component still works correctly
- [ ] Run tests and ensure they pass

## Components to Update

| Component | Current Format | New Format | Priority |
|-----------|---------------|------------|----------|
| TaskCard.tsx | `formatDuration()` | `formatTimeProgressive` | High |
| TimerBar.tsx | `formatDuration()` | `formatTimeProgressive` | High |
| PomodoroTimer.tsx | Local `formatTime` | `formatTimeProgressive` | Medium |
| ManualTimer.tsx | Local `formatTime` | `formatTimeProgressive` | Medium |
| TimeAwayTracker.tsx | Local `formatTime` | `formatTimeProgressive` | Medium |
| FocusAnalytics.tsx | `formatDuration()` | `formatTimeProgressive` | Low |

## Benefits

### User Experience
- ✅ Consistent time display across all components
- ✅ Easy to understand progressive format
- ✅ No confusion between different formats

### Developer Experience
- ✅ Single source of truth
- ✅ Easier to maintain
- ✅ Easier to add new features
- ✅ Clear documentation

### Testing
- ✅ Easier to test (one format to test)
- ✅ Fewer test cases needed
- ✅ Predictable behavior

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes | Gradual migration, thorough testing |
| Performance impact | Minimal, same function complexity |
| Developer adoption | Clear documentation, code review |

## Alternatives Considered

### Alternative 1: Use default formatDuration format
- Rejected: Not progressive, doesn't show seconds for hours
- Rejected: Less user-friendly

### Alternative 2: Use wrapper function
- Rejected: Adds unnecessary abstraction
- Rejected: More functions to maintain

### Alternative 3: Keep multiple formats
- Rejected: Defeats the purpose of consistency
- Rejected: More complex to maintain

## References

- [formatDuration.ts](../lib/formatDuration.ts)
- [formatTimeProgressive tests](../lib/__tests__/formatDuration.test.ts)
- [TimerTracker component](../components/tasks/TimerTracker.tsx)

## Changelog

### Version 1.0 (2026-01-20)
- Initial ADR created
- Standard format defined as `formatTimeProgressive`
- Migration plan documented

---

**Next Steps**: Begin Phase 2 - Update components to use `formatTimeProgressive`
