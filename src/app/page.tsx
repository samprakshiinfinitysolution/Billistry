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
<<<<<<< HEAD
=======
import VideoPlayer from "@/components/VideoPlayer";
import AnyTime from "@/components/AnyTime";
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
<<<<<<< HEAD
      <FeaturesSection />
      <HowItWorksSection />
=======
      <VideoPlayer/>
      <FeaturesSection />
      <HowItWorksSection />
      <AnyTime/>
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
      <AboutSection />
      <IntegrationSection />
      <TestimonialSection />
      <PlansSection />
      <CTASection />
      <FAQSection />
      <BlogSection />
<<<<<<< HEAD
      <SecuritySection />
      <ContactSection />
=======
      {/* <SecuritySection /> */}
      {/* <ContactSection /> */}
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
    </>
  );
}
