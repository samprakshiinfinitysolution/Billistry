import { useState } from "react";
import { Plus, Minus, Headset, Users, Handshake } from "lucide-react";

const faqs = [
  {
    question: "Are there any limits on invoices in Billistry Billing plans?",
    answer: (
      <>
        The Standard and Premium plans allow you to create up to 100,000 invoices per year with annual 
        revenue not exceeding $1 million.
        <br />
        For requirements beyond these limits, please reach out to our support team at{" "}
        <a className="text-[#7B53A6] underline" href="mailto:support@billistry.com">
          support@billistry.com
        </a>{" "}
        for customized solutions and assistance.
      </>
    ),
  },
  {
    question: "Does Billistry Billing support multiple users?",
    answer: (
      <>
        Yes, Billistry Billing supports multi-user access. You can add up to 3 users in the Standard 
        plan and up to 10 users in the Premium plan, each with customizable roles and access levels.
        <br />
        Need more users? We offer user add-ons to meet your team needs and ensure smooth functionality.
      </>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <>
        We accept payments via Visa, MasterCard, American Express, and PayPal. Additionally,
         a bank transfer or check transfer is available for yearly subscriptions. For further details,
          please get in touch with us at{" "}
        <a className="text-[#7B53A6] underline" href="mailto:support@billistry.com">
          support@billistry.com
        </a>
        .
      </>
    ),
  },
  {
    question: "Can I get a demo of Billistry Billing?",
    answer: (
      <>
        Certainly! We are delighted to offer a web conference demonstration of Billistry Billing. Please fill{" "}
        <button className="text-[#7B53A6] underline" onClick={() => console.log("Open demo form")}>
          this form
        </button>{" "}
        to schedule your personalized 45-minute session.
      </>
    ),
  },
  {
    question: "Are your contracts flexible?",
    answer: (
      <>
        Yes, there are no binding contracts or commitments. Billistry Billing operates on a pay-as-you-go basis, 
        either monthly or yearly, allowing you to modify your plan as needed. If you ever find yourself 
        unsatisfied with our product or service, you can cancel your subscription at any time and receive
         a full refund according to{" "}
        <a className="text-[#7B53A6] underline" href="#">
          our company refund policy
        </a>
        .
      </>
    ),
  },
];

const contacts = [
  {
    icon: <Headset className="w-10 h-10 text-[#460F58]" />,
    type: "Support Enquiry",
    email: "support@billistry.com",
    phone: "+91 07313153523",
  },
  {
    icon: <Users className="w-10 h-10 text-[#460F58]" />,
    type: "Sales Enquiry",
    email: "sales@billistry.com",
    phone: "+91-8435204953",
  },
  {
    icon: <Handshake className="w-10 h-10 text-[#460F58]" />,
    type: "Partnership Enquiry",
    email: "partner-support@billistry.com",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-br from-[#F7FBFB] via-white to-[#F7FBFB] py-20 px-6 font-['Poppins']">
  <div className="max-w-4xl mx-auto">
    {/* Heading */}
    <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent font-['Roboto']">
      Frequently Asked Questions
    </h2>

    {/* FAQ list */}
    <div className="max-h-[600px] overflow-y-auto no-scrollbar space-y-4 pr-2">
      <ul className="space-y-4">
        {faqs.map((faq, i) => (
          <li
            key={i}
            className="bg-white rounded-2xl  shadow-md border border-gray-200 overflow-hidden transition-all duration-300"
          >
            <button
  onClick={() => toggleFAQ(i)}
  className={`w-full flex justify-between cursor-pointer items-center px-6 py-4 text-left font-semibold transition font-['Roboto'] ${
    openIndex === i
      ? "bg-[#F0E6FB] text-[#460F58] shadow-inner"
      : "text-gray-800 "
  }`}
  aria-expanded={openIndex === i}
  aria-controls={`faq-answer-${i}`}
>
  <span>{faq.question}</span>
  {openIndex === i ? (
    <Minus className="w-5 h-5 text-[#7B53A6]" />
  ) : (
    <Plus className="w-5 h-5 text-[#7B53A6]" />
  )}
</button>


            <div
              id={`faq-answer-${i}`}
              className={`px-6 pb-4 text-gray-600 text-sm sm:text-base transition-all duration-500 font-['Poppins'] ${
                openIndex === i ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {faq.answer}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Contact Section */}
  <div className="max-w-7xl mx-auto text-center mt-20 sm:px-8 lg:px-10 ">
    <h3 className="text-3xl sm:text-4xl font-semibold mb-12 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent font-['Roboto']">
      Have more questions? Contact us!
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {contacts.map((contact, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 hover:border-[#7B53A6] rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl font-['Poppins']"
        >
          <div className="mb-4">{contact.icon}</div>
          <div className="text-lg font-semibold text-[#390F59] mb-2 font-['Roboto']">
            {contact.type}
          </div>
          <div className="text-gray-500 mb-1">
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-[#7B53A6] underline"
            >
              {contact.email}
            </a>
          </div>
          {contact.phone && (
            <div className="text-gray-500">{contact.phone}</div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

  );
}

