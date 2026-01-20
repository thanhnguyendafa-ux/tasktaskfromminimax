"use client";

import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLevel?: boolean;
  level?: number;
  frame?: string;
}

export function Avatar({ src, name, size = "md", showLevel = false, level = 1, frame }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl",
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="relative inline-flex">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white overflow-hidden border-2 ${frame || "border-accent-primary"}`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </motion.div>
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-accent-gold text-dark-primary text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-dark-primary">
          {level}
        </div>
      )}
    </div>
  );
}
