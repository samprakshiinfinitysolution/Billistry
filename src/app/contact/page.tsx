

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
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

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
    <section className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Contact Form */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-black">Contact Us</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1 ">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-800 mb-1">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Enter the subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Enter your message"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Right: Contact Info */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-6 text-black">
            Contact Information
          </h3>
          <div className="space-y-6 text-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-md">
                <MapPin className="text-green-700 w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-black">Address</p>
                <p className="text-sm text-gray-600">
                  HE-23, Super City, Singapore Township, Indore
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-md">
                <Phone className="text-green-700 w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-black">Phone</p>
                <p className="text-sm text-gray-600">+91-8435204953, 07313153523</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-md">
                <Mail className="text-green-700 w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-black">Email</p>
                <p className="text-sm text-gray-600">billistry2025@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
