"use client";

import { GraduationCap, FileCheck, Wallet, Clock, Award, Briefcase, ArrowRight } from "lucide-react";

const guideSteps = [
  {
    id: "admission",
    icon: GraduationCap,
    title: "ভর্তি প্রক্রিয়া",
    description: "Study in Japan from Bangladesh এর প্রথম ধাপ হলো সঠিক প্রতিষ্ঠান নির্বাচন। জাপানে দুই ধরনের শিক্ষা প্রতিষ্ঠান রয়েছে: Japanese Language Schools এবং Universities/Colleges। ভাষা স্কুলে ১-২ বছর জাপানি ভাষা শিখে বিশ্ববিদ্যালয়ে ভর্তি হওয়া যায়।",
    buttonText: "বিস্তারিত জানুন",
    href: "#admission-details",
  },
  {
    id: "coe",
    icon: FileCheck,
    title: "COE কী এবং কেন প্রয়োজন",
    description: "Certificate of Eligibility (COE) জাপান যাওয়ার মূল চাবিকাঠি। এটি জাপান ইমিগ্রেশন কর্তৃক ইস্যু করা হয় এবং আপনার ভিসা আবেদনের ভিত্তি। COE পেতে প্রয়োজন: ভর্তি কনফার্মেশন, আর্থিক প্রমাণ (ব্যাংক স্টেটমেন্ট), এবং জমা দেওয়া ফরম।",
    buttonText: "ভিসা প্রক্রিয়া জানুন",
    href: "#coe-details",
  },
  {
    id: "cost",
    icon: Wallet,
    title: "খরচের বিস্তারিত বিশ্লেষণ",
    description: "Cost of Studying in Japan শহরভেদে ভিন্ন হয়। টোকিওতে বাৎসরিক খরচ ১২-১৫ লাখ টাকা, অন্যান্য শহরে ৮-১০ লাখ। এর মধ্যে টিউশন ফি ৪-৬ লাখ এবং লিভিং এক্সপেন্স ৪-৯ লাখ। প্রথম বছরের খরচ দেখাতে হবে ব্যাংক স্টেটমেন্টে (সাধারণত ১৫-২০ লাখ টাকা)।",
    buttonText: "খরচের হিসাব দেখুন",
    href: "#cost-details",
  },
  {
    id: "parttime",
    icon: Clock,
    title: "পার্ট-টাইম জব (২৮ ঘণ্টা)",
    description: "স্টুডেন্ট ভিসায় আপনার সপ্তাহে ২৮ ঘণ্টা পার্ট-টাইম কাজের অনুমতি রয়েছে। Part-time job in Japan for students এর গড় বেতন ঘণ্টায় ১,০০০-১,২০০ ইয়েন। মাসে ১-১.৫ লাখ ইয়েন আয় সম্ভব। কনভিনিয়েন্স স্টোর, রেস্তোরাঁ, এবং ফ্যাক্টরিতে সহজেই কাজ পাওয়া যায়।",
    buttonText: "কাজের বিস্তারিত",
    href: "#parttime-details",
  },
  {
    id: "jlpt",
    icon: Award,
    title: "JLPT N5-N3 এর গুরুত্ব",
    description: "Japanese Language Course N5 N4 N3 ভিন্ন লেভেলের জন্য প্রয়োজন। N5 দিয়ে ভাষা স্কুলে ভর্তি সম্ভব, কিন্তু N3 থাকলে ভিসা সাক্সেস রেট বেশি। JLPT সার্টিফিকেট ছাড়া জাপানে স্টুডেন্ট ভিসা পাওয়া প্রায় অসম্ভব। আমাদের ৪-৬ মাসের ইন্টেনসিভ কোর্সে N5/N4 সম্পূর্ণ করা যায়।",
    buttonText: "কোর্স ডিটেইলস",
    href: "#jlpt-details",
  },
  {
    id: "work",
    icon: Briefcase,
    title: "পড়াশোনা শেষে কাজের সুযোগ",
    description: "জাপানে Work in Japan after study এর সুযোগ অপরিসীম। স্নাতক শেষে আপনি ১ বছরের Job Hunting Visa পাবেন। IT, Engineering, Nursing, এবং Business সেক্টরে প্রচুর চাকরির সুযোগ। জাপানি কোম্পানিগুলো বিদেশি কর্মীদের জন্য মাসিক ৩-৫ লাখ ইয়েন বেতন দেয়।",
    buttonText: "ক্যারিয়ার পরামর্শ নিন",
    href: "#work-details",
  },
];

export function StudyGuide() {
  return (
    <section id="guide" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            শিক্ষার রোডম্যাপ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            বাংলাদেশ থেকে জাপানে পড়াশোনার সম্পূর্ণ গাইড ২০২৬
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Study in Japan from Bangladesh - ভর্তি থেকে চাকরি পর্যন্ত বিস্তারিত রোডম্যাপ
          </p>
        </div>

        {/* Intro Text */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-center text-muted-foreground leading-relaxed">
            জাপানে উচ্চশিক্ষা বাংলাদেশি শিক্ষার্থীদের জন্য একটি সমৃদ্ধিশালী ভবিষ্যৎ নিশ্চিত করে। বিশ্বমানের শিক্ষাব্যবস্থা, উন্নত প্রযুক্তি এবং দ্রুত ক্যারিয়ার গ্রোথের সুযোগ makes Japan an ideal destination for Bangladeshi students.
          </p>
        </div>

        {/* Guide Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {guideSteps.map((step) => (
            <div
              key={step.id}
              className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-accent/30 flex flex-col"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-accent" />
              </div>

              {/* Title */}
              <h4 className="text-lg font-bold text-foreground mb-3">
                {step.title}
              </h4>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                {step.description}
              </p>

              {/* Button */}
              <a
                href={step.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
              >
                {step.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
