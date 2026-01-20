"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { Task } from '@/types';

interface UsePageVisibilityOptions {
  onAway?: () => void;
  onReturn?: () => void;
  awayThresholdMs?: number;
}

export function usePageVisibility(options: UsePageVisibilityOptions = {}) {
  const { onAway, onReturn, awayThresholdMs = 30000 } = options;
  const { activeTaskId } = useTimerStore();
  const { pauseTimer, resumeTimer } = useTaskStore();
  const awayStartRef = useRef<number | null>(null);
  const awayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVisibilityChange = useCallback(() => {
    if (!activeTaskId) return;

    if (document.hidden) {
      awayStartRef.current = Date.now();
      awayTimerRef.current = setTimeout(() => {
        pauseTimer(activeTaskId);
        onAway?.();
      }, awayThresholdMs);
    } else {
      if (awayStartRef.current) {
        const awayDuration = Date.now() - awayStartRef.current;
        if (awayDuration >= awayThresholdMs) {
          onAway?.();
        } else {
          resumeTimer(activeTaskId);
          onReturn?.();
        }
      } else {
        resumeTimer(activeTaskId);
        onReturn?.();
      }
      awayStartRef.current = null;
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
        awayTimerRef.current = null;
      }
    }
  }, [activeTaskId, pauseTimer, resumeTimer, onAway, onReturn, awayThresholdMs]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }
    };
  }, [handleVisibilityChange]);
}

export function useTimerSync(taskId: string | null) {
  const { tick, syncElapsed } = useTimerStore();
  const { tasks } = useTaskStore();

  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [taskId, tick]);

  useEffect(() => {
    if (!taskId) return;
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task) {
      syncElapsed(task);
    }
  }, [taskId, tasks, syncElapsed]);
}
