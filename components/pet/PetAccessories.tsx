"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShoppingBag, Gift } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PetItem } from "@/types";

interface PetAccessoriesProps {
  coins: number;
  ownedItems: PetItem[];
  equippedItemId: string | null;
  onBuy: (item: PetItem) => void;
  onEquip: (itemId: string) => void;
  onUnequip: (itemId: string) => void;
}

export function PetAccessories({ coins, ownedItems, equippedItemId, onBuy, onEquip, onUnequip }: PetAccessoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showShop, setShowShop] = useState(false);

  // Sample accessories data
  const accessoriesShop: PetItem[] = [
    { id: "hat1", name: "Cute Hat", icon: "🎩", category: "hat", price: 150, bonus_type: "happiness", bonus_value: 10 },
    { id: "hat2", name: "Cool Sunglasses", icon: "🕶️", category: "hat", price: 200, bonus_type: "xp", bonus_value: 5 },
    { id: "hat3", name: "Golden Crown", icon: "👑", category: "hat", price: 500, bonus_type: "all", bonus_value: 10 },
    { id: "collar1", name: "Red Bandana", icon: "🧣", category: "collar", price: 120, bonus_type: "happiness", bonus_value: 8 },
    { id: "collar2", name: "Golden Collar", icon: "📿", category: "collar", price: 300, bonus_type: "all", bonus_value: 5 },
    { id: "toy1", name: "Bouncy Ball", icon: "🎾", category: "toy", price: 80, bonus_type: "energy", bonus_value: 10 },
    { id: "toy2", name: "Squeaky Toy", icon: "🔔", category: "toy", price: 100, bonus_type: "happiness", bonus_value: 12 },
    { id: "bed1", name: "Comfy Bed", icon: "🛏️", category: "bed", price: 250, bonus_type: "energy", bonus_value: 15 },
    { id: "deco1", name: "Mini Desk", icon: "🪑", category: "decoration", price: 400, bonus_type: "xp", bonus_value: 10 },
    { id: "deco2", name: "Plant Pot", icon: "🪴", category: "decoration", price: 180, bonus_type: "happiness", bonus_value: 8 },
  ];

  const categories = [
    { id: "all", label: "All", icon: ShoppingBag },
    { id: "hat", label: "Hats", icon: "🎩" },
    { id: "collar", label: "Collars", icon: "📿" },
    { id: "toy", label: "Toys", icon: "🎾" },
    { id: "bed", label: "Beds", icon: "🛏️" },
    { id: "decoration", label: "Decor", icon: "🪴" },
  ];

  const filteredItems = selectedCategory === "all"
    ? accessoriesShop
    : accessoriesShop.filter((item) => item.category === selectedCategory);

  const getRarityColor = (bonusValue: number) => {
    if (bonusValue >= 15) return "text-purple-400 border-purple-400";
    if (bonusValue >= 10) return "text-blue-400 border-blue-400";
    return "text-gray-400 border-gray-400";
  };

  const ownedIds = ownedItems.map((item) => item.id);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Pet Accessories</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowShop(true)}>
            <ShoppingBag className="w-4 h-4 mr-1" />
            Shop
          </Button>
        </div>

        {/* Equipped Accessories */}
        {equippedItemId && (
          <div className="mb-4 p-3 bg-dark-tertiary rounded-xl">
            <p className="text-xs text-text-muted mb-2">Equipped</p>
            <div className="flex items-center gap-3">
              {ownedItems.find((item) => item.id === equippedItemId) && (
                <>
                  <span className="text-3xl">
                    {ownedItems.find((item) => item.id === equippedItemId)?.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {ownedItems.find((item) => item.id === equippedItemId)?.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      +{ownedItems.find((item) => item.id === equippedItemId)?.bonus_value}%{" "}
                      {ownedItems.find((item) => item.id === equippedItemId)?.bonus_type}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Owned Items */}
        <div className="grid grid-cols-4 gap-2">
          {ownedItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className={`p-2 rounded-lg border-2 text-center cursor-pointer ${
                equippedItemId === item.id
                  ? "bg-accent-primary/20 border-accent-primary"
                  : "bg-dark-tertiary border-dark-tertiary hover:border-text-muted"
              }`}
              onClick={() =>
                equippedItemId === item.id ? onUnequip(item.id) : onEquip(item.id)
              }
            >
              <span className="text-2xl block">{item.icon}</span>
              <span className="text-xs text-text-secondary truncate block">
                {item.name}
              </span>
              {equippedItemId === item.id && (
                <span className="text-xs text-accent-primary">Equipped</span>
              )}
            </motion.div>
          ))}
        </div>

        {ownedItems.length === 0 && (
          <div className="text-center py-6">
            <Gift className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No accessories yet</p>
            <p className="text-text-muted text-xs">Visit the shop to buy some!</p>
          </div>
        )}
      </Card>

      {/* Shop Modal */}
      <Modal isOpen={showShop} onClose={() => setShowShop(false)} title="Pet Accessories Shop" size="lg">
        <div className="space-y-4">
          {/* Coins display */}
          <div className="flex items-center justify-between p-3 bg-accent-gold/10 rounded-xl">
            <span className="text-sm text-text-secondary">Your coins</span>
            <span className="text-xl font-bold text-accent-gold">{coins} 💰</span>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-accent-primary text-white"
                    : "bg-dark-tertiary text-text-secondary"
                }`}
              >
                <span>{typeof cat.icon === "string" ? cat.icon : "📦"}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => {
              const isOwned = ownedIds.includes(item.id);
              const canAfford = coins >= item.price;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 ${
                    isOwned
                      ? "bg-dark-tertiary/50 border-dark-tertiary opacity-60"
                      : getRarityColor(item.bonus_value)
                  }`}
                >
                  <div className="text-center mb-2">
                    <span className="text-4xl block">{item.icon}</span>
                    <h4 className="font-medium text-text-primary mt-1">{item.name}</h4>
                  </div>

                  <div className="text-center mb-3">
                    <Badge
                      variant={
                        item.bonus_value >= 15
                          ? "medium"
                          : item.bonus_value >= 10
                          ? "warning"
                          : "default"
                      }
                    >
                      +{item.bonus_value}% {item.bonus_type}
                    </Badge>
                  </div>

                  {isOwned ? (
                    <Button variant="ghost" size="sm" className="w-full" disabled>
                      Owned
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!canAfford}
                      onClick={() => onBuy(item)}
                    >
                      {item.price} 💰
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
