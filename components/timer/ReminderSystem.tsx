"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Clock, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Task } from "@/types";

interface ReminderSystemProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
}

export function ReminderSystem({ task, onUpdate }: ReminderSystemProps) {
  const [isEnabled, setIsEnabled] = useState(task.reminder_enabled || false);
  const [intervalMinutes, setIntervalMinutes] = useState(task.reminder_interval_minutes || 60);
  const [nextReminder, setNextReminder] = useState<Date | null>(
    task.next_reminder_at ? new Date(task.next_reminder_at) : null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [timeUntilReminder, setTimeUntilReminder] = useState("");

  // Countdown to next reminder
  useEffect(() => {
    if (!nextReminder || !isEnabled) {
      setTimeUntilReminder("");
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = nextReminder.getTime() - now;
      
      if (diff <= 0) {
        setTimeUntilReminder("Due now!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilReminder(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntilReminder(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilReminder(`${seconds}s`);
      }
    };

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerInterval);
  }, [nextReminder, isEnabled]);

  const toggleReminder = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    onUpdate({
      reminder_enabled: newEnabled,
      next_reminder_at: newEnabled
        ? new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString()
        : null,
    });
  };

  const saveSettings = () => {
    onUpdate({
      reminder_interval_minutes: intervalMinutes,
      next_reminder_at: isEnabled
        ? new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString()
        : null,
    });
    setShowSettings(false);
  };

  const intervalOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 360, label: "6 hours" },
    { value: 1440, label: "24 hours" },
  ];

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleReminder}
              className={`p-3 rounded-xl transition-all ${
                isEnabled
                  ? "bg-accent-primary text-white"
                  : "bg-dark-tertiary text-text-muted"
              }`}
            >
              {isEnabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </motion.button>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isEnabled ? "Reminder Active" : "Reminder Off"}
              </p>
              {isEnabled && timeUntilReminder && (
                <p className="text-xs text-text-muted">
                  Next: {timeUntilReminder}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEnabled && (
              <Badge variant="success">Every {intervalMinutes}m</Badge>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-dark-tertiary text-text-muted"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {isEnabled && task.due_date && (
          <div className="mt-4 pt-4 border-t border-dark-tertiary">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4" />
              <span>Due: {new Date(task.due_date).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Reminder Settings"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Remind me every
            </label>
            <div className="grid grid-cols-2 gap-2">
              {intervalOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIntervalMinutes(opt.value)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    intervalMinutes === opt.value
                      ? "bg-accent-primary text-white"
                      : "bg-dark-tertiary text-text-primary hover:bg-opacity-80"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowSettings(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveSettings} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
