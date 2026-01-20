"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface TallyCounterProps {
  count: number;
  goal: number;
  onIncrement: (value: number) => void;
  onDecrement: (value: number) => void;
  onSetGoal: (goal: number) => void;
  onCustomIncrement: (value: number) => void;
}

export function TallyCounter({
  count,
  goal,
  onIncrement,
  onDecrement,
  onSetGoal,
  onCustomIncrement,
}: TallyCounterProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalValue, setGoalValue] = useState(goal.toString());

  const progress = goal > 0 ? Math.min((count / goal) * 100, 100) : 0;
  const isCompleted = goal > 0 && count >= goal;

  const handleCustomSubmit = () => {
    const value = parseInt(customValue);
    if (value > 0) {
      onCustomIncrement(value);
      setCustomValue("");
      setShowCustomModal(false);
    }
  };

  const handleGoalSubmit = () => {
    const value = parseInt(goalValue);
    if (value > 0) {
      onSetGoal(value);
      setShowGoalModal(false);
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Tally Counter</h3>
          <button
            onClick={() => setShowGoalModal(true)}
            className="p-2 rounded-lg bg-dark-tertiary hover:bg-dark-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary">
              {count} / {goal}
            </span>
          </div>
          <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isCompleted ? "bg-accent-success" : "bg-accent-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Counter Display */}
        <div className="text-center mb-4">
          <motion.div
            className="text-4xl font-bold text-text-primary"
            key={count}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {count}
          </motion.div>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-accent-success text-sm font-medium mt-1"
            >
              🎉 Goal reached!
            </motion.div>
          )}
        </div>

        {/* Quick Increment Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onDecrement(1)}
            className="flex flex-col items-center p-2 bg-dark-tertiary rounded-lg hover:bg-dark-secondary transition-colors"
            disabled={count <= 0}
          >
            <Minus className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted">-1</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onIncrement(1)}
            className="flex flex-col items-center p-2 bg-accent-primary/20 rounded-lg hover:bg-accent-primary/30 transition-colors"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span className="text-xs text-accent-primary">+1</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onIncrement(5)}
            className="flex flex-col items-center p-2 bg-accent-primary/20 rounded-lg hover:bg-accent-primary/30 transition-colors"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span className="text-xs text-accent-primary">+5</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onIncrement(10)}
            className="flex flex-col items-center p-2 bg-accent-primary/20 rounded-lg hover:bg-accent-primary/30 transition-colors"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span className="text-xs text-accent-primary">+10</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCustomModal(true)}
            className="flex flex-col items-center p-2 bg-dark-tertiary rounded-lg hover:bg-dark-secondary transition-colors"
          >
            <span className="text-lg font-bold text-text-muted">?</span>
            <span className="text-xs text-text-muted">Custom</span>
          </motion.button>
        </div>

        {/* Goal Info */}
        <div className="text-center text-sm text-text-muted">
          {goal > 0 ? (
            <span>
              {count < goal
                ? `${goal - count} more to reach goal`
                : `${count - goal} over goal`}
            </span>
          ) : (
            <span>Set a goal to track progress</span>
          )}
        </div>
      </Card>

      {/* Custom Increment Modal */}
      <Modal isOpen={showCustomModal} onClose={() => setShowCustomModal(false)} title="Custom Increment">
        <div className="space-y-4">
              <input
                type="number"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowCustomModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCustomSubmit} className="flex-1">
                  Add
                </Button>
              </div>
            </div>
      </Modal>

      {/* Set Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Set Tally Goal">
        <div className="space-y-4">
              <p className="text-sm text-text-muted">Set a target for your tally counter</p>
              <input
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                placeholder="Enter goal"
                className="w-full px-4 py-2 bg-dark-tertiary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowGoalModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleGoalSubmit} className="flex-1">
                  Set Goal
                </Button>
              </div>
            </div>
      </Modal>
    </>
  );
}
