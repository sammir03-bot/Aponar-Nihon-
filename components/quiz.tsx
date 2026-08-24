"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const levels = [
  { id: "n5", label: "N5 (Beginner)" },
  { id: "n4", label: "N4 (Elementary)" },
];

const quizCategories = [
  {
    id: "vocabulary",
    titleEn: "Vocabulary",
    titleBn: "শব্দভাণ্ডার",
    parts: 10,
  },
  {
    id: "kanji",
    titleEn: "Kanji 漢字",
    titleBn: "কানজি",
    parts: 10,
  },
  {
    id: "grammar",
    titleEn: "Grammar 文法",
    titleBn: "ব্যাকরণ",
    parts: 10,
  },
  {
    id: "reading",
    titleEn: "Reading 読解",
    titleBn: "পাঠ",
    parts: 10,
  },
];

export function Quiz() {
  const [activeLevel, setActiveLevel] = useState("n5");

  return (
    <section id="quiz" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            প্র্যাকটিস করুন
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            JLPT কুইজ প্র্যাকটিস
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            N5 এবং N4 লেভেলের ভোকাবুলারি, কানজি, গ্রামার ও রিডিং কুইজ
          </p>
        </div>

        {/* Level Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                activeLevel === level.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card text-foreground border border-border hover:bg-muted"
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Quiz Categories */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {quizCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50"
            >
              {/* Category Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  {category.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.titleBn}
                </p>
              </div>

              {/* Part Buttons */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: category.parts }, (_, i) => i + 1).map(
                  (part) => (
                    <a
                      key={part}
                      href={`#quiz-${activeLevel}-${category.id}-part${part}`}
                      className="px-3 py-2 text-sm font-medium rounded-md bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Part {part}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
