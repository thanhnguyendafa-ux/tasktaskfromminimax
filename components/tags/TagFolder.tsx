"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, Plus, ChevronRight, ChevronDown, Tag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag as TagType } from "@/types";

interface TagFolderProps {
  tags: TagType[];
  onTagClick: (tag: TagType) => void;
  onAddTag: (parentId: string | null) => void;
  onEditTag: (tag: TagType) => void;
  onDeleteTag: (tagId: string) => void;
}

export function TagFolder({ tags, onTagClick, onAddTag, onEditTag, onDeleteTag }: TagFolderProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const toggleFolder = (tagId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTag = (tag: TagType, depth: number = 0) => {
    const isExpanded = expandedFolders.has(tag.id);
    const hasChildren = tag.children && tag.children.length > 0;
    const isFolder = tag.is_folder || hasChildren;

    return (
      <div key={tag.id} className="select-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-dark-tertiary/50 transition-colors group`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => isFolder ? toggleFolder(tag.id) : onTagClick(tag)}
          onMouseEnter={() => setHoveredTag(tag.id)}
          onMouseLeave={() => setHoveredTag(null)}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(tag.id);
              }}
              className="p-0.5 rounded hover:bg-dark-tertiary"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </motion.button>
          )}

          {/* Folder/Tag icon */}
          <span
            className="text-lg"
            style={{ color: tag.color }}
          >
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5" />
              ) : (
                <Folder className="w-5 h-5" />
              )
            ) : (
              <Tag className="w-4 h-4" />
            )}
          </span>

          {/* Tag name */}
          <span className="flex-1 text-sm text-text-primary truncate">
            {tag.name}
          </span>

          {/* Actions on hover */}
          <AnimatePresence>
            {hoveredTag === tag.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAddTag(tag.id)}
                  className="p-1.5 rounded hover:bg-dark-tertiary text-text-muted hover:text-text-primary"
                  title="Add sub-tag"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEditTag(tag)}
                  className="p-1.5 rounded hover:bg-dark-tertiary text-text-muted hover:text-text-primary"
                  title="Edit tag"
                >
                  ✏️
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteTag(tag.id)}
                  className="p-1.5 rounded hover:bg-dark-tertiary text-text-muted hover:text-red-400"
                  title="Delete tag"
                >
                  🗑️
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Child count */}
          {hasChildren && (
            <span className="text-xs text-text-muted">
              ({tag.children?.length})
            </span>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {tag.children?.map((child) => renderTag(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Tags & Folders</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddTag(null)}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent-primary rounded-lg text-white text-sm"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </motion.button>
      </div>

      <div className="space-y-1">
        {tags.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No tags yet</p>
            <p className="text-text-muted text-xs mt-1">Create a tag to organize your tasks</p>
          </div>
        ) : (
          tags.map((tag) => renderTag(tag))
        )}
      </div>
    </Card>
  );
}
