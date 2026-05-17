import HeroSection from "./components/HeroSection";
import Marquee from "./components/Marquee";
import ProductShowcase from "./components/ProductShowcase";
import StorySection from "./components/StorySection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Marquee />
      <ProductShowcase />
      <StorySection />
    </main>
  );
}
