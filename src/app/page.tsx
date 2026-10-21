import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Facts } from "@/components/sections/Facts";
import { Problem } from "@/components/sections/Problem";
import { Moods } from "@/components/sections/Moods";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Facts />
        <Problem />
        <Moods />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
