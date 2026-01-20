"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  visible?: boolean;
}

export function FAB({ onClick, visible = true }: FABProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 right-4 z-40"
    >
      <motion.button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-accent-primary text-white shadow-lg shadow-accent-primary/30 flex items-center justify-center"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </motion.div>
  );
}
