"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Coins, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MysteryBoxProps {
  coins: number;
  onBuy: (boxType: string) => void;
}

const boxTypes = [
  { id: "common", name: "Common Box", price: 100, rarity: "common", color: "from-gray-500 to-gray-600", contents: ["coins", "items"] },
  { id: "uncommon", name: "Uncommon Box", price: 250, rarity: "uncommon", color: "from-green-500 to-green-600", contents: ["coins", "items"] },
  { id: "rare", name: "Rare Box", price: 500, rarity: "rare", color: "from-blue-500 to-blue-600", contents: ["items", "effects"] },
  { id: "epic", name: "Epic Box", price: 1000, rarity: "epic", color: "from-purple-500 to-purple-600", contents: ["items", "pets"] },
  { id: "legendary", name: "Legendary Box", price: 2500, rarity: "legendary", color: "from-orange-500 to-orange-600", contents: ["rare_items", "titles"] },
  { id: "mystery", name: "Mystery Box", price: 150, rarity: "random", color: "from-pink-500 to-purple-600", contents: ["random"] },
];

export function MysteryBox({ coins, onBuy }: MysteryBoxProps) {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<{ name: string; icon: string; rarity: string } | null>(null);

  const handleOpen = (boxId: string) => {
    setSelectedBox(boxId);
    setIsOpening(true);

    // Simulate opening animation
    setTimeout(() => {
      setIsOpening(false);
      // Random item based on box type
      const items = [
        { name: "50 Coins", icon: "💰", rarity: "common" },
        { name: "100 Coins", icon: "💰", rarity: "uncommon" },
        { name: "Basic Frame", icon: "🖼️", rarity: "common" },
        { name: "Silver Frame", icon: "⚪", rarity: "rare" },
        { name: "Common Badge", icon: "🏅", rarity: "common" },
        { name: "Rare Badge", icon: "🥈", rarity: "rare" },
        { name: "Pet Treat", icon: "🍪", rarity: "common" },
        { name: "XP Boost", icon: "✨", rarity: "uncommon" },
      ];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setOpenedItem(randomItem);
    }, 2000);
  };

  const closeModal = () => {
    setSelectedBox(null);
    setOpenedItem(null);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent-gold" />
            <h3 className="text-lg font-semibold text-text-primary">Mystery Boxes</h3>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent-gold" />
            <span className="text-sm font-medium text-accent-gold">{coins}</span>
          </div>
        </div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-2 gap-3">
          {boxTypes.map((box, index) => {
            const canAfford = coins >= box.price;
            return (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl bg-gradient-to-br ${box.color} ${
                  !canAfford ? "opacity-50" : ""
                }`}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-4xl mb-2"
                  >
                    🎁
                  </motion.div>
                  <h4 className="font-medium text-white">{box.name}</h4>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span className="text-lg font-bold text-white">{box.price}</span>
                  </div>
                  <Badge variant="default" className="mt-2 bg-white/20">
                    {box.rarity}
                  </Badge>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white"
                  disabled={!canAfford}
                  onClick={() => handleOpen(box.id)}
                >
                  Open
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-dark-tertiary rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-text-primary">What&apos;s Inside?</span>
          </div>
          <p className="text-xs text-text-muted">
            Each box contains random items, coins, or XP bonuses. Higher rarity boxes have better rewards!
          </p>
        </div>
      </Card>

      {/* Opening Animation Modal */}
      <AnimatePresence>
        {selectedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center max-w-sm mx-4"
            >
              {isOpening ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-8xl mb-4"
                  >
                    🎁
                  </motion.div>
                  <p className="text-xl font-bold text-white">Opening...</p>
                  <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.2 }}
                        className="w-3 h-3 rounded-full bg-accent-gold"
                      />
                    ))}
                  </div>
                </>
              ) : openedItem ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-8xl mb-4"
                  >
                    {openedItem.icon}
                  </motion.div>
                  <Badge
                    variant={
                      openedItem.rarity === "rare"
                        ? "medium"
                        : openedItem.rarity === "uncommon"
                        ? "warning"
                        : "default"
                    }
                    className="mb-2"
                  >
                    {openedItem.rarity}
                  </Badge>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {openedItem.name}
                  </h3>
                  <p className="text-sm text-text-muted mb-4">Congratulations!</p>
                  <Button onClick={closeModal}>Awesome!</Button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
