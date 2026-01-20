"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Coins } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShopItem } from "@/types";

interface ShopGridProps {
  items: ShopItem[];
  userCoins: number;
  onBuy: (itemId: string, price: number) => void;
}

export function ShopGrid({ items, userCoins, onBuy }: ShopGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "frame", "badge", "title", "pet", "effect"];
  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-400";
      case "uncommon": return "text-green-400";
      case "rare": return "text-blue-400";
      case "epic": return "text-purple-400";
      case "legendary": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent-gold" />
          <span className="text-lg font-medium text-text-primary">{userCoins} coins</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
              selectedCategory === cat
                ? "bg-accent-primary text-white"
                : "bg-dark-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center">
              <div className="text-4xl mb-2">{item.icon}</div>
              <h4 className="font-medium text-text-primary text-sm">{item.name}</h4>
              <p className={`text-xs capitalize ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Coins className="w-3 h-3 text-accent-gold" />
                <span className="text-sm font-medium text-accent-gold">
                  {item.price_coins}
                </span>
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                disabled={userCoins < item.price_coins}
                onClick={() => onBuy(item.id, item.price_coins)}
              >
                Buy
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <ShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">No items in this category</p>
        </div>
      )}
    </div>
  );
}
