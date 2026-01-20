"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, Plus, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatTimerDisplay } from "@/lib/formatDuration";

interface TimerTrackerProps {
  totalSeconds: number;
  estimatedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onAddManualTime: (minutes: number) => void;
}

export function TimerTracker({
  totalSeconds,
  estimatedSeconds,
  onStart,
  onPause,
  onStop,
  onAddManualTime,
}: TimerTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const progress = estimatedSeconds > 0 ? Math.min((totalSeconds / estimatedSeconds) * 100, 100) : 0;

  const formatTime = formatTimerDisplay;

  const handleStart = () => {
    setIsRunning(true);
    onStart();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause();
  };

  const handleStop = () => {
    setIsRunning(false);
    setSessionSeconds(0);
    onStop();
  };

  const handleAddSubmit = () => {
    const minutes = parseInt(manualMinutes);
    if (minutes > 0) {
      onAddManualTime(minutes);
      setManualMinutes("");
      setShowAddModal(false);
    }
  };

  const handleReset = () => {
    setSessionSeconds(0);
  };

  return (
    <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Timer Tracker</h3>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className="text-sm text-text-muted mb-1">Session Time</div>
          <motion.div
            className="text-3xl font-bold text-text-primary"
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {formatTime(sessionSeconds)}
          </motion.div>
        </div>

        {/* Total Time */}
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <div className="text-xs text-text-muted">Total</div>
            <div className="text-xl font-semibold text-text-primary">{formatTime(totalSeconds)}</div>
          </div>
          {estimatedSeconds > 0 && (
            <div className="text-center">
              <div className="text-xs text-text-muted">Estimated</div>
              <div className="text-xl font-semibold text-text-primary">{formatTime(estimatedSeconds)}</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {estimatedSeconds > 0 && (
          <div className="mb-4">
            <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  progress >= 100 ? "bg-accent-warning" : "bg-accent-primary"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-center text-xs text-text-muted mt-1">
              {Math.round(progress)}% of estimated time
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 mb-4">
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
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-3 bg-dark-tertiary rounded-xl text-text-primary font-medium"
          >
            <Square className="w-5 h-5" />
            Stop
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 bg-dark-tertiary rounded-xl text-text-primary font-medium"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Add Manual Time Button */}
        <div className="text-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="text-sm text-accent-primary hover:underline"
          >
            + Add Manual Time
          </motion.button>
        </div>
      </Card>

      {/* Add Manual Time Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Manual Time">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Add time spent working on this task</p>
          <input
            type="number"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="Enter minutes"
            className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
