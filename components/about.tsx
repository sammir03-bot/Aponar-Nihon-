"use client";

import { Users, FileText, Award } from "lucide-react";

const stats = [
  { value: "৫০০০+", label: "শিক্ষার্থী", icon: Users },
  { value: "১০০+", label: "PDF রিসোর্স", icon: FileText },
  { value: "৯৮%", label: "সাকসেস রেট", icon: Award },
];

export function About() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            আমাদের গল্প
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আমাদের সম্পর্কে
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            আপনার নিহোন বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি একটি সম্পূর্ণ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম।
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* About Content */}
          <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border/50 mb-8">
            <p className="text-muted-foreground leading-relaxed text-center mb-8">
              আমাদের প্ল্যাটফর্মে আপনি পাবেন JLPT N5 এবং N4 এর সম্পূর্ণ স্টাডি ম্যাটেরিয়াল, Skype Interview এবং Embassy Interview এর জন্য বিস্তারিত প্রস্তুতি গাইড।
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-muted/50"
                >
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Japanese Text Decoration */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-primary/5 border border-primary/10">
              <span className="text-4xl font-bold text-primary">🇯🇵</span>
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">日本語</div>
                <div className="text-sm text-muted-foreground">NIHONGO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
