"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, BellOff, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ReminderSettingsProps {
  enabled: boolean;
  intervalMinutes: number;
  nextReminderAt: string | Date | null;
  reminderCount: number;
  onToggle: (enabled: boolean) => void;
  onSetInterval: (minutes: number) => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

export function ReminderSettings({
  enabled,
  intervalMinutes,
  nextReminderAt,
  reminderCount,
  onToggle,
  onSetInterval,
  onSnooze,
  onDismiss,
}: ReminderSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [intervalValue, setIntervalValue] = useState(intervalMinutes.toString());

  const intervalOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
  ];

  const getNextReminderText = () => {
    if (!nextReminderAt) return "No upcoming reminder";
    const next = new Date(nextReminderAt);
    const now = new Date();
    const diffMs = next.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes <= 0) return "Reminder due now!";
    if (diffMinutes < 60) return `In ${diffMinutes} minutes`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `In ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  };

  const handleSettingsSubmit = () => {
    const value = parseInt(intervalValue);
    if (value > 0) {
      onSetInterval(value);
      setShowSettings(false);
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Reminders</h3>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Toggle */}
        <motion.div
          className={`flex items-center justify-between p-4 rounded-xl mb-4 ${
            enabled ? "bg-accent-primary/20" : "bg-dark-tertiary"
          }`}
          onClick={() => onToggle(!enabled)}
        >
          <div className="flex items-center gap-3">
            {enabled ? (
              <Bell className="w-6 h-6 text-accent-primary" />
            ) : (
              <BellOff className="w-6 h-6 text-text-muted" />
            )}
            <div>
              <div className="font-medium text-text-primary">
                {enabled ? "Reminders Enabled" : "Reminders Disabled"}
              </div>
              <div className="text-sm text-text-muted">
                {enabled ? `Every ${intervalMinutes} minutes` : "Tap to enable"}
              </div>
            </div>
          </div>
          <motion.div
            className={`w-12 h-6 rounded-full transition-colors ${
              enabled ? "bg-accent-primary" : "bg-dark-secondary"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full m-0.5"
              animate={{ x: enabled ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.div>
        </motion.div>

        {/* Next Reminder */}
        {enabled && (
          <>
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-1">
                <Clock className="w-4 h-4" />
                Next reminder
              </div>
              <div className="text-xl font-bold text-text-primary">{getNextReminderText()}</div>
            </div>

            {/* Reminder Count */}
            <div className="text-center text-sm text-text-muted mb-4">
              {reminderCount} reminder{reminderCount !== 1 ? "s" : ""} sent so far
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onSnooze(15)} className="flex-1 text-sm">
                +15m
              </Button>
              <Button variant="secondary" onClick={() => onSnooze(30)} className="flex-1 text-sm">
                +30m
              </Button>
              <Button variant="secondary" onClick={() => onSnooze(60)} className="flex-1 text-sm">
                +1h
              </Button>
              <Button onClick={onDismiss} variant="danger" className="flex-1">
                Dismiss
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Reminder Settings">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Reminder Interval</label>
            <div className="grid grid-cols-2 gap-2">
              {intervalOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIntervalValue(option.value.toString())}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    intervalMinutes === option.value
                      ? "bg-accent-primary text-white"
                      : "bg-dark-tertiary text-text-primary hover:bg-dark-secondary"
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowSettings(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSettingsSubmit} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
