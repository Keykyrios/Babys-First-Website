import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Meet } from "@/components/Meet";
import { Story } from "@/components/Story";
import { Work } from "@/components/Work";
import { Hold } from "@/components/Hold";
import { Guestbook } from "@/components/Guestbook";
import { Footer } from "@/components/Footer";
import { PipChat } from "@/components/PipChat";
import { CursorTrail } from "@/components/CursorTrail";
import { Twinkles } from "@/components/Twinkles";

export default function Home() {
  return (
    <>
      <Twinkles />
      <CursorTrail />
      <Nav />
      <main id="main">
        <Hero />
        <Stats />
        <Meet />
        <Story />
        <Work />
        <Hold />
        <Guestbook />
      </main>
      <Footer />
      <PipChat />
    </>
  );
}
