'use client'

<<<<<<< HEAD
import { useState } from 'react'
=======
import { useState } from "react"
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircleMore,
<<<<<<< HEAD
} from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
=======
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  const [email, setEmail] = useState("")
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Subscribed with: ${email}`)
<<<<<<< HEAD
    setEmail('')
  }

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-10 border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10 text-center md:text-left">

        {/* Branding & Socials */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Billistry</h2>
          <p className="text-sm mt-2">Smart inventory simplified for modern businesses.</p>

          {/* Social Icons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <a href="https://github.com/your-profile" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5 hover:text-black dark:hover:text-white" />
            </a>
            <a href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-blue-500" />
            </a>
            <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-5 h-5 hover:text-blue-700" />
            </a>
            <a href="https://instagram.com/your-profile" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 hover:text-pink-500" />
            </a>
            <a href="https://facebook.com/your-profile" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-5 h-5 hover:text-blue-600" />
            </a>
            <a href="https://youtube.com/your-channel" target="_blank" rel="noopener noreferrer">
              <Youtube className="w-5 h-5 hover:text-red-600" />
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <MessageCircleMore className="w-5 h-5 hover:text-green-500" />
            </a>
          </div>

          <p className="text-xs mt-4 text-gray-400">
            &copy; {new Date().getFullYear()} Inventra. All rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
            <li><a href="/products" className="hover:underline">Products</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
            <li><a href="/terms" className="hover:underline">Terms of Use</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Newsletter</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs mt-8 text-center text-gray-400 ">
        Built with ❤️ using Next.js and Tailwind CSS.
      </p>
    </footer>
=======
    setEmail("")
  }

  return (
   <footer
  className="relative text-[#390F59] py-9 font-['Poppins'] footer-animate-bg"
  style={{
    backgroundImage: "url('/images/cta-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/60"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-7 lg:px-9">
    {/* Top Section */}
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 text-center md:text-left">
      {/* Branding */}
      <div className="flex flex-col items-center md:items-center lg:items-start">
        <Image src="/images/billistry.png" alt="Logo" width={140} height={60} />
        <p className="text-xs text-gray-300 mt-3 max-w-xs font-['Poppins']">
          Smart inventory simplified for modern businesses.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-white mb-4 font-['Roboto']">Quick Links</h3>
        <ul className="space-y-2 text-sm font-['Poppins']">
          <li>
            <Link href="/privacy" className="hover:text-[#7B53A6] text-gray-300 transition">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-[#7B53A6] text-gray-300 transition">
              Terms of Use
            </Link>
          </li>
          <li>
            <Link href="/support" className="hover:text-[#7B53A6] text-gray-300 transition">
              Support
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-[#7B53A6] text-gray-300 transition">
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="font-semibold text-white mb-4 font-['Roboto']">Company</h3>
        <ul className="space-y-2 text-sm font-['Poppins']">
          <li>
            <Link href="/AboutUs" className="hover:text-[#7B53A6] text-gray-300 transition">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:text-[#7B53A6] text-gray-300 transition">
              Services
            </Link>
          </li>
          {/* <li>
            <Link href="/features" className="hover:text-[#7B53A6] text-gray-300 transition">
              Features
            </Link>
          </li> */}
          <li>
            <Link href="/pricing" className="hover:text-[#7B53A6] text-gray-300 transition">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/feedback" className="hover:text-[#7B53A6] text-gray-300 transition">
              Feedback
            </Link>
          </li>
        </ul>
      </div>

      {/* Newsletter */}
      <div>
        <h3 className="font-semibold text-white mb-4 font-['Roboto']">Newsletter</h3>
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3 font-['Poppins']">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-md border border-[#E5E7EB] bg-[#F7FBFB] text-gray-600 focus:ring-2 focus:ring-[#7B53A6] outline-none"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-white hover:bg-[#460F58] font-semibold py-2 rounded-md transition transform hover:scale-105"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="mt-10 border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between">
      {/* Social Icons */}
      <div className="flex gap-3 flex-wrap justify-center sm:justify-start mb-4 sm:mb-0">
        {[Github, Twitter, Linkedin, Instagram, Facebook, Youtube, MessageCircleMore].map(
          (Icon, idx) => (
            <a
              key={idx}
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#7B53A6] text-[#F7FBFB] hover:bg-[#460F58] transition duration-300"
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        )}
      </div>

      {/* Copyright */}
      <p className="text-gray-300 text-sm text-center sm:text-right font-['Poppins']">
        &copy; {new Date().getFullYear()} Billistry. All rights reserved.
      </p>
    </div>
  </div>
</footer>

>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
  )
}
