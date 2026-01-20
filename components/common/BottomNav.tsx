"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, CheckSquare, Timer, Heart, ShoppingBag, User } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "timer", icon: Timer, label: "Timer" },
    { id: "pet", icon: Heart, label: "Pet" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-dark-secondary border-t border-dark-tertiary px-4 py-2 pb-safe"
    >
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                isActive ? "text-accent-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
