import * as React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { CompanyTicker } from "@/components/landing/CompanyTicker";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust Bar - Company Logos */}
      <CompanyTicker className="border-y border-border bg-muted/30" />

      {/* 3. How It Works - The 4 Steps */}
      <HowItWorksSection />

      {/* 4. Features - Toolkit Grid */}
      <FeaturesSection id="features" />

      {/* 5. Testimonials - Real Stories */}
      <TestimonialsSection />

      {/* 6. FAQ - Questions? */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
