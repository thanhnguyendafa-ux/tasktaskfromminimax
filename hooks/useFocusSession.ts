"use client";

import { useCallback } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { TimeTracking } from '@/types';

interface UseFocusSessionOptions {
  onSessionSaved?: (session: TimeTracking) => void;
  onError?: (error: Error) => void;
}

export function useFocusSession(options: UseFocusSessionOptions = {}) {
  const { onSessionSaved, onError } = options;
  const { tasks, updateTask } = useTaskStore();
  const { addXp, addCoins } = useUserStore();

  const saveSession = useCallback(async (
    taskId: string,
    startTime: string,
    endTime: string,
    sessionType: 'manual' | 'pomodoro' | 'break' = 'manual'
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const durationSeconds = Math.round((end - start) / 1000);

      if (durationSeconds < 10) {
        console.log('Session too short, skipping save');
        return null;
      }

      // Calculate rewards: 1 XP per minute, 0.5 coins per minute
      const durationMinutes = Math.round(durationSeconds / 60);
      const xpEarned = durationMinutes;
      const coinsEarned = Math.round(durationMinutes * 0.5);

      const sessionData = {
        task_id: taskId,
        user_id: task.user_id,
        start_time: startTime,
        end_time: endTime,
        duration_seconds: durationSeconds,
        session_type: sessionType,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        status: 'completed' as const,
      };

      const response = await fetch('/api/timer/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      const { data: session } = await response.json();

      // Update task total time
      updateTask(taskId, {
        total_time_seconds: task.total_time_seconds + durationSeconds,
      });

      // Award XP and coins
      if (xpEarned > 0) {
        addXp(xpEarned);
      }
      if (coinsEarned > 0) {
        addCoins(coinsEarned);
      }

      onSessionSaved?.(session);
      return session;
    } catch (error) {
      onError?.(error as Error);
      return null;
    }
  }, [tasks, updateTask, addXp, addCoins, onSessionSaved, onError]);

  const getSessionStats = useCallback(async (userId: string, days: number = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await fetch(
        `/api/timer/sessions?user_id=${userId}&start_date=${startDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session stats');
      }

      const { data: sessions } = await response.json();
      return sessions;
    } catch (error) {
      onError?.(error as Error);
      return [];
    }
  }, [onError]);

  return {
    saveSession,
    getSessionStats,
  };
}
