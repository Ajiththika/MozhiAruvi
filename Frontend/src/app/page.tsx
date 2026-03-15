import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import InteractiveLessons from "@/components/InteractiveLessons";
import WhyChooseUs from "@/components/WhyChooseUs";
import TutorSupport from "@/components/TutorSupport";
import CulturalEvents from "@/components/CulturalEvents";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <InteractiveLessons />
        <WhyChooseUs />
        <TutorSupport />
        <CulturalEvents />
      </main>
      <Footer />
    </div>
  );
}
