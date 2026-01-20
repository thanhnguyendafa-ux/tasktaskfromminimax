"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Star, Crown, Award, Gem } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InventoryItem } from "@/types";

interface InventoryGridProps {
  items: InventoryItem[];
  onEquip: (itemId: string) => void;
  onUnequip: (itemId: string) => void;
}

export function InventoryGrid({ items, onEquip, onUnequip }: InventoryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", icon: Package },
    { id: "frame", label: "Frames", icon: Star },
    { id: "badge", label: "Badges", icon: Award },
    { id: "title", label: "Titles", icon: Crown },
    { id: "pet", label: "Pets", icon: Gem },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-400 border-gray-400";
      case "uncommon": return "text-green-400 border-green-400";
      case "rare": return "text-blue-400 border-blue-400";
      case "epic": return "text-purple-400 border-purple-400";
      case "legendary": return "text-orange-400 border-orange-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500/10";
      case "uncommon": return "bg-green-500/10";
      case "rare": return "bg-blue-500/10";
      case "epic": return "bg-purple-500/10";
      case "legendary": return "bg-orange-500/10";
      default: return "bg-gray-500/10";
    }
  };

  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter((item) => item.item?.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-accent-primary text-white"
                  : "bg-dark-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">No items in your inventory</p>
          <p className="text-text-muted text-sm mt-1">Visit the shop to buy items!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-4 text-center border-2 ${getRarityColor(item.item?.rarity || "common")} ${getRarityBg(item.item?.rarity || "common")}`}
              >
                <div className="text-4xl mb-2">{item.item?.icon || "🎁"}</div>
                <h4 className="font-medium text-text-primary text-sm">{item.item?.name || "Item"}</h4>
                <Badge
                  variant={
                    item.item?.rarity === "legendary"
                      ? "danger"
                      : item.item?.rarity === "epic"
                      ? "medium"
                      : "default"
                  }
                  className="mt-1"
                >
                  {item.item?.rarity || "common"}
                </Badge>

                {item.equipped ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full text-xs"
                    onClick={() => onUnequip(item.id)}
                  >
                    Unequip
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="mt-2 w-full text-xs"
                    onClick={() => onEquip(item.id)}
                  >
                    Equip
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-tertiary">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">{items.length}</p>
          <p className="text-xs text-text-muted">Total Items</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {items.filter((i) => i.equipped).length}
          </p>
          <p className="text-xs text-text-muted">Equipped</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent-gold">
            {items.filter((i) => i.item?.rarity === "legendary").length}
          </p>
          <p className="text-xs text-text-muted">Legendary</p>
        </div>
      </div>
    </div>
  );
}
