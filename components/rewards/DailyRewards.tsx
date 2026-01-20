"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, Coins, Sparkles, Lock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DailyReward } from "@/types";

interface DailyRewardsProps {
  rewards: DailyReward[];
  currentStreak: number;
  onClaim: (day: number) => void;
}

export function DailyRewards({ rewards, currentStreak, onClaim }: DailyRewardsProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getRewardForDay = (day: number) => {
    const rewardsMap: Record<number, { coins: number; rarity: string | null }> = {
      1: { coins: 10, rarity: "common" },
      2: { coins: 15, rarity: "common" },
      3: { coins: 20, rarity: "uncommon" },
      4: { coins: 25, rarity: "uncommon" },
      5: { coins: 30, rarity: "rare" },
      6: { coins: 35, rarity: "rare" },
      7: { coins: 50, rarity: "epic" },
    };
    return rewardsMap[day] || { coins: 10, rarity: "common" };
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "from-gray-500 to-gray-600";
      case "uncommon": return "from-green-500 to-green-600";
      case "rare": return "from-blue-500 to-blue-600";
      case "epic": return "from-purple-500 to-purple-600";
      case "legendary": return "from-orange-500 to-orange-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500/20 border-gray-500";
      case "uncommon": return "bg-green-500/20 border-green-500";
      case "rare": return "bg-blue-500/20 border-blue-500";
      case "epic": return "bg-purple-500/20 border-purple-500";
      case "legendary": return "bg-orange-500/20 border-orange-500";
      default: return "bg-gray-500/20 border-gray-500";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent-gold" />
          <h3 className="text-lg font-semibold text-text-primary">Daily Rewards</h3>
        </div>
        <Badge variant="warning">🔥 {currentStreak} day streak</Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Weekly Progress</span>
          <span className="text-text-primary">{currentStreak}/7 days</span>
        </div>
        <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStreak / 7) * 100}%` }}
            className="h-full bg-accent-gold rounded-full"
          />
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const reward = getRewardForDay(day);
          const isClaimed = rewards.find((r) => r.day === day)?.is_claimed;
          const canClaim = currentStreak >= day && !isClaimed;
          const isLocked = currentStreak < day;

          return (
            <motion.button
              key={day}
              whileHover={{ scale: isLocked ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isLocked && setSelectedDay(day)}
              disabled={isLocked}
              className={`relative p-3 rounded-xl border-2 transition-all ${
                isLocked
                  ? "bg-dark-tertiary/50 border-dark-tertiary opacity-50"
                  : isClaimed
                  ? "bg-green-500/20 border-green-500"
                  : canClaim
                  ? `bg-gradient-to-br ${reward.rarity ? getRarityColor(reward.rarity) : "from-accent-primary to-purple-500"} border-transparent`
                  : "bg-dark-tertiary border-dark-tertiary"
              }`}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-text-muted mx-auto" />
              ) : isClaimed ? (
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
              ) : (
                <>
                  <span className="block text-xs text-text-muted mb-1">Day {day}</span>
                  <span className="block text-lg">{reward.rarity === "epic" ? "🎁" : reward.rarity === "rare" ? "📦" : "💰"}</span>
                  <span className="block text-xs text-accent-gold">{reward.coins}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Claim Button */}
      {(() => {
        const nextUnclaimed = rewards.find((r) => r.day <= currentStreak && !r.is_claimed);
        return nextUnclaimed ? (
          <Button
            className="w-full"
            onClick={() => onClaim(nextUnclaimed.day)}
          >
            <Gift className="w-4 h-4 mr-2" />
            Claim Today&apos;s Reward
          </Button>
        ) : null;
      })()}

      {/* Info */}
      <div className="mt-4 p-3 bg-dark-tertiary rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="text-sm font-medium text-text-primary">Bonus on Day 7!</span>
        </div>
        <p className="text-xs text-text-muted">
          Complete 7 days in a row to unlock the epic reward chest!
        </p>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-dark-secondary p-6 rounded-2xl max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🎁
              </motion.div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Day {selectedDay} Reward</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-accent-gold" />
                <span className="text-2xl font-bold text-accent-gold">
                  {getRewardForDay(selectedDay).coins}
                </span>
              </div>
              <Badge variant={getRewardForDay(selectedDay).rarity === "epic" ? "medium" : "default"}>
                {getRewardForDay(selectedDay).rarity} Box
              </Badge>
              <Button className="w-full mt-4" onClick={() => { onClaim(selectedDay); setSelectedDay(null); }}>
                Open Reward
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
