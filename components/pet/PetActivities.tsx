"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Gamepad2, Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface PetActivitiesProps {
  petName: string;
  happiness: number;
  energy: number;
  onPlay: () => void;
  onSleep: () => void;
  onPet: () => void;
}

export function PetActivities({ petName, happiness, energy, onPlay, onSleep, onPet }: PetActivitiesProps) {
  const [activity, setActivity] = useState<"idle" | "playing" | "sleeping" | "being_pet">("idle");
  const [showEffect, setShowEffect] = useState(false);

  const handleActivity = (newActivity: typeof activity, action: () => void) => {
    if (energy < 20 && newActivity === "playing") {
      return; // Too tired to play
    }
    
    setActivity(newActivity);
    setShowEffect(true);
    action();
    
    setTimeout(() => {
      setActivity("idle");
      setShowEffect(false);
    }, 2000);
  };

  const getMood = () => {
    if (happiness >= 80) return { emoji: "😊", label: "Very Happy", color: "text-green-400" };
    if (happiness >= 60) return { emoji: "🙂", label: "Happy", color: "text-green-300" };
    if (happiness >= 40) return { emoji: "😐", label: "Neutral", color: "text-yellow-400" };
    if (happiness >= 20) return { emoji: "😢", label: "Sad", color: "text-orange-400" };
    return { emoji: "😭", label: "Very Sad", color: "text-red-400" };
  };

  const mood = getMood();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Activities</h3>
        <Badge variant={happiness >= 50 ? "success" : happiness >= 30 ? "warning" : "danger"}>
          {mood.emoji} {mood.label}
        </Badge>
      </div>

      {/* Pet display with activity */}
      <div className="relative flex justify-center py-6">
        <motion.div
          animate={
            activity === "playing"
              ? { y: [0, -20, 0], rotate: [0, 10, -10, 0] }
              : activity === "sleeping"
              ? { scale: [1, 0.95, 1] }
              : activity === "being_pet"
              ? { scale: [1, 1.1, 1] }
              : { y: [0, -5, 0] }
          }
          transition={{ repeat: Infinity, duration: activity === "idle" ? 2 : 0.5 }}
          className="text-8xl"
        >
          {activity === "playing" ? "🎉" : activity === "sleeping" ? "😴" : activity === "being_pet" ? "🥰" : "🐱"}
        </motion.div>

        {/* Activity effect */}
        <AnimatePresence>
          {showEffect && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-4xl">
                {activity === "playing" ? "⭐" : activity === "sleeping" ? "💤" : "❤️"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Activity buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleActivity("playing", onPlay)}
          disabled={energy < 20}
          className={`p-4 rounded-xl text-center transition-all ${
            energy >= 20
              ? "bg-purple-500/20 hover:bg-purple-500/30"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Gamepad2 className={`w-6 h-6 mx-auto mb-2 ${energy >= 20 ? "text-purple-400" : "text-text-muted"}`} />
          <span className="text-sm text-text-secondary">Play</span>
          <span className="text-xs text-text-muted block mt-1">-20 Energy</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleActivity("being_pet", onPet)}
          className="p-4 rounded-xl text-center bg-pink-500/20 hover:bg-pink-500/30 transition-all"
        >
          <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
          <span className="text-sm text-text-secondary">Pet</span>
          <span className="text-xs text-text-muted block mt-1">+5 Happiness</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleActivity("sleeping", onSleep)}
          className="p-4 rounded-xl text-center bg-blue-500/20 hover:bg-blue-500/30 transition-all"
        >
          {energy > 80 ? (
            <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          )}
          <span className="text-sm text-text-secondary">Sleep</span>
          <span className="text-xs text-text-muted block mt-1">+30 Energy</span>
        </motion.button>
      </div>

      {/* Energy bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Energy</span>
          <span className="text-text-primary">{energy}%</span>
        </div>
        <ProgressBar
          value={energy}
          color={energy >= 50 ? "success" : energy >= 30 ? "warning" : "danger"}
        />
      </div>
    </Card>
  );
}
