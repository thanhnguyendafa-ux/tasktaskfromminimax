"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Forward, Settings, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface PomodoroTrackerProps {
  count: number;
  goal: number;
  duration: number; // in seconds
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onSetGoal: (goal: number) => void;
  onSetDuration: (duration: number) => void;
}

export function PomodoroTracker({
  count,
  goal,
  duration,
  onStart,
  onPause,
  onSkip,
  onComplete,
  onSetGoal,
  onSetDuration,
}: PomodoroTrackerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [goalValue, setGoalValue] = useState(goal.toString());
  const [durationValue, setDurationValue] = useState((duration / 60).toString());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      onComplete();
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / duration) * 100;
  const isCompleted = goal > 0 && count >= goal;

  const handleStart = () => {
    setIsRunning(true);
    onStart();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause();
  };

  const handleSkip = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    onSkip();
  };

  const handleSettingsSubmit = () => {
    const newGoal = parseInt(goalValue);
    const newDuration = parseInt(durationValue) * 60;
    if (newGoal > 0) onSetGoal(newGoal);
    if (newDuration > 0) onSetDuration(newDuration);
    setShowSettings(false);
  };

  // Generate pomodoro dots
  const dots = [];
  for (let i = 0; i < goal; i++) {
    dots.push(i < count ? "completed" : i === count ? "current" : "pending");
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Pomodoro Tracker</h3>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <motion.div
            className="relative inline-block"
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-dark-tertiary"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-accent-primary"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: `${(1 - progress / 100) * 2 * Math.PI * 56}` }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">{formatTime(timeLeft)}</span>
            </div>
          </motion.div>
        </div>

        {/* Pomodoro Dots */}
        <div className="flex justify-center gap-2 mb-4">
          {dots.map((status, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-4 h-4 rounded-full ${
                status === "completed"
                  ? "bg-accent-success"
                  : status === "current"
                  ? isRunning
                    ? "bg-accent-primary animate-pulse"
                    : "bg-accent-primary"
                  : "bg-dark-tertiary"
              }`}
            />
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center mb-4 text-sm text-text-muted">
          {count} / {goal} pomodoros completed
          {isCompleted && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent-success font-medium mt-1">
              🎉 All goals completed!
            </motion.div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-accent-primary rounded-xl text-white font-medium"
            >
              <Play className="w-5 h-5" />
              Start
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-accent-warning rounded-xl text-white font-medium"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-3 bg-dark-tertiary rounded-xl text-text-primary font-medium"
          >
            <Forward className="w-5 h-5" />
            Skip
          </motion.button>
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Pomodoro Settings">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Daily Goal (pomodoros)</label>
            <input
              type="number"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Duration (minutes)</label>
            <input
              type="number"
              value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
              className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
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
