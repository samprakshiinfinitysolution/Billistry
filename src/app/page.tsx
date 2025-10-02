// src/app/page.tsx
"use client";

import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import PlansSection from "@/components/PlansSection";
import TestimonialSection from "@/components/TestimonialSection";
import StatsSection from "@/components/StatsSection";
import SecuritySection from "@/components/SecuritySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import IntegrationSection from "@/components/IntegrationSection";
import BlogSection from "@/components/BlogSection";
import ContactSection from "@/components/ContactSection";
import VideoPlayer from "@/components/VideoPlayer";
import AnyTime from "@/components/AnyTime";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <VideoPlayer/>
      <FeaturesSection />
      <HowItWorksSection />
      <AnyTime/>
      <AboutSection />
      <IntegrationSection />
      <TestimonialSection />
      <PlansSection />
      <CTASection />
      <FAQSection />
      <BlogSection />
      {/* <SecuritySection /> */}
      {/* <ContactSection /> */}
    </>
  );
}
