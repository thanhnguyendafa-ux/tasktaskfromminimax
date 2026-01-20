"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, Clock, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface PetTriviaGameProps {
  petName: string;
  onComplete: (score: number, xpEarned: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: { label: string; isCorrect: boolean }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What food restores the most energy?",
    options: [
      { label: "🍖 Basic Kibble", isCorrect: false },
      { label: "⚡ Energy Drink", isCorrect: true },
      { label: "🍪 Cookie", isCorrect: false },
      { label: "🍎 Apple", isCorrect: false },
    ],
  },
  {
    id: 2,
    question: "How much XP does a completed pomodoro give?",
    options: [
      { label: "3 XP", isCorrect: false },
      { label: "5 XP", isCorrect: true },
      { label: "10 XP", isCorrect: false },
      { label: "15 XP", isCorrect: false },
    ],
  },
  {
    id: 3,
    question: "What stat decreases the fastest over time?",
    options: [
      { label: "Health", isCorrect: false },
      { label: "Hunger", isCorrect: false },
      { label: "Energy", isCorrect: false },
      { label: "Happiness", isCorrect: true },
    ],
  },
  {
    id: 4,
    question: "How many activities can you do before needing rest?",
    options: [
      { label: "3", isCorrect: false },
      { label: "5", isCorrect: false },
      { label: "Depends on energy", isCorrect: true },
      { label: "Unlimited", isCorrect: false },
    ],
  },
  {
    id: 5,
    question: "What is the maximum evolution stage?",
    options: [
      { label: "3", isCorrect: false },
      { label: "4", isCorrect: true },
      { label: "5", isCorrect: false },
      { label: "6", isCorrect: false },
    ],
  },
];

export function PetTriviaGame({ petName, onComplete }: PetTriviaGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = questions[currentQuestion].options[index].isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        const xpEarned = score + (correct ? 1 : 0) * 10;
        onComplete(score + (correct ? 1 : 0), xpEarned);
      }
    }, 1000);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <Card className="p-6 text-center">
        <Brain className="w-12 h-12 text-accent-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Pet Trivia Challenge
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Test your pet care knowledge and earn XP!
        </p>
        <div className="bg-dark-tertiary rounded-xl p-4 mb-4">
          <p className="text-xs text-text-muted mb-2">Rules</p>
          <ul className="text-xs text-text-secondary text-left space-y-1">
            <li>• 5 questions per round</li>
            <li>• +10 XP per correct answer</li>
            <li>• +50 XP for perfect score</li>
          </ul>
        </div>
        <Button onClick={() => setGameStarted(true)} className="w-full">
          Start Game
        </Button>
      </Card>
    );
  }

  if (showResult) {
    const xpEarned = score * 10 + (score === 5 ? 50 : 0);
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-16 h-16 text-accent-gold mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Game Complete!
        </h3>
        <div className="text-5xl font-bold text-accent-primary mb-2">
          {score}/5
        </div>
        <p className="text-sm text-text-secondary mb-4">
          {score === 5 ? "Perfect score! 🏆" : score >= 3 ? "Good job! 👏" : "Keep learning! 📚"}
        </p>
        <div className="bg-accent-gold/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-accent-gold" />
            <span className="text-xl font-bold text-accent-gold">+{xpEarned} XP</span>
          </div>
        </div>
        <Button onClick={restartGame} className="w-full">
          Play Again
        </Button>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="p-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent-primary" />
          <span className="text-sm text-text-secondary">
            Question {currentQuestion + 1}/5
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < score
                  ? "bg-accent-gold"
                  : i === currentQuestion
                  ? "bg-accent-primary"
                  : "bg-dark-tertiary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-medium text-text-primary mb-6">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedAnswer === null
                ? "bg-dark-tertiary hover:bg-dark-tertiary/80"
                : selectedAnswer === index
                ? isCorrect
                  ? "bg-green-500/20 border-2 border-green-500"
                  : "bg-red-500/20 border-2 border-red-500"
                : index === question.options.findIndex((o) => o.isCorrect) &&
                  selectedAnswer !== null
                ? "bg-green-500/20 border-2 border-green-500"
                : "opacity-50"
            }`}
          >
            <span className="text-sm text-text-primary">{option.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 p-3 rounded-xl text-center ${
              isCorrect ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <p className={isCorrect ? "text-green-400" : "text-red-400"}>
              {isCorrect ? "✅ Correct! +10 XP" : "❌ Wrong answer"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
