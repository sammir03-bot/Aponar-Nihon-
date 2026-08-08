"use client";

import { useState } from "react";
import { Facebook, MessageCircle, Mail, Send } from "lucide-react";

const socialLinks = [
  {
    icon: Facebook,
    label: "Facebook",
    value: "facebook.com/shsammir91",
    href: "https://facebook.com/shsammir91",
    color: "bg-blue-500",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "01576580302",
    href: "https://wa.me/8801576580302",
    color: "bg-green-500",
  },
  {
    icon: Mail,
    label: "Email",
    value: "shsammir91@gmail.com",
    href: "mailto:shsammir91@gmail.com",
    color: "bg-red-500",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "t.me/sammir03",
    href: "https://t.me/sammir03",
    color: "bg-sky-500",
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("মেসেজ পাঠানো হয়েছে!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            যোগাযোগ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            যোগাযোগ করুন
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Social Media Links */}
          <div className="bg-card rounded-xl p-6 lg:p-8 shadow-lg border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-2">
              সোশ্যাল মিডিয়া
            </h3>
            <p className="text-muted-foreground mb-6">আমাদের সাথে যুক্ত হন</p>

            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${link.color} flex items-center justify-center`}
                  >
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {link.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-xl p-6 lg:p-8 shadow-lg border border-border/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="আপনার নাম লিখুন"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  ইমেইল *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="আপনার ইমেইল লিখুন"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  বিষয়
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="বিষয় লিখুন"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  মেসেজ *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                  placeholder="আপনার মেসেজ লিখুন"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                পাঠান
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
