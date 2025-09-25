'use client'

import { useState } from 'react'
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircleMore,
} from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Subscribed with: ${email}`)
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
  )
}
