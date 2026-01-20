"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, CheckSquare, Timer, Heart, ShoppingBag, User } from "lucide-react";

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  navItems?: NavItem[];
}

export function BottomNav({
  currentPage,
  onNavigate,
  navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", badge: 5 },
    { id: "timer", icon: Timer, label: "Timer" },
    { id: "pet", icon: Heart, label: "Pet" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "profile", icon: User, label: "Profile" },
  ],
}: BottomNavProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 bg-dark-secondary/95 backdrop-blur-sm border-t border-dark-tertiary px-2 py-2 pb-safe z-40"
    >
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center px-3 py-2 rounded-xl transition-all
                ${isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-secondary"
                }
              `}
            >
              {/* Icon */}
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${isActive ? "fill-current" : ""}`}
                />
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold
                      flex items-center justify-center
                      ${isActive
                        ? "bg-white text-accent-primary"
                        : "bg-accent-primary text-white"
                      }
                    `}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </motion.span>
                )}
              </div>

              {/* Label */}
              <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
