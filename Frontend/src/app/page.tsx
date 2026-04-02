import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/features/landing/Hero";
import HowItWorks from "@/components/features/landing/HowItWorks";
import InteractiveLessons from "@/components/features/landing/InteractiveLessons";
import WhyChooseUs from "@/components/features/landing/WhyChooseUs";
import TutorSupport from "@/components/features/landing/TutorSupport";
import CulturalEvents from "@/components/features/landing/CulturalEvents";
import Footer from "@/components/layout/Footer";

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




