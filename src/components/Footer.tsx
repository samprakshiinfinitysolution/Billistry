'use client'

import { useState } from "react"
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircleMore,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Subscribed with: ${email}`)
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

  )
}
