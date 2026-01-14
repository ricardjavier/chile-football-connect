import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchesSection from "@/components/MatchesSection";
import HowItWorks from "@/components/HowItWorks";
import CreateMatchCTA from "@/components/CreateMatchCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <MatchesSection />
        <HowItWorks />
        <CreateMatchCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
