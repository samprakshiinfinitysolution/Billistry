// src/app/page.tsx
"use client";
import { useSession } from "next-auth/react";
import FreeTrialPopup from "@/components/FreeTrialPopup";
import AnimatedSection from "@/components/AnimatedSection";
import AdvertisementPopup from "@/components/AdvertisementPopup";

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
import AppPromoSection from "@/components/AppPromoSection";
import WelcomeBanner from "@/components/WelcomeBanner";
import MadeInIndia from "@/components/MadeInIndia";

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
      {!session && <FreeTrialPopup />}
      {/* <AdvertisementPopup /> */}
      <AnimatedSection>
        <HeroSection />
      </AnimatedSection>
      <AnimatedSection>
        <StatsSection />
      </AnimatedSection>
      <AnimatedSection>
        <FeaturesSection />
      </AnimatedSection>
       <AppPromoSection />
      <AnimatedSection>
        <HowItWorksSection />
      </AnimatedSection>
      {/* <AnimatedSection>
        <AboutSection />
      </AnimatedSection> */}
      <AnimatedSection>
        <IntegrationSection />
      </AnimatedSection>
      <AnimatedSection>
        <TestimonialSection />
      </AnimatedSection>
      <AnimatedSection>
        <PlansSection />
      </AnimatedSection>
      <CTASection /> {/* CTA is often full-width and might not need animation */}
      
     
      {/* <BlogSection /> */}
      <SecuritySection />
      <WelcomeBanner/>
      <MadeInIndia/>
      <FAQSection />
      {/* <ContactSection /> */}
    </>
  );
}
