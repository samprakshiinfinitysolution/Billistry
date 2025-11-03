

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import LoginSlider from './LoginSlider';
import Image from 'next/image';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/AboutUs', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

interface TopHeaderProps {
  announcementHeight: number;
}

export default function TopHeader({ announcementHeight }: TopHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header 
        className="bg-[#F7FBFB] sticky z-40  border-gray-200 transition-all duration-300"
        style={{ top: announcementHeight }}
      > 
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-3 flex justify-between items-center">
          {/* ✅ Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <Image
              src="/images/billistry.png"
              alt="Billistry Logo"
              width={40}
              height={40}
              className="inline-block"
            />
            <span className="text-2xl font-bold text-[#460F58]">Billistry</span>
          </Link>

          {/* ✅ Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-base font-medium relative">
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`pb-1 transition-colors ${
                    pathname === item.href ? 'text-[#460F58]' : 'text-[#390F59] hover:text-[#7B53A6]'
                  }`}
                >
                  {item.label}
                </Link>
                {pathname === item.href && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 h-[2px] bg-[#7B53A6] rounded"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            ))}

            {/* ✅ Login Button */}
            <button
              onClick={() => setShowLogin(true)}
              className="ml-4 bg-[#7B53A6] text-[#F7FBFB] px-4 py-2 rounded-lg shadow hover:bg-[#460F58] font-semibold transition"
            >
              Login
            </button>
          </nav>

          {/* ✅ Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#390F59] p-2 rounded-lg hover:bg-[#F7FBFB]"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* ✅ Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-gray-200 bg-[#F7FBFB]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`block py-3 ${
                  pathname === item.href ? 'text-[#460F58] font-semibold' : 'text-[#390F59] hover:text-[#7B53A6]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => {
                setShowLogin(true);
                setMenuOpen(false);
              }}
              className="block w-full py-3 text-center bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] text-[#F7FBFB] rounded-lg shadow font-semibold transition"
            >
              Login
            </button>
          </div>
        )}
      </header>

      {/* ✅ Login Slider */}
      {showLogin && <LoginSlider onClose={() => setShowLogin(false)} />}
    </>
  );
}
