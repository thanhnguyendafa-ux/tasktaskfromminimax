"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Utensils, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PetFood } from "@/types";

interface PetFeedingProps {
  petName: string;
  currentHunger: number;
  userCoins: number;
  onFeed: (food: PetFood) => void;
}

export function PetFeeding({ petName, currentHunger, userCoins, onFeed }: PetFeedingProps) {
  const [showFoodModal, setShowFoodModal] = useState(false);

  // Sample pet foods
  const petFoods: PetFood[] = [
    { id: "1", name: "Kibble", icon: "🍖", price_coins: 10, hunger_restore: 20, happiness_bonus: 5, xp_bonus: 5 },
    { id: "2", name: "Fish", icon: "🐟", price_coins: 25, hunger_restore: 40, happiness_bonus: 10, xp_bonus: 10 },
    { id: "3", name: "Treat", icon: "🍪", price_coins: 15, hunger_restore: 15, happiness_bonus: 15, xp_bonus: 8 },
    { id: "4", name: "Premium Meal", icon: "🍲", price_coins: 50, hunger_restore: 60, happiness_bonus: 20, xp_bonus: 20 },
    { id: "5", name: "Golden Bone", icon: "🦴", price_coins: 100, hunger_restore: 80, happiness_bonus: 30, xp_bonus: 50 },
    { id: "6", name: "Magic Fish", icon: "✨", price_coins: 200, hunger_restore: 100, happiness_bonus: 50, xp_bonus: 100 },
  ];

  const getHungerStatus = () => {
    if (currentHunger >= 80) return { label: "Full", variant: "success" as const };
    if (currentHunger >= 50) return { label: "Good", variant: "warning" as const };
    if (currentHunger >= 30) return { label: "Hungry", variant: "medium" as const };
    return { label: "Very Hungry!", variant: "danger" as const };
  };

  const status = getHungerStatus();

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Feed {petName}</h3>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Hunger bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Hunger</span>
            <span className="text-text-primary">{currentHunger}%</span>
          </div>
          <div className="h-3 bg-dark-tertiary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentHunger}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                currentHunger >= 80
                  ? "bg-green-500"
                  : currentHunger >= 50
                  ? "bg-yellow-500"
                  : currentHunger >= 30
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Quick feed buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {petFoods.slice(0, 3).map((food) => (
            <motion.button
              key={food.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFeed(food)}
              disabled={userCoins < food.price_coins}
              className={`p-3 rounded-xl text-center transition-all ${
                userCoins >= food.price_coins
                  ? "bg-dark-tertiary hover:bg-opacity-80"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <span className="text-2xl block mb-1">{food.icon}</span>
              <span className="text-xs text-text-secondary">{food.name}</span>
              <span className="text-xs text-accent-gold block mt-1">{food.price_coins} coins</span>
            </motion.button>
          ))}
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setShowFoodModal(true)}
        >
          <Utensils className="w-4 h-4 mr-2" />
          View All Foods
        </Button>
      </Card>

      <Modal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        title="Pet Foods"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-3">
          {petFoods.map((food) => (
            <motion.div
              key={food.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                userCoins >= food.price_coins
                  ? "bg-dark-tertiary border-dark-tertiary"
                  : "bg-dark-tertiary/50 border-dark-tertiary/50 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{food.icon}</span>
                <div>
                  <h4 className="font-medium text-text-primary">{food.name}</h4>
                  <p className="text-xs text-text-muted">{food.hunger_restore} hunger</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-accent-gold">{food.price_coins} coins</span>
                <Button
                  size="sm"
                  disabled={userCoins < food.price_coins}
                  onClick={() => {
                    onFeed(food);
                    setShowFoodModal(false);
                  }}
                >
                  Feed
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Modal>
    </>
  );
}
