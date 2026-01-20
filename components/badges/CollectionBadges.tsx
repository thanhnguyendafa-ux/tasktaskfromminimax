"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Star, Sparkles, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CollectionBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  xpReward: number;
  isUnlocked: boolean;
}

interface CollectionBadgesProps {
  badges: CollectionBadge[];
  onClaim: (badgeId: string) => void;
}

export function CollectionBadges({ badges, onClaim }: CollectionBadgesProps) {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;

  const categories = [
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "streaks", label: "Streaks", icon: "🔥" },
    { id: "collection", label: "Collection", icon: "🏆" },
    { id: "special", label: "Special", icon: "⭐" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBadges = selectedCategory === "all"
    ? badges
    : badges.filter((b) => b.requirement.toLowerCase().includes(selectedCategory));

  const getRarityColor = (badge: CollectionBadge) => {
    if (badge.xpReward >= 500) return "from-orange-500 to-red-500";
    if (badge.xpReward >= 300) return "from-purple-500 to-pink-500";
    if (badge.xpReward >= 150) return "from-blue-500 to-cyan-500";
    return "from-gray-500 to-slate-500";
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-gold" />
          <h3 className="text-lg font-semibold text-text-primary">Collection Badges</h3>
        </div>
        <Badge variant="warning">
          {unlockedCount}/{totalCount}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Collection Progress</span>
          <span className="text-text-primary">{Math.round((unlockedCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-3 bg-dark-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-accent-primary text-white"
              : "bg-dark-tertiary text-text-secondary"
          }`}
        >
          All
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-accent-primary text-white"
                : "bg-dark-tertiary text-text-secondary"
            }`}
          >
            {cat.icon} {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 rounded-xl border-2 ${
              badge.isUnlocked
                ? `bg-gradient-to-br ${getRarityColor(badge)} border-transparent`
                : "bg-dark-tertiary border-dark-tertiary"
            }`}
          >
            {badge.isUnlocked ? (
              <>
                <span className="text-4xl block mb-2">{badge.icon}</span>
                <h4 className="font-medium text-white">{badge.name}</h4>
                <p className="text-xs text-white/80 mt-1">{badge.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-300" />
                  <span className="text-xs text-yellow-300">+{badge.xpReward} XP</span>
                </div>
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="opacity-30">
                  <span className="text-4xl block mb-2 grayscale">{badge.icon}</span>
                  <h4 className="font-medium text-text-muted">{badge.name}</h4>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-2">
                    <Lock className="w-5 h-5 text-text-muted" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">{badge.requirement}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-dark-tertiary grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xl font-bold text-accent-gold">
            {badges.filter((b) => b.isUnlocked).reduce((acc, b) => acc + b.xpReward, 0)}
          </p>
          <p className="text-xs text-text-muted">XP Earned</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-400">{unlockedCount}</p>
          <p className="text-xs text-text-muted">Badges</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-accent-primary">
            {totalCount - unlockedCount}
          </p>
          <p className="text-xs text-text-muted">Remaining</p>
        </div>
      </div>
    </Card>
  );
}
