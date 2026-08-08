"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

const alphabets = [
  {
    symbol: "あ",
    title: "হিরাগানা",
    description: "৪৬টি বেসিক অক্ষর, ডাকুটেন ও যৌগিক অক্ষর। জাপানি শব্দের মূল বর্ণমালা।",
    buttonText: "হিরাগানা দেখুন",
    href: "#hiragana",
  },
  {
    symbol: "ア",
    title: "কাতাকানা",
    description: "বিদেশি শব্দ, নাম ও জোর দেওয়ার জন্য ব্যবহৃত ৪৬টি অক্ষর।",
    buttonText: "কাতাকানা দেখুন",
    href: "#katakana",
  },
];

export function HiraganaKatakana() {
  return (
    <section id="alphabets" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            হিরাগানা ও কাতাকানা
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            জাপানি বর্ণমালা শিখুন
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            হিরাগানা ও কাতাকানা - জাপানি ভাষার প্রাথমিক ধাপ
          </p>
        </div>

        {/* Alphabet Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {alphabets.map((item) => (
            <div
              key={item.title}
              className="group relative bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-primary/30"
            >
              {/* Large Symbol */}
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">
                    {item.symbol}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {item.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Button */}
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {item.buttonText}
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
