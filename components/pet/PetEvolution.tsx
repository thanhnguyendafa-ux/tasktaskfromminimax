"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

interface PetEvolutionProps {
  petName: string;
  petType: string;
  currentLevel: number;
  currentXP: number;
  evolutionStage: number;
  feedCount: number;
  playCount: number;
  onEvolve: () => void;
}

export function PetEvolution({
  petName,
  petType,
  currentLevel,
  currentXP,
  evolutionStage,
  feedCount,
  playCount,
  onEvolve,
}: PetEvolutionProps) {
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState(0);

  // Evolution stages
  const stages = [
    { stage: 1, name: "Baby", minLevel: 1, minXP: 0, minFeed: 0, minPlay: 0, emoji: "🐣" },
    { stage: 2, name: "Teen", minLevel: 6, minXP: 500, minFeed: 20, minPlay: 15, emoji: "🐥" },
    { stage: 3, name: "Adult", minLevel: 16, minXP: 2000, minFeed: 50, minPlay: 40, emoji: "🐓" },
    { stage: 4, name: "Elder", minLevel: 31, minXP: 5000, minFeed: 100, minPlay: 80, emoji: "🦅" },
  ];

  const currentStageInfo = stages[evolutionStage - 1];
  const nextStageInfo = stages[evolutionStage];

  // Calculate evolution progress
  useEffect(() => {
    if (!nextStageInfo) {
      setEvolutionProgress(100);
      return;
    }

    const levelProgress = Math.min(100, ((currentLevel - currentStageInfo.minLevel) / (nextStageInfo.minLevel - currentStageInfo.minLevel)) * 100);
    const xpProgress = Math.min(100, (currentXP / nextStageInfo.minXP) * 100);
    const feedProgress = Math.min(100, (feedCount / nextStageInfo.minFeed) * 100);
    const playProgress = Math.min(100, (playCount / nextStageInfo.minPlay) * 100);

    const totalProgress = (levelProgress + xpProgress + feedProgress + playProgress) / 4;
    setEvolutionProgress(totalProgress);
  }, [currentLevel, currentXP, feedCount, playCount, evolutionStage, currentStageInfo.minLevel, nextStageInfo]);

  const canEvolve = evolutionStage < 4 && evolutionProgress >= 100;

  const handleEvolve = () => {
    setShowEvolution(true);
    setEvolutionProgress(0);

    // Animation sequence
    setTimeout(() => {
      setEvolutionProgress(50);
    }, 500);

    setTimeout(() => {
      setEvolutionProgress(100);
    }, 1500);

    setTimeout(() => {
      onEvolve();
      setShowEvolution(false);
    }, 2500);
  };

  const getPetEmoji = (stage: number) => {
    const emojis = ["🐣", "🐥", "🐓", "🦅"];
    return emojis[Math.min(stage - 1, 3)];
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Pet Evolution</h3>
          <Badge variant={canEvolve ? "success" : "default"}>
            {currentStageInfo.name} Stage
          </Badge>
        </div>

        {/* Current Pet Display */}
        <div className="text-center mb-6">
          <motion.div
            animate={{
              y: [0, -10, 0],
              scale: canEvolve ? [1, 1.1, 1] : 1,
            }}
            transition={{ repeat: canEvolve ? Infinity : 0, duration: 2 }}
            className="text-8xl mx-auto mb-2"
          >
            {getPetEmoji(evolutionStage)}
          </motion.div>
          <p className="text-sm text-text-secondary">{petName}</p>
          <p className="text-xs text-text-muted">Level {currentLevel}</p>
        </div>

        {/* Evolution Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Evolution Progress</span>
            <span className="text-text-primary">{Math.round(evolutionProgress)}%</span>
          </div>
          <ProgressBar
            value={evolutionProgress}
            color={canEvolve ? "success" : "primary"}
            showLabel={false}
          />
        </div>

        {/* Requirements */}
        {!nextStageInfo ? (
          <div className="text-center p-4 bg-accent-gold/10 rounded-xl">
            <Trophy className="w-8 h-8 text-accent-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-accent-gold">Maximum Evolution Reached!</p>
            <p className="text-xs text-text-muted">Your pet is at its final form</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">Next: {nextStageInfo.name} {nextStageInfo.emoji}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded-lg ${currentLevel >= nextStageInfo.minLevel ? "bg-green-500/20 text-green-400" : "bg-dark-tertiary text-text-muted"}`}>
                Level {nextStageInfo.minLevel}+ {currentLevel >= nextStageInfo.minLevel ? "✓" : ""}
              </div>
              <div className={`p-2 rounded-lg ${currentXP >= nextStageInfo.minXP ? "bg-green-500/20 text-green-400" : "bg-dark-tertiary text-text-muted"}`}>
                {nextStageInfo.minXP} XP {currentXP >= nextStageInfo.minXP ? "✓" : ""}
              </div>
              <div className={`p-2 rounded-lg ${feedCount >= nextStageInfo.minFeed ? "bg-green-500/20 text-green-400" : "bg-dark-tertiary text-text-muted"}`}>
                {nextStageInfo.minFeed} feeds {feedCount >= nextStageInfo.minFeed ? "✓" : ""}
              </div>
              <div className={`p-2 rounded-lg ${playCount >= nextStageInfo.minPlay ? "bg-green-500/20 text-green-400" : "bg-dark-tertiary text-text-muted"}`}>
                {nextStageInfo.minPlay} plays {playCount >= nextStageInfo.minPlay ? "✓" : ""}
              </div>
            </div>
          </div>
        )}

        {/* Evolve Button */}
        {canEvolve && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleEvolve}
            className="w-full mt-4 py-3 bg-gradient-to-r from-accent-primary to-purple-500 rounded-xl text-white font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Evolve Now!
          </motion.button>
        )}
      </Card>

      {/* Evolution Animation Modal */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: 0 }}
                className="text-9xl mb-4"
              >
                {getPetEmoji(evolutionStage)}
              </motion.div>

              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-2xl font-bold text-accent-gold"
              >
                ✨ Evolving... ✨
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 bg-accent-primary rounded-full mx-auto mt-4"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-4"
              >
                <p className="text-xl font-bold text-text-primary">
                  {getPetEmoji(evolutionStage + 1)} {nextStageInfo?.name}!
                </p>
                <p className="text-sm text-text-muted mt-2">+50 XP Bonus!</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
