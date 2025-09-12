import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 py-20 sm:py-28 px-4 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 opacity-30 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="200" fill="#f9a8d4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 blur-2xl pointer-events-none select-none z-0">
        <svg viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="160" fill="#a21caf" />
        </svg>
      </div>
      {/* Content */}
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 z-10">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-base font-semibold mb-4 shadow-lg backdrop-blur text-pink-700">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            Next-Gen Inventory Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-pink-600 mb-6 leading-tight drop-shadow-xl">
            Manage Inventory Smarter <br className="hidden sm:block" />
            <span className="bg-pink-100 px-2 rounded-lg text-fuchsia-700">with AI & Automation</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 font-medium">
            Modern, intuitive inventory management with real-time tracking, low stock alerts, AI-powered analytics, and seamless team collaboration. Take control and grow your business with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start flex-wrap gap-4 mb-6">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:from-pink-700 hover:to-fuchsia-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-600 hover:text-white transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              Request Demo
            </a>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 justify-center md:justify-start text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Real-time Stock
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              AI Analytics
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Multi-user Collaboration
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
              Secure Cloud
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0">
          <div className="relative w-full max-w-md">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-40 z-0" />
            <Image
              src="/images/inventory-hero.svg"
              alt="Inventory Management Illustration"
              width={480}
              height={360}
              className="mx-auto relative z-10 drop-shadow-2xl w-full h-auto"
              priority
            />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-fuchsia-200 rounded-full blur-2xl opacity-40 z-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
