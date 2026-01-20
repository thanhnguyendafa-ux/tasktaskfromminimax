"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTimeProgressive } from "@/lib/formatDuration";
import { useUserStore } from "@/stores/useUserStore";

interface PomodoroTimerProps {
  taskId: string;
  taskTitle: string;
  onComplete: (xp: number, coins: number) => void;
  onClose: () => void;
}

export function PomodoroTimer({ taskId, taskTitle, onComplete, onClose }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const { addXp, addCoins } = useUserStore();

  const formatTime = formatTimeProgressive;

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        setSessions((prev) => prev + 1);
        addXp(5);
        addCoins(2);
        onComplete(5, 2);
        setIsBreak(true);
        setTimeLeft(5 * 60);
        setIsRunning(false);
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, addXp, addCoins, onComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  return (
    <Card className="text-center">
      <h3 className="text-lg font-medium text-text-primary mb-2">
        {isBreak ? "Break Time" : taskTitle}
      </h3>
      
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-dark-tertiary"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            className={isBreak ? "text-blue-500" : "text-accent-primary"}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-text-primary">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`p-4 rounded-full ${
            isRunning ? "bg-yellow-500/20 text-yellow-500" : "bg-accent-primary text-white"
          }`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="p-4 rounded-full bg-dark-tertiary text-text-secondary hover:text-text-primary"
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < sessions ? "bg-accent-primary" : "bg-dark-tertiary"
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-text-muted">
        {isBreak ? "Take a short break!" : `${sessions}/4 pomodoros completed`}
      </p>

      {isBreak && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setIsBreak(false);
            setTimeLeft(25 * 60);
            setIsRunning(false);
          }}
          className="mt-4 text-sm text-blue-500 hover:text-blue-400"
        >
          Skip break →
        </motion.button>
      )}
    </Card>
  );
}
