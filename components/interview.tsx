"use client";

import { Video, Building2, Briefcase, Check, ExternalLink } from "lucide-react";

const interviewTypes = [
  {
    id: "skype",
    icon: Video,
    title: "Skype Interview",
    description: "জাপানি স্কুল/বিশ্ববিদ্যালয়ের Skype Interview এর জন্য ২৫০টি প্রশ্নোত্তর। ফুরিগানা ও বাংলা অনুবাদসহ।",
    features: [
      "২৫০টি প্রশ্নোত্তর",
      "ফুরিগানা সহ জাপানি",
      "বাংলা অনুবাদ",
      "প্রিন্ট ফ্রেন্ডলি",
    ],
    buttonText: "দেখুন",
    href: "#skype-interview",
    color: "primary" as const,
  },
  {
    id: "embassy",
    icon: Building2,
    title: "Embassy Interview",
    description: "জাপান এম্বাসি ভিসা Interview এর জন্য ১৫০টি গুরুত্বপূর্ণ প্রশ্ন। বিভিন্ন ক্যাটেগরিতে সাজানো।",
    features: [
      "১৫০টি প্রশ্নোত্তর",
      "১০টি ক্যাটেগরি",
      "ফুরিগানা সহ",
      "প্রিন্ট রেডি",
    ],
    buttonText: "দেখুন",
    href: "#embassy-interview",
    color: "accent" as const,
  },
  {
    id: "ssw",
    icon: Briefcase,
    title: "SSW (Specified Skilled Worker)",
    description: "特定技能 (SSW) ভিসার জন্য সম্পূর্ণ গাইড। জাপানে দক্ষ কর্মী হিসেবে যেতে প্রয়োজনীয় তথ্য, পরীক্ষা ও ইন্টারভিউ প্রস্তুতি।",
    features: [
      "সম্পূর্ণ গাইড",
      "কর্মক্ষেত্র সমূহ",
      "পরীক্ষার প্রস্তুতি",
      "ইন্টারভিউ প্রশ্নাবলী",
    ],
    buttonText: "দেখুন",
    href: "#ssw-details",
    color: "secondary" as const,
  },
];

export function Interview() {
  return (
    <section id="interview" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ইন্টারভিউ প্রস্তুতি
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ইন্টারভিউ প্রস্তুতি
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Skype Interview এবং Embassy Interview এর জন্য সম্পূর্ণ গাইড
          </p>
        </div>

        {/* Interview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {interviewTypes.map((interview) => (
            <div
              key={interview.id}
              id={interview.id === "ssw" ? "ssw" : undefined}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    interview.color === "primary"
                      ? "bg-primary/10"
                      : interview.color === "accent"
                      ? "bg-accent/10"
                      : "bg-secondary/10"
                  }`}
                >
                  <interview.icon
                    className={`w-6 h-6 ${
                      interview.color === "primary"
                        ? "text-primary"
                        : interview.color === "accent"
                        ? "text-accent"
                        : "text-secondary-foreground"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {interview.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">
                {interview.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {interview.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        interview.color === "primary"
                          ? "text-primary"
                          : interview.color === "accent"
                          ? "text-accent"
                          : "text-secondary-foreground"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <a
                href={interview.href}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors ${
                  interview.color === "primary"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : interview.color === "accent"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                }`}
              >
                {interview.buttonText}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
