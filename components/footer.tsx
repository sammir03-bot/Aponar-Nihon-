"use client";

import Link from "next/link";
import { Facebook, MessageCircle, Mail, Send } from "lucide-react";

const footerLinks = {
  resources: [
    { label: "JLPT N5", href: "#n5" },
    { label: "JLPT N4", href: "#n4" },
    { label: "হিরাগানা", href: "#alphabets" },
    { label: "কাতাকানা", href: "#alphabets" },
  ],
  interview: [
    { label: "Skype Interview", href: "#interview" },
    { label: "Embassy Interview", href: "#interview" },
    { label: "SSW Guide", href: "#ssw" },
  ],
  practice: [
    { label: "N5 Quiz", href: "#quiz" },
    { label: "N4 Quiz", href: "#quiz" },
    { label: "Study Guide", href: "#guide" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/shsammir91", label: "Facebook" },
  { icon: MessageCircle, href: "https://wa.me/8801576580302", label: "WhatsApp" },
  { icon: Mail, href: "mailto:shsammir91@gmail.com", label: "Email" },
  { icon: Send, href: "https://t.me/sammir03", label: "Telegram" },
];

export function Footer() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">あ</span>
              </div>
              <span className="font-bold text-xl">আপনার নিহোন</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-4">
              বাংলাদেশের #১ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম। JLPT N5, N4 প্রস্তুতি এবং Interview গাইড।
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4">রিসোর্স</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Interview */}
          <div>
            <h4 className="font-bold mb-4">ইন্টারভিউ</h4>
            <ul className="space-y-2">
              {footerLinks.interview.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice */}
          <div>
            <h4 className="font-bold mb-4">প্র্যাকটিস</h4>
            <ul className="space-y-2">
              {footerLinks.practice.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} আপনার নিহোন। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p className="text-sm text-background/60">
              Made with ♥ for Bangladeshi Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
