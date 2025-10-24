"use client";
import { useState } from "react";
import { Mail, Phone, MessageCircle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="bg-[#F7FBFB] font-poppins">
      {/* Hero Section */}
      <section className="text-center py-16 px-6 md:px-20">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
          Billistry Support
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          Need help with billing, invoices, or your subscription? We’re here to assist you 24/7.
        </p>
      </section>

      {/* Contact Options */}
      <section className="max-w-7xl mx-auto  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-12">
        <ContactCard
          icon={<Mail className="w-8 h-8 text-white" />}
          title="Email Us"
          desc="Send us your query and we’ll reply within 24 hours."
          action="help@billistry.in"
          link="mailto:help@billistry.in"
        />
        <ContactCard
          icon={<Phone className="w-8 h-8 text-white" />}
          title="Call Support"
          desc="Speak with our customer care team directly."
          action="+91-8435204953,"
          link="tel:+91XXXXXXXXXX"
        />
        <ContactCard
          icon={<MessageCircle className="w-8 h-8 text-whiite" />}
          title="Live Chat"
          desc="Chat with us in real-time for quick solutions."
          action="Start Chat"
          link="/chat"
        />
        <ContactCard
          icon={<BookOpen className="w-8 h-8 text-white" />}
          title="Help Center"
          desc="Read FAQs, guides, and tutorials."
          action="Visit Docs"
          link="/docs"
        />
      </section>

      {/* FAQ Section */}
      <section className="max-w-5xl mx-auto py-16 px-6 md:px-12">
  <h2 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
    Frequently Asked Questions
  </h2>
  <div className="space-y-6 max-h-[700px] overflow-y-auto no-scrollbar pr-2">
    {faqs.map((faq, i) => (
      <FAQ key={i} question={faq.q} answer={faq.a} />
    ))}
  </div>
</section>


      {/* CTA Section */}
      <section className="text-center py-16 px-6 md:px-20  bg-gradient-to-r from-[#390F59] to-[#7B53A6] bg-clip-text text-transparent">
        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
        <p className="mb-6 max-w-xl mx-auto text-gray-500">
          Can’t find what you’re looking for? Contact our support team, and we’ll get back to you shortly.
        </p>
        <a href="/contact">
          <button className="bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] px-8 py-3 cursor-pointer text-white hover:bg-[#460F58] font-semibold py-2 rounded-md transition transform hover:scale-105">
            Contact 
          </button>
        </a>
      </section>
    </div>
  );
}

/* Reusable Contact Card */
function ContactCard({ icon, title, desc, action, link }: any) {
  return (
    <a
      href={link}
      className="bg-white rounded-2xl shadow-md p-6 hover:shadow-[0_8px_20px_rgba(123,83,166,0.25)]  hover:border-[#7B53A6] border transition duration-300 block"
    >
      <div className="flex flex-col items-center text-center space-y-4 ">
        <div className="p-4 rounded-full bg-gradient-to-r from-[#744D81] to-[#7B53A6] text-white ">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-[#460F58]">{title}</h3>
        <p className="text-gray-600">{desc}</p>
        <span className="font-semibold text-[#7B53A6]">{action}</span>
      </div>
    </a>
  );
}

/* FAQ Section */
function FAQ({ question, answer }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 ">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-lg font-bold text-[#390F59]">{question}</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[#7B53A6]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#7B53A6]" />
        )}
      </div>
      {open && <p className="mt-4 text-gray-500">{answer}</p>}
    </div>
  );
}

/* FAQ Data */
const faqs = [
     {
    q: "How do I use Billistry for the first time?",
    a: "After signing up, you can set up your company profile, add products or services, and start creating GST-compliant invoices from the dashboard.",
  },
  {
    q: "How do I reset my password?",
    a: "Go to the login page, click on 'Forgot Password', and follow the instructions sent to your registered email.",
  },
  {
    q: "Can I upgrade or downgrade my subscription?",
    a: "Yes, you can change your subscription plan anytime in the Billing section of your account settings.",
  },
  {
    q: "How do I contact technical support?",
    a: "You can email us at help@billistry.in or use the Live Chat option for quick assistance.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we provide a full refund within 7 days of purchase. Convenience fees are non-refundable.",
  },
  {
    q: "How do I create an invoice?",
    a: "Go to the Invoices section, click on 'Create Invoice', enter customer and product details, and save. You can download or share the invoice directly with your client.",
  },
  {
    q: "Can I customize my invoice templates?",
    a: "Yes, Billistry allows you to customize invoice templates by adding your company logo, brand colors, terms & conditions, and custom fields.",
  },
  {
    q: "What payment methods do you support?",
    a: "We accept Credit/Debit Cards (Visa, MasterCard, Amex), UPI, Net Banking, and PayPal for subscription payments.",
  },
  {
    q: "How do I track payment status?",
    a: "Billistry provides real-time payment tracking. You can view whether an invoice is Paid, Pending, or Overdue from your dashboard.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, Billistry uses bank-grade encryption (SSL) and secure cloud storage to ensure your billing data remains private and safe.",
  },
  {
    q: "Can I manage multiple businesses with one account?",
    a: "Yes, Billistry supports multiple business profiles under a single account so you can easily switch between them.",
  },
 
  {
    q: "Do you offer refunds?",
    a: "Yes, we provide a full refund within 7 days of purchase if you’re not satisfied. Convenience fees, if any, are non-refundable.",
  },
];
