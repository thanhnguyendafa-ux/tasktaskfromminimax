"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Leaf, Palette } from "lucide-react";
import { useThemeStore } from "@/stores/useThemeStore";
import { ThemeType } from "@/types";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: ThemeType; icon: React.ReactNode; label: string; color: string }[] = [
    { id: "dark", icon: <Moon className="w-5 h-5" />, label: "Midnight", color: "#1a1a2e" },
    { id: "mint", icon: <Leaf className="w-5 h-5" />, label: "Fresh", color: "#10b981" },
    { id: "slate", icon: <Palette className="w-5 h-5" />, label: "Clean", color: "#6366f1" },
  ];

  const currentTheme = themes.find((t) => t.id === theme);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-dark-tertiary rounded-lg hover:bg-opacity-80 transition-all"
      >
        {currentTheme?.icon}
        <span className="text-sm text-text-secondary">{currentTheme?.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 bg-dark-secondary rounded-xl shadow-xl border border-dark-tertiary overflow-hidden z-50"
          >
            {themes.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setTheme(t.id as ThemeType);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-all ${
                  theme === t.id ? "bg-dark-tertiary" : "hover:bg-dark-tertiary/50"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                {t.icon}
                <span className="text-text-primary">{t.label}</span>
                {theme === t.id && (
                  <motion.div
                    layoutId="check"
                    className="ml-auto text-accent-primary"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
