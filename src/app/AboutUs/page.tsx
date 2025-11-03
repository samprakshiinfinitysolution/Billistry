"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import StatsSection from "@/components/StatsSection";
import LoginSlider from "@/components/LoginSlider";
import RequestDemo from "@/components/RequestDemo";

export default function AboutUs() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  return (
    <>
    <section className="bg-[#F7FBFB] text-[#390F59]  ">
      {/* Hero Section */}
      <div className="py-20 px-6 text-center">
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-[#460F58]"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          About Billistry
        </h1>
        <p
          className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Billistry is your complete business management companion — simplifying
          inventory, sales, purchases, and finances in one easy-to-use platform.
          Our goal is to empower shop owners and small businesses with the same
          powerful tools that large enterprises use, but in a way that is
          intuitive, cost-effective, and tailored for their daily needs.
        </p>
      </div>

      {/* About Billistry Section */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2
            className="text-3xl font-bold text-[#460F58] mb-4"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            What is Billistry?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Billistry is a modern business management app built for shop owners
            and small businesses. It integrates inventory, billing, purchases,
            cash management, and reporting into a single solution.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Our platform has been designed after understanding the daily
            struggles of small businesses — from maintaining stock levels to
            tracking payments and generating GST-compliant invoices.
          </p>
          <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
            Whether you’re a grocery store, clothing shop, electronics dealer,
            or service provider, Billistry is built to make your operations
            smooth, efficient, and scalable as your business grows.
          </p>
        </div>
        <div className="bg-[#F7FBFB] p-8 rounded-2xl hover:border-[#7B53A6] shadow-md text-center border border-[#E0E0E0] hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition">
          <h3 className="text-xl font-semibold text-[#744D81] mb-3" style={{ fontFamily: "Roboto, sans-serif" }}>
            Designed For Growth
          </h3>
          <p className="text-gray-600" style={{ fontFamily: "Poppins, sans-serif" }}>
            Empowering small businesses with tools that save time, reduce
            errors, and enable smarter decision-making. With automated reports,
            role-based access, and seamless integrations, Billistry is not just
            a software but a growth partner you can rely on.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-[#F7FBFB] p-8 rounded-2xl hover:border-[#7B53A6] shadow hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition border border-[#E0E0E0]">
            <h2 className="text-2xl font-bold text-[#460F58] mb-3" style={{ fontFamily: "Roboto, sans-serif" }}>
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              To simplify business management for shop owners by offering
              powerful yet user-friendly tools.
            </p>
            <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
              Our mission extends beyond software — we want to create an
              ecosystem where small businesses thrive, where owners can easily
              manage their accounts, reduce wastage, and stay on top of their
              financial health.
            </p>
          </div>
          <div className="bg-[#F7FBFB] p-8 rounded-2xl hover:border-[#7B53A6] shadow hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition border border-[#E0E0E0]">
            <h2 className="text-2xl font-bold text-[#460F58] mb-3" style={{ fontFamily: "Roboto, sans-serif" }}>
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
              To become the most trusted business management platform for small
              businesses, enabling them to scale seamlessly.
            </p>
            <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
              We envision a future where even the smallest shopkeeper can access
              insights, automation, and technology that previously only large
              corporations could afford.
            </p>
          </div>
        </div>
      </div>

      <StatsSection />
       {/* Features Section */}
      <div className="py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-[#460F58] mb-12"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Key Features
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: "Inventory Management", desc: "Track stock with alerts, manage warehouses, and generate barcodes." },
              { title: "Sales & Purchases", desc: "Record transactions, manage supplier bills, and streamline sales." },
              { title: "Customer Management", desc: "Keep detailed profiles, track payments, and build relationships." },
              { title: "Reports & Insights", desc: "Generate reports and discover trends to boost profit margins." },
              { title: "Cash Management", desc: "Track cash, payments, and maintain a clear financial picture." },
              { title: "User-Friendly Design", desc: "Simple and intuitive, even for first-time users." },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#F7FBFB] rounded-xl shadow hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition border border-[#E0E0E0] hover:border-[#7B53A6]"
              >
                <h3
                  className="text-lg font-semibold text-[#744D81] mb-2"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-gray-600 text-sm"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-[#460F58] text-center mb-12"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Why Choose Billistry?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "All-in-One Platform", desc: "Inventory, billing, cash, and reports in one place." },
              { title: "Built for Small Businesses", desc: "Tailored for shops, vendors, and enterprises." },
              { title: "Save Time & Reduce Errors", desc: "Automated processes ensure accuracy and efficiency." },
              { title: "Smart Decision-Making", desc: "Reports give insights to make informed choices." },
              { title: "Secure & Reliable", desc: "Protected with industry-standard security & cloud backup." },
              { title: "Future-Ready", desc: "Regular updates & integrations to stay modern." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#F7FBFB] rounded-xl shadow hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)] transition border border-[#E0E0E0] hover:border-[#7B53A6]"
              >
                <h3
                  className="text-xl font-semibold text-[#744D81] mb-2"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-gray-600"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing Statement */}
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        <h2
          className="text-3xl font-bold text-[#460F58] mb-4"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          Billistry — Your Growth Partner
        </h2>
        <p
          className="text-gray-600 leading-relaxed text-lg"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          With Billistry, you can focus on what matters most — growing your
          business. We take care of operations so you can take care of your
          customers. From a single store to multiple outlets, Billistry adapts
          to your needs and grows with you every step of the way.
        </p>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6 text-center text-[#F7FBFB]">
        <h2 className="text-3xl text-[#460F58] sm:text-4xl font-bold mb-4" style={{ fontFamily: "Roboto, sans-serif" }}>
          Ready to simplify your business management?
        </h2>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl text-gray-600 mx-auto" style={{ fontFamily: "Poppins, sans-serif" }}>
          Take the next step towards smarter operations and smoother growth.  
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          
            <button onClick={() => setShowLogin(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-[#F7FBFB] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md hover:scale-105 transition-all duration-200">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          

          <button
            onClick={() => setShowDemo(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#7B53A6] text-[#7B53A6] px-4 sm:px-6 md:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gradient-to-r hover:from-[#390F59] hover:via-[#460F58] hover:to-[#7B53A6] hover:text-[#F7FBFB] transition-all duration-200 shadow-sm"
          >
            Request Demo
          </button>
        </div>
      </div>
    </section>
    {showLogin && <LoginSlider onClose={() => setShowLogin(false)} />}
    {showDemo && <RequestDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />}
    </>
  );
}
