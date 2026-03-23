import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "আপনার নিহোন | JLPT N5 N4 জাপানি ভাষা শিক্ষা",
  description:
    "বাংলাদেশের #১ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম। JLPT N5, N4 প্রস্তুতি, Skype Interview এবং Embassy Interview এর জন্য সম্পূর্ণ গাইডলাইন।",
  keywords: [
    "JLPT N5",
    "JLPT N4",
    "জাপানি ভাষা",
    "Japanese Language",
    "Bangladesh",
    "Skype Interview",
    "Embassy Interview",
    "Study in Japan",
    "SSW",
    "Specified Skilled Worker",
  ],
  authors: [{ name: "Sammir" }],
  creator: "আপনার নিহোন",
  publisher: "আপনার নিহোন",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://aponar-nihon.eu.cc",
    siteName: "আপনার নিহোন",
    title: "আপনার নিহোন | JLPT N5 N4 জাপানি ভাষা শিক্ষা",
    description:
      "বাংলাদেশের #১ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম। JLPT N5, N4 প্রস্তুতি, Skype Interview এবং Embassy Interview এর জন্য সম্পূর্ণ গাইডলাইন।",
  },
  twitter: {
    card: "summary_large_image",
    title: "আপনার নিহোন | JLPT N5 N4 জাপানি ভাষা শিক্ষা",
    description:
      "বাংলাদেশের #১ জাপানি ভাষা শিক্ষা প্ল্যাটফর্ম। JLPT N5, N4 প্রস্তুতি।",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dc2f5a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
