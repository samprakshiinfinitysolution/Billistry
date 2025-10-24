"use client";


import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function TermsOfUse() {
  return (
    <div className="py-20 font-poppins bg-[#F7FBFB] px-6 md:px-20">
      {/* Header */}
      <header className="text-center max-w-4xl mx-auto mb-20 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-roboto bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent">
          Terms of Use
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome to Billistry, a billing and invoicing solution provided by Billistry Apps Private Limited.<br/>
           By accessing or using our website, mobile app, and services (collectively “Services”),
           you agree to comply with these Terms & Conditions. Please read them carefully before using Billistry.
        </p>
      </header>

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-[#460F58] font-medium hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline"> Home</span>
        </Link>
      </div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto space-y-16">
        <Section
          title="Acceptance of Terms"
          content={`PLEASE READ THIS AGREEMENT CAREFULLY BEFORE USING THIS SERVICE.\n\nBY USING THE SERVICE OR CLICKING “AGREE,” YOU ARE AGREEING TO BE BOUND BY THIS AGREEMENT. IF YOU ARE AGREEING ON BEHALF OF YOUR EMPLOYER, YOU REPRESENT THAT YOU HAVE THE NECESSARY AUTHORITY TO DO SO.`}
        />

        <Section
          title="Software-as-a-Service"
          content={`This agreement provides access to and usage of Billistry, an Internet-based software service for creating GST-compliant invoices and managing billing.`}
        />

        <Section
          title="Use of Service"
          content={`• Customer Data: All data and logos uploaded by you remain your property. Billistry may use this data internally to operate the service.\n• Contractor Access: You may allow contractors to use Billistry for your benefit, and you are responsible for their compliance.\n• Account Security: Keep your passwords secure. Notify Billistry immediately of unauthorized access.`}
        />

        <Section
          title="Customer Responsibilities"
          content={`As a Billistry user, you must:\n\n- Keep login credentials confidential.\n- Be responsible for all activity in your account.\n- Prevent unauthorized access.\n- Use the service according to our knowledge base and applicable laws.`}
        />

        <Section
          title="Technical Support"
          content={`Billistry provides customer support as outlined in our Support Policy, available at https://billistry.in/support.`}
        />

        <Section
          title="Publicity"
          content={`You may state publicly that you are a Billistry customer. Billistry may include your name and logo in customer lists or promotional materials. You may opt out by contacting support.`}
        />

        <Section
          title="Disclaimers"
          content={`Billistry is provided "AS IS" without warranties. While reasonable security measures are taken, Billistry does not guarantee the service will be error-free or uninterrupted.`}
        />

        <Section
          title="Payment"
          content={`- Fees are due as specified in your subscription plan.\n- You are responsible for applicable taxes.\n- Payments can be made via Credit Card (Visa, MasterCard, Amex) or PayPal, Paytm, Phonpe.\n- Non-payment may result in suspension of service.`}
        />

        <Section
          title="Confidentiality"
          content={`Both parties must protect confidential information. Confidential information excludes publicly known or independently developed information. Disclosure may occur if required by law, with notice to the other party when possible.`}
        />

        <Section
          title="Proprietary Rights"
          content={`Billistry’s software, interface, designs, and other technologies are proprietary. You may not:\n\n- Resell or lease the service.\n- Store or transmit infringing or objectionable material.\n- Reverse-engineer or compete with Billistry using the service.`}
        />

        <Section
          title="Term and Termination"
          content={`- The agreement continues until all subscriptions end.\n- Either party may terminate for material breach with 30-day notice.\n- Suspension may occur for non-payment or violation of law.\n- Customer data may be exported within 90 days after termination; after that, Billistry is not obligated to retain it.`}
        />

        <Section
          title="Liability"
          content={`- Indirect, incidental, or consequential damages are excluded.\n- Total liability is limited to fees paid in the prior 6 months.\n- You agree to indemnify Billistry against third-party claims arising from your use.`}
        />

        <Section
          title="Governing Law"
          content={`This agreement is governed by the laws of India. Any disputes shall be resolved in Indian courts.`}
        />

        <Section
          title="Miscellaneous"
          content={`- Entire Agreement: This agreement is the full understanding between parties.\n- No Assignment: You cannot transfer this agreement without consent, except in mergers or asset sales.\n- Independent Contractors: Parties are independent contractors.\n- Force Majeure: Neither party is liable for events beyond reasonable control.\n- Feedback: You grant Billistry a perpetual license to use any submitted feedback.`}
        />

        <Section
          title="Updates"
          content={`Billistry reserves the right to modify these Terms of Use. Material changes will be notified here and via email.`}
        />

        <Section
          title="Contact"
          content={`For questions regarding these Terms of Use, contact us at:\n\nEmail: help@billistry.in\nWebsite: https://billistry.in\nPhone: +91-8435204953`}
        />
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl sm:text-3xl font-bold font-roboto text-[#390F59] border-l-4 border-[#7B53A6] pl-4">
        {title}
      </h2>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
        {content}
      </p>
    </section>
  );
}
