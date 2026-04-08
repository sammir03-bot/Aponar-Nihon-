"use client";

import { BookOpen, Languages, BookText, FileText, Download } from "lucide-react";

const n5Resources = {
  vocabulary: {
    title: "ভোকাবুলারি",
    icon: BookOpen,
    items: [
      { name: "N5 Bangla Vocabulary 1-25 PDF", href: "#" },
      { name: "N5 Bangla Vocabulary PDF Complete", href: "#" },
      { name: "N5 Vocabulary (বাংলা) PDF", href: "#" },
    ],
  },
  kanji: {
    title: "কানজি 漢字",
    icon: Languages,
    items: [
      { name: "N5 Kanji 102 PDF - 102 Characters", href: "#" },
    ],
  },
  grammar: {
    title: "গ্রামার 文法",
    icon: BookText,
    items: [
      { name: "N5 Grammar Bangla PDF", href: "#" },
      { name: "N5 Bangla Grammar PDF", href: "#" },
    ],
  },
  reading: {
    title: "রিডিং 読解",
    icon: FileText,
    items: [
      { name: "N5 Reading & Grammar Minna no Nihongo", href: "#" },
    ],
  },
};

export function JLPTN5() {
  return (
    <section id="n5" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            N5 BEGINNER
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            JLPT N5 - বিগিনার লেভেল
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ১০২টি কানজি, বেসিক ভোকাবুলারি ও গ্রামার শিখুন
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Object.entries(n5Resources).map(([key, section]) => (
            <div
              key={key}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-accent/30"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-foreground">{section.title}</h3>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="group flex items-start gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
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
