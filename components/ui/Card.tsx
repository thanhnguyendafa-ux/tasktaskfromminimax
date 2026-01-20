"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = "", onClick, hover = false }: CardProps) {
  const Component = onClick ? motion.div : "div";
  const motionProps = hover ? {
    whileHover: { y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" },
    whileTap: { scale: 0.98 },
  } : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`bg-dark-secondary rounded-2xl p-4 shadow-lg ${className}`}
    >
      {children}
    </Component>
  );
}
