

// "use client";
// import { Mail, Phone, MapPin } from "lucide-react";

// export default function ContactUs() {
//   return (
//     <section className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
//       <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12">
//         {/* Left: Contact Form */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8 text-black">Contact Us</h2>
//           <form className="space-y-6">
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-800 mb-1"
//               >
//                 Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 placeholder="Enter your name"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-800 mb-1"
//               >
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="subject"
//                 className="block text-sm font-medium text-gray-800 mb-1"
//               >
//                 Subject
//               </label>
//               <input
//                 id="subject"
//                 type="text"
//                 placeholder="Enter the subject"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="message"
//                 className="block text-sm font-medium text-gray-800 mb-1"
//               >
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 rows={5}
//                 placeholder="Enter your message"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
//               ></textarea>
//             </div>
//             <button
//               type="submit"
//               className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* Right: Contact Info */}
//         <div className="bg-gray-50 p-8 rounded-lg shadow-md">
//           <h3 className="text-2xl font-semibold mb-6 text-black">
//             Contact Information
//           </h3>
//           <div className="space-y-6 text-gray-800">
//             <div className="flex items-start gap-4">
//               <div className="bg-green-100 p-3 rounded-md">
//                 <MapPin className="text-green-700 w-5 h-5" />
//               </div>
//               <div>
//                 <p className="font-semibold text-black">Address</p>
//                 <p className="text-sm text-gray-600">
//                  HE-23, Super city, Singapore
//                   Township, Indore
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="bg-green-100 p-3 rounded-md">
//                 <Phone className="text-green-700 w-5 h-5" />
//               </div>
//               <div>
//                 <p className="font-semibold text-black">Phone</p>
//                 <p className="text-sm text-gray-600">+91-8435204953, 07313153523</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="bg-green-100 p-3 rounded-md">
//                 <Mail className="text-green-700 w-5 h-5" />
//               </div>
//               <div>
//                 <p className="font-semibold text-black">Email</p>
//                 <p className="text-sm text-gray-600">billistry2025@gmail.com</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }




'use client';


import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, MessageCircleMore, Twitter, Linkedin, Github } from 'lucide-react';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } else {
      toast.error(`Error: ${data.error}`);
    }
  };

  return (
    <section className="bg-[#F7FBFB] px-4 py-20 font-['Poppins'] sm:px-8 lg:px-10   ">
  {/* Page Header */}
  <div className="max-w-3xl mx-auto text-center mb-12">
    <h2 className="text-4xl sm:text-5xl font-extrabold text-[#460F58] font-['Roboto']">
      Contact Us
    </h2>
    <p className="text-gray-600 mt-4 text-lg">
      The Billistry team is here to assist you — just fill out the form, and we’ll get back to you shortly.
    </p>
  </div>

  <div className="max-w-7xl mx-auto rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden ">
    {/* Left Column - Contact Info */}
    <div className="bg-[#F7FBFB] p-10 md:p-12 flex flex-col justify-between rounded-l-3xl">
      <div>
        <h3 className="text-3xl font-bold text-[#460F58] mb-2 font-['Roboto']">Get in touch</h3>
        <p className="text-gray-600 text-sm mb-6">
          We'd love to hear from you! Reach out via form or social media.
        </p>

        <div className="space-y-6">
          {[ 
            {
              icon: <MapPin className="text-[#F7FBFB] w-5 h-5" />,
              title: "Head Office",
              description: "HE-23, Super City, Singapore Township, Indore",
            },
            {
              icon: <Mail className="text-[#F7FBFB] w-5 h-5" />,
              title: "Email Us",
              description: "support@billistry.com\nbillistry2025@gmail.com",
            },
            {
              icon: <Phone className="text-[#F7FBFB] w-5 h-5" />,
              title: "Call Us",
              description: "+91-8435204953,\n07313153523",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="bg-[#7B53A6] hover:bg-[#460F58] p-3 rounded-full flex items-center justify-center border border-[#E5E7EB] hover:border-[#7B53A6] transition">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-[#460F58] font-['Roboto']">{item.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-9">
        <p className="text-sm font-medium text-gray-600 mb-2">Follow our social media</p>
        <div className="flex gap-4">
          {[MessageCircleMore, Twitter, Linkedin, Github].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="p-2 rounded-full bg-[#7B53A6] text-[#F7FBFB] hover:bg-[#460F58] transition"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Right Column - Form */}
    <div className="bg-[#F7FBFB] p-10 md:p-12 rounded-r-3xl">
      <h3 className="text-2xl font-bold text-[#460F58] mb-8 font-['Roboto']">Send us a message</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl font-['Poppins'] placeholder-gray-400 focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl font-['Poppins'] placeholder-gray-400 focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition"
            required
          />
        </div>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl font-['Poppins'] placeholder-gray-400 focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition"
        />

        <textarea
          name="message"
          placeholder="Message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl font-['Poppins'] placeholder-gray-400 focus:ring-2 focus:ring-[#7B53A6] focus:outline-none transition"
          required
        ></textarea>

        <button
          type="submit"
          className="w-60 bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white font-['Poppins'] font-semibold py-3 rounded-xl transition transform hover:scale-105"
        >
          Send
        </button>
      </form>
    </div>
  </div>

  {/* Google Map */}
  <div className="mt-10 max-w-7xl mx-auto px-4">
  <h3 className="text-2xl font-bold text-[#460F58] mb-6 font-['Roboto']">
    Find Us on Google Maps
  </h3>
  <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-lg">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.182464807757!2d75.9055515!3d22.8079682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631db8b3c35651%3A0xd4cf38892f387052!2sSamprakshi%20Infinity%20Solution!5e0!3m2!1sen!2sin!4v1695737400000!5m2!1sen!2sin"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</div>

</section>

  );
}