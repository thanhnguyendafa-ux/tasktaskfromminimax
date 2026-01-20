"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Calendar, Award } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { formatTimeProgressive } from "@/lib/formatDuration";
import type { TimeTracking, FocusAnalytics } from "@/types";

export function FocusAnalytics() {
  const { profile } = useUserStore();
  const [sessions, setSessions] = useState<TimeTracking[]>([]);
  const [analytics, setAnalytics] = useState<FocusAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [profile, period]);

  const fetchAnalytics = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await fetch(
        `/api/timer/sessions?user_id=${profile.id}&start_date=${startDate.toISOString()}`
      );

      if (response.ok) {
        const { data } = await response.json();
        setSessions(data || []);
        calculateAnalytics(data || [], days);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions: TimeTracking[], days: number) => {
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60;
    const totalXp = sessions.reduce((acc, s) => acc + (s.xp_earned || 0), 0);
    const totalCoins = sessions.reduce((acc, s) => acc + (s.coins_earned || 0), 0);

    // Calculate streak
    const uniqueDays = new Set(sessions.map(s => new Date(s.start_time).toDateString()));
    const streakDays = uniqueDays.size;

    // Find most productive day
    const dayCounts: Record<string, number> = {};
    sessions.forEach(s => {
      const day = new Date(s.start_time).toLocaleDateString('vi-VN', { weekday: 'short' });
      dayCounts[day] = (dayCounts[day] || 0) + (s.duration_seconds || 0);
    });
    const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Top tasks
    const taskMinutes: Record<string, { title: string; minutes: number }> = {};
    sessions.forEach(s => {
      const taskId = s.task_id;
      if (!taskMinutes[taskId]) {
        taskMinutes[taskId] = { title: (s as any).task?.title || 'Unknown', minutes: 0 };
      }
      taskMinutes[taskId].minutes += (s.duration_seconds || 0) / 60;
    });
    const topTasks = Object.entries(taskMinutes)
      .map(([id, data]) => ({ taskId: id, ...data }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    // Daily data for chart
    const dailyData: { date: string; minutes: number; sessions: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.start_time.startsWith(dateStr));
      dailyData.push({
        date: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
        minutes: daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60,
        sessions: daySessions.length,
      });
    }

    setAnalytics({
      totalMinutes: Math.round(totalMinutes),
      totalSessions: sessions.length,
      averageSessionMinutes: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
      totalXpEarned: totalXp,
      totalCoinsEarned: totalCoins,
      streakDays,
      mostProductiveDay,
      topTasks,
      dailyData,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-dark-tertiary text-text-secondary hover:bg-dark-secondary'
            }`}
          >
            {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : '90 ngày'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-secondary rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Tổng thời gian</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {formatTimeProgressive((analytics?.totalMinutes || 0) * 60)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-secondary rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Phiên làm việc</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{analytics?.totalSessions || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-secondary rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">XP kiếm được</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">+{analytics?.totalXpEarned || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-secondary rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Streak ngày</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{analytics?.streakDays || 0} ngày</p>
        </motion.div>
      </div>

      {/* Daily Chart */}
      {analytics && analytics.dailyData.length > 0 && (
        <div className="bg-dark-secondary rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Thời gian tập trung theo ngày</h3>
          <div className="flex items-end gap-1 h-32">
            {analytics.dailyData.slice(-14).map((day, index) => {
              const maxMinutes = Math.max(...analytics.dailyData.slice(-14).map(d => d.minutes), 1);
              const height = (day.minutes / maxMinutes) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${Math.round(day.minutes)} phút`}
                  ></div>
                  <span className="text-[10px] text-text-muted mt-1 truncate w-full text-center">
                    {day.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Tasks */}
      {analytics && analytics.topTasks.length > 0 && (
        <div className="bg-dark-secondary rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Công việc tập trung nhiều nhất</h3>
          <div className="space-y-3">
            {analytics.topTasks.map((task, index) => (
              <div key={task.taskId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-dark-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(task.minutes / analytics.topTasks[0].minutes) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-text-muted">{formatTimeProgressive(task.minutes * 60)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="bg-dark-secondary rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Phiên làm việc gần đây</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-dark-tertiary rounded-lg">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {(session as any).task?.title || 'Task'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(session.start_time).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {formatTimeProgressive(session.duration_seconds || 0)}
                  </p>
                  <p className="text-xs text-green-400">+{session.xp_earned} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
