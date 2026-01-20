"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface InputProps extends Omit<HTMLMotionProps<"input">, "children"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-4 py-3 bg-dark-tertiary border border-dark-tertiary rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all duration-200 ${icon ? "pl-10" : ""} ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
