"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Tag } from "lucide-react";

interface SearchSuggestion {
  id: string;
  type: "task" | "tag" | "recent";
  title: string;
  subtitle?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search tasks...",
  suggestions = [],
  recentSearches = [],
  onClearRecent,
  className = "",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (suggestions.length > 0) {
      setLocalSuggestions(suggestions);
    }
  }, [suggestions]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit?.(value);
      setIsFocused(false);
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.title);
    onSubmit?.(suggestion.title);
    setIsFocused(false);
  };

  const handleRecentClick = (search: string) => {
    onChange(search);
    onSubmit?.(search);
    setIsFocused(false);
  };

  const showResults = isFocused && (value.length > 0 || localSuggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search input */}
      <motion.div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          bg-dark-tertiary border transition-all duration-200
          ${isFocused ? "border-accent-primary ring-2 ring-accent-primary/20" : "border-dark-tertiary"}
        `}
      >
        <Search className={`w-5 h-5 ${isFocused ? "text-accent-primary" : "text-text-muted"}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-base"
        />

        {value.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="p-1 rounded-lg hover:bg-dark-secondary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Search results dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-dark-secondary border border-dark-tertiary rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && value.length === 0 && (
              <div className="p-3 border-b border-dark-tertiary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Recent Searches
                  </span>
                  {onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      className="text-xs text-accent-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRecentClick(search)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-tertiary text-sm text-text-secondary hover:bg-dark-primary transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {localSuggestions.length > 0 && (
              <div className="p-2 max-h-64 overflow-y-auto">
                {localSuggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-tertiary transition-colors text-left"
                  >
                    {suggestion.type === "tag" ? (
                      <Tag className="w-4 h-4 text-accent-primary" />
                    ) : (
                      <Search className="w-4 h-4 text-text-muted" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{suggestion.title}</p>
                      {suggestion.subtitle && (
                        <p className="text-xs text-text-muted">{suggestion.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-tertiary text-text-muted">
                      {suggestion.type}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* No results */}
            {value.length > 0 && localSuggestions.length === 0 && recentSearches.length === 0 && (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No tasks found for "{value}"</p>
                <p className="text-xs text-text-muted mt-1">Try a different search term</p>
              </div>
            )}

            {/* Search hint */}
            <div className="p-2 border-t border-dark-tertiary bg-dark-primary/50">
              <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-dark-tertiary">Enter</kbd>
                  to search
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-dark-tertiary">Esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close search when clicking outside */}
      {isFocused && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFocused(false)}
        />
      )}
    </div>
  );
}
