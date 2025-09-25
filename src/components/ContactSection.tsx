// src/components/ContactSection.tsx
import Image from 'next/image'

export default function ContactSection() {
  return (
    <section className="relative bg-gradient-to-br from-white via-pink-50 to-fuchsia-50 py-20 px-6" id="contact">
      {/* Decorative Blob */}
      <div className="absolute -top-16 -left-16 w-60 h-60 opacity-20 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="120" fill="#f9a8d4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 192 192" fill="none">
          <circle cx="96" cy="96" r="96" fill="#a21caf" />
        </svg>
      </div>
      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
        {/* Left: Illustration */}
        <div className="hidden md:flex justify-center">
          <Image
            src="/images/contact-illustration.svg"
            alt="Contact Illustration"
            width={380}
            height={320}
            className="drop-shadow-2xl"
            priority
          />
        </div>
        {/* Right: Form */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-4 drop-shadow">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-10">
<<<<<<< HEAD
            Have questions? We&#39;d love to hear from you. Fill out the form and our team will respond promptly.
=======
            Have questions? We'd love to hear from you. Fill out the form and our team will respond promptly.
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
          </p>
          <form className="grid gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="p-4 border border-pink-200 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="p-4 border border-pink-200 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"
              required
            />
            <textarea
              rows={4}
              placeholder="Your Message"
              className="p-4 border border-pink-200 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white py-3 rounded-lg font-semibold shadow hover:from-pink-700 hover:to-fuchsia-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
