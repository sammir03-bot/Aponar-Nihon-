"use client";

import { BookOpen, Languages, BookText, FileText, Download } from "lucide-react";

const n4Resources = {
  vocabulary: {
    title: "ভোকাবুলারি",
    icon: BookOpen,
    items: [
      { name: "JLPT N4 Vocab List Bangla PDF", href: "#" },
      { name: "N4 Vocabulary (Lesson 25-50) PDF", href: "#" },
    ],
  },
  kanji: {
    title: "কানজি 漢字",
    icon: Languages,
    items: [
      { name: "N4 Kanji (320) PDF - 320 Characters", href: "#" },
    ],
  },
  grammar: {
    title: "গ্রামার 文法",
    icon: BookText,
    items: [
      { name: "N4 Grammar Bangla 2021 PDF", href: "#" },
      { name: "N4 Grammar Rules (25-50) PDF", href: "#" },
    ],
  },
  reading: {
    title: "রিডিং 読解",
    icon: FileText,
    items: [
      { name: "N4 Reading (Lesson 25-50) PDF", href: "#" },
    ],
  },
};

export function JLPTN4() {
  return (
    <section id="n4" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-4">
            N4 ELEMENTARY
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            JLPT N4 - এলিমেন্টারি লেভেল
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ৩২০টি কানজি, বাড়তি ভোকাবুলারি ও জটিল গ্রামার
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Object.entries(n4Resources).map(([key, section]) => (
            <div
              key={key}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-secondary/30"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="font-bold text-foreground">{section.title}</h3>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="group flex items-start gap-2 text-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
                    >
                      <Download className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:underline underline-offset-2">
                        {item.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
