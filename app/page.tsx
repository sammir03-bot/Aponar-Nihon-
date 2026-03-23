import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HiraganaKatakana } from "@/components/hiragana-katakana";
import { JLPTN5 } from "@/components/jlpt-n5";
import { JLPTN4 } from "@/components/jlpt-n4";
import { Interview } from "@/components/interview";
import { Quiz } from "@/components/quiz";
import { StudyGuide } from "@/components/study-guide";
import { Features } from "@/components/features";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HiraganaKatakana />
        <JLPTN5 />
        <JLPTN4 />
        <Interview />
        <Quiz />
        <StudyGuide />
        <Features />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
