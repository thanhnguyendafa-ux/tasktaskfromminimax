"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Utensils, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UserPet } from "@/types";

interface PetStatsProps {
  pet: UserPet;
}

export function PetStats({ pet }: PetStatsProps) {
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy": return "😊";
      case "excited": return "🤩";
      case "neutral": return "😐";
      case "sad": return "😢";
      case "tired": return "😴";
      default: return "😊";
    }
  };

  const getMoodText = (mood: string) => {
    switch (mood) {
      case "happy": return "Happy";
      case "excited": return "Excited";
      case "neutral": return "Neutral";
      case "sad": return "Sad";
      case "tired": return "Tired";
      default: return "Happy";
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-text-primary">Pet Stats</h3>
        <span className="text-4xl">{getMoodEmoji(pet.mood)}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-red-400" />
              <span className="text-sm text-text-secondary">Hunger</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{pet.hunger}%</span>
          </div>
          <ProgressBar
            value={pet.hunger}
            color={pet.hunger < 30 ? "danger" : pet.hunger < 60 ? "warning" : "success"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-text-secondary">Happiness</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{pet.happiness}%</span>
          </div>
          <ProgressBar
            value={pet.happiness}
            color={pet.happiness < 30 ? "danger" : pet.happiness < 60 ? "warning" : "success"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-text-secondary">Energy</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{pet.energy}%</span>
          </div>
          <ProgressBar
            value={pet.energy}
            color={pet.energy < 30 ? "danger" : pet.energy < 60 ? "warning" : "success"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-text-secondary">Health</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{pet.health}%</span>
          </div>
          <ProgressBar
            value={pet.health}
            color={pet.health < 50 ? "danger" : pet.health < 80 ? "warning" : "success"}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dark-tertiary">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Mood:</span>
          <span className="text-text-primary">{getMoodText(pet.mood)}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-text-muted">Level:</span>
          <span className="text-accent-gold font-medium">{pet.level}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-text-muted">XP:</span>
          <span className="text-text-primary">{pet.experience} / {pet.level * 100}</span>
        </div>
      </div>
    </Card>
  );
}
