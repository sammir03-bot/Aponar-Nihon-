"use client";

import Link from "next/link";
import { BookOpen, MessageSquare, ClipboardCheck, Users, FileText, Award } from "lucide-react";

const ctaButtons = [
  { href: "#n5", label: "N5 কোর্স", variant: "primary" as const },
  { href: "#n4", label: "N4 কোর্স", variant: "secondary" as const },
  { href: "#interview", label: "Interview", variant: "accent" as const },
  { href: "#quiz", label: "কুইজ", variant: "outline" as const },
];

const secondaryLinks = [
  { href: "#interview", label: "Interview দেখুন" },
  { href: "#n5", label: "N5 শেখা শুরু করুন" },
  { href: "#guide", label: "ড্যাশবোর্ড দেখুন" },
];

const stats = [
  { value: "৫০০০+", label: "শিক্ষার্থী", icon: Users },
  { value: "১০০+", label: "PDF রিসোর্স", icon: FileText },
  { value: "৯৮%", label: "সাকসেস রেট", icon: Award },
];

export function Hero() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-8xl lg:text-9xl font-bold text-primary/5 select-none">
        日本語
      </div>
      <div className="absolute bottom-20 left-10 text-6xl lg:text-8xl font-bold text-accent/5 select-none">
        JLPT
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>বাংলাদেশের #১ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            জাপানি ভাষা শিক্ষার সেরা প্ল্যাটফর্ম
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            JLPT N5, N4 প্রস্তুতি, Skype Interview এবং Embassy Interview এর জন্য সম্পূর্ণ গাইডলাইন
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {ctaButtons.map((button) => (
              <Link
                key={button.href}
                href={button.href}
                onClick={(e) => handleClick(e, button.href)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base
                  ${button.variant === "primary" 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25" 
                    : button.variant === "secondary"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/25"
                    : button.variant === "accent"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
                    : "border-2 border-foreground/20 text-foreground hover:bg-muted"
                  }
                `}
              >
                {button.label}
              </Link>
            ))}
          </div>

          {/* Secondary Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-6 rounded-xl bg-card shadow-lg border border-border/50"
              >
                <stat.icon className="w-8 h-8 text-primary" />
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
