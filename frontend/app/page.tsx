import HeroSection from "./components/HeroSection";
import Marquee from "./components/Marquee";
import ProductShowcase from "./components/ProductShowcase";
import StorySection from "./components/StorySection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Marquee />
      <ProductShowcase />
      <StorySection />
      <Footer />
    </main>
  );
}
