"use client";

import { BookOpen, GraduationCap, Video, Building2, FileText, Smartphone } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "সম্পূর্ণ N5 কোর্স",
    description: "ভোকাবুলারি, কানজি, গ্রামার ও রিডিং",
  },
  {
    icon: GraduationCap,
    title: "সম্পূর্ণ N4 কোর্স",
    description: "উন্নত লেভেলের সব ম্যাটেরিয়ালস",
  },
  {
    icon: Video,
    title: "Skype Interview",
    description: "২৫০টি প্রশ্নোত্তর ফুরিগানা সহ",
  },
  {
    icon: Building2,
    title: "Embassy Interview",
    description: "১৫০টি গুরুত্বপূর্ণ প্রশ্ন ও উত্তর",
  },
  {
    icon: FileText,
    title: "PDF ম্যাটেরিয়ালস",
    description: "অফলাইনে পড়ার সুবিধা",
  },
  {
    icon: Smartphone,
    title: "মোবাইল ফ্রেন্ডলি",
    description: "যেকোনো ডিভাইসে সহজে ব্যবহার",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            কেন আমরা সেরা
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আমাদের ফিচারসমূহ
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            জাপানি ভাষা শিক্ষার জন্য সবকিছু একই প্ল্যাটফর্মে
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-primary/30 text-center"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
