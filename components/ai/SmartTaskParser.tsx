"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Target, Lightbulb, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface SmartTaskParserProps {
  onParse: (data: {
    title: string;
    date?: string;
    time?: string;
    duration?: string;
    priority: "low" | "medium" | "high";
    tags: string[];
  }) => void;
}

export function SmartTaskParser({ onParse }: SmartTaskParserProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<{
    title: string;
    date?: string;
    time?: string;
    duration?: string;
    priority: "low" | "medium" | "high";
    tags: string[];
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseTask = () => {
    if (!input.trim()) return;

    // Simple AI parser simulation
    const text = input.toLowerCase();
    const result = {
      title: input,
      date: undefined as string | undefined,
      time: undefined as string | undefined,
      duration: undefined as string | undefined,
      priority: "medium" as "low" | "medium" | "high",
      tags: [] as string[],
    };

    // Extract date patterns
    if (text.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      result.date = tomorrow.toISOString().split("T")[0];
    } else if (text.includes("today")) {
      result.date = new Date().toISOString().split("T")[0];
    } else if (text.includes("monday")) {
      result.date = "2025-01-20"; // Next Monday
    } else if (text.includes("next week")) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      result.date = nextWeek.toISOString().split("T")[0];
    }

    // Extract time patterns
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] || "00";
      const period = timeMatch[3];

      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;

      result.time = `${hour.toString().padStart(2, "0")}:${minute}`;
    }

    // Extract duration
    if (text.includes("1 hour") || text.includes("1h")) {
      result.duration = "60";
    } else if (text.includes("30 min") || text.includes("30m")) {
      result.duration = "30";
    } else if (text.includes("2 hour") || text.includes("2h")) {
      result.duration = "120";
    }

    // Extract priority
    if (text.includes("urgent") || text.includes("asap") || text.includes("important")) {
      result.priority = "high";
    } else if (text.includes("low priority") || text.includes("not important")) {
      result.priority = "low";
    }

    // Extract tags
    const tagPatterns = ["meeting", "work", "personal", "health", "learning", "coding", "email", "call"];
    tagPatterns.forEach((tag) => {
      if (text.includes(tag)) {
        result.tags.push(tag.charAt(0).toUpperCase() + tag.slice(1));
      }
    });

    setParsed(result);
    setShowPreview(true);
  };

  const handleApply = () => {
    if (parsed) {
      onParse(parsed);
      setInput("");
      setParsed(null);
      setShowPreview(false);
    }
  };

  const examples = [
    "Meeting with John tomorrow at 2pm for 1 hour",
    "Submit report by Friday urgent",
    "Call mom next week",
    "Gym workout at 6am for 45 min",
  ];

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">AI Task Parser</h3>
          </div>
          <Badge variant="default">
            <Sparkles className="w-3 h-3 mr-1" />
            Smart
          </Badge>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: Meeting with John tomorrow at 2pm"
            onKeyDown={(e) => e.key === "Enter" && parseTask()}
            className="pr-12"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={parseTask}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-primary rounded-lg text-white disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2">Try these examples:</p>
          <div className="space-y-1">
            {examples.map((ex, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInput(ex)}
                className="w-full text-left px-3 py-2 bg-dark-tertiary rounded-lg text-xs text-text-secondary hover:bg-opacity-80"
              >
                {ex}
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {input.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-accent-primary/10 border border-accent-primary/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-text-primary">AI Suggestions</span>
            </div>
            <div className="text-xs text-text-muted space-y-1">
              <p>• &quot;You usually complete this in 2 hours&quot;</p>
              <p>• &quot;Best focus time: 9-11 AM&quot;</p>
              <p>• &quot;Suggest break after 2 pomodoros&quot;</p>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Task Preview">
        {parsed && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-tertiary rounded-xl">
              <h4 className="font-medium text-text-primary mb-3">📝 {parsed.title}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {parsed.date && (
                  <div>
                    <p className="text-text-muted">Date</p>
                    <p className="text-text-primary">{parsed.date}</p>
                  </div>
                )}
                {parsed.time && (
                  <div>
                    <p className="text-text-muted">Time</p>
                    <p className="text-text-primary">{parsed.time}</p>
                  </div>
                )}
                {parsed.duration && (
                  <div>
                    <p className="text-text-muted">Duration</p>
                    <p className="text-text-primary">{parsed.duration} min</p>
                  </div>
                )}
                <div>
                  <p className="text-text-muted">Priority</p>
                  <Badge variant={parsed.priority === "high" ? "danger" : parsed.priority === "medium" ? "warning" : "default"}>
                    {parsed.priority}
                  </Badge>
                </div>
              </div>
              {parsed.tags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-secondary">
                  <p className="text-text-muted text-sm mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {parsed.tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowPreview(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleApply} className="flex-1">
                <Target className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
