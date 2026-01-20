"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Clock, CheckCircle, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Challenge } from "@/types";

interface DailyChallengesProps {
  challenges: Challenge[];
  onClaimReward: (challengeId: string) => void;
  onUpdateProgress: (challengeId: string, increment: number) => void;
}

export function DailyChallenges({ challenges, onClaimReward, onUpdateProgress }: DailyChallengesProps) {
  const [selectedTab, setSelectedTab] = useState<"daily" | "weekly">("daily");

  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getProgress = (challenge: Challenge) => {
    return Math.min(100, (challenge.current_progress / challenge.target) * 100);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-gold" />
          <h3 className="text-lg font-semibold text-text-primary">Challenges</h3>
        </div>
        <Badge variant="warning">
          {challenges.filter((c) => !c.is_completed && c.current_progress > 0).length} in progress
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedTab("daily")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            selectedTab === "daily"
              ? "bg-accent-primary text-white"
              : "bg-dark-tertiary text-text-secondary"
          }`}
        >
          Daily
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedTab("weekly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            selectedTab === "weekly"
              ? "bg-accent-primary text-white"
              : "bg-dark-tertiary text-text-secondary"
          }`}
        >
          Weekly
        </motion.button>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {(selectedTab === "daily" ? dailyChallenges : weeklyChallenges).map((challenge) => {
          const progress = getProgress(challenge);
          const canClaim = progress >= 100 && !challenge.is_completed;
          const isExpired = new Date(challenge.expires_at) < new Date();

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                challenge.is_completed
                  ? "bg-green-500/10 border-green-500/30"
                  : isExpired
                  ? "bg-gray-500/10 border-gray-500/30 opacity-60"
                  : "bg-dark-tertiary border-dark-tertiary"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${challenge.is_completed ? "bg-green-500/20" : "bg-accent-primary/20"}`}>
                  {challenge.is_completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Target className="w-5 h-5 text-accent-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-primary">{challenge.title}</h4>
                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <Badge variant="default">Expired</Badge>
                      ) : (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeRemaining(challenge.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{challenge.description}</p>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary">
                        {challenge.current_progress}/{challenge.target}
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      color={challenge.is_completed ? "success" : "primary"}
                      showLabel={false}
                    />
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-accent-gold">💰 {challenge.reward_coins}</span>
                      <span className="text-yellow-400">⭐ {challenge.reward_xp} XP</span>
                    </div>

                    {canClaim ? (
                      <Button size="sm" onClick={() => onClaimReward(challenge.id)}>
                        Claim!
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateProgress(challenge.id, 1)}
                        >
                          +1
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateProgress(challenge.id, 5)}
                        >
                          +5
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {(selectedTab === "daily" ? dailyChallenges : weeklyChallenges).length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted">No {selectedTab} challenges</p>
            <p className="text-text-muted text-xs">Check back later!</p>
          </div>
        )}
      </div>

      {/* Daily Bonus */}
      <div className="mt-4 pt-4 border-t border-dark-tertiary">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-2">Complete all {selectedTab} challenges for bonus!</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((day) => (
              <div
                key={day}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  day <= (selectedTab === "daily" ? 2 : 1)
                    ? "bg-accent-gold text-white"
                    : "bg-dark-tertiary text-text-muted"
                }`}
              >
                {day <= (selectedTab === "daily" ? 2 : 1) ? "✓" : day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
