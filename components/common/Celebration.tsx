"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Trophy, Coins, Heart } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  type: "task_complete" | "level_up" | "streak" | "purchase" | "pet";
  message?: string;
  onComplete?: () => void;
}

export function Celebration({ show, type, message, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  const getEmojis = (t: string) => {
    switch (t) {
      case "task_complete": return ["✅", "🎉", "⭐", "✨"];
      case "level_up": return ["🆙", "⭐", "🏆", "👑"];
      case "streak": return ["🔥", "💪", "⚡", "🎯"];
      case "purchase": return ["🛒", "🎁", "💎", "✨"];
      case "pet": return ["🐱", "❤️", "🥰", "💕"];
      default: return ["✨", "⭐", "🎉"];
    }
  };

  const getRandomEmoji = (t: string) => {
    const emojis = getEmojis(t);
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  React.useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        emoji: getRandomEmoji(type),
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  const getTitle = () => {
    switch (type) {
      case "task_complete": return "Task Completed!";
      case "level_up": return "Level Up!";
      case "streak": return "Streak Bonus!";
      case "purchase": return "Purchase Complete!";
      case "pet": return "Pet Happy!";
      default: return "Congratulations!";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onComplete}
          >
            {/* Main celebration card */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative bg-dark-secondary rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Particle effects */}
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ opacity: 1, x: particle.x, y: particle.y }}
                  animate={{
                    opacity: 0,
                    y: particle.y - 200,
                    x: particle.x + (Math.random() - 0.5) * 100,
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute text-2xl pointer-events-none"
                >
                  {particle.emoji}
                </motion.div>
              ))}

              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl mb-4"
              >
                {type === "task_complete" && "🎉"}
                {type === "level_up" && "🆙"}
                {type === "streak" && "🔥"}
                {type === "purchase" && "🛍️"}
                {type === "pet" && "🐱"}
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {getTitle()}
              </h2>

              {/* Message */}
              {message && (
                <p className="text-text-secondary mb-4">{message}</p>
              )}

              {/* Rewards display */}
              <div className="flex justify-center gap-4 mb-4">
                {type === "task_complete" && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-xl">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">+10 XP</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent-gold/20 rounded-xl">
                      <Coins className="w-5 h-5 text-accent-gold" />
                      <span className="text-accent-gold font-bold">+5 Coins</span>
                    </div>
                  </>
                )}
                {type === "level_up" && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">Level Up!</span>
                  </div>
                )}
              </div>

              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-6 py-2 bg-accent-primary rounded-xl text-white font-medium"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating particles component for background effects
export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; emoji: string }>>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        // Remove old particles
        const filtered = prev.filter((p) => p.y < window.innerHeight + 50);
        // Add new particles
        if (filtered.length < 15 && Math.random() > 0.7) {
          return [
            ...filtered,
            {
              id: Date.now(),
              x: Math.random() * window.innerWidth,
              y: -50,
              size: Math.random() * 20 + 10,
              speed: Math.random() * 2 + 1,
              emoji: ["✨", "⭐", "💫", "🌟", "✨"][Math.floor(Math.random() * 5)],
            },
          ];
        }
        return filtered;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: [0, 1, 0], y: window.innerHeight + 50 }}
          transition={{ duration: 10 / particle.speed, repeat: Infinity }}
          className="absolute text-xl"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size,
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}
