"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Task, Tag } from "@/types";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  tags: Tag[];
}

export function TaskForm({ isOpen, onClose, onSubmit, tags }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
      status: "pending",
      tags: selectedTags as unknown as import("@/types").Tag[],
    });
    onClose();
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setSelectedTags([]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Description (optional)
          </label>
          <textarea
            className="w-full px-4 py-3 bg-dark-tertiary border border-dark-tertiary rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all duration-200 resize-none"
            rows={3}
            placeholder="Add details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                  priority === p
                    ? p === "low"
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : p === "medium"
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                      : "border-red-500 bg-red-500/20 text-red-400"
                    : "border-dark-tertiary text-text-muted hover:border-text-muted"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <Input
          label="Due Date (optional)"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <motion.button
                  key={tag.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag.id)
                      ? "ring-2 ring-accent-primary"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: `${tag.color}30`,
                    color: tag.color,
                    borderColor: selectedTags.includes(tag.id) ? tag.color : "transparent",
                  }}
                >
                  {tag.icon} {tag.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
