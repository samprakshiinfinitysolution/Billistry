// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { Menu, X, ChevronDown, LogOut, User, Phone } from 'lucide-react'

// // const user = {
// //   name: 'Lokendra',
// //   image: 'https://i.pravatar.cc/40?u=lokendra',
// // }

// // const logout = () => {
// //   window.location.href = '/'
// // }

// export default function TopHeader() {
//   const pathname = usePathname()
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [servicesOpen, setServicesOpen] = useState(false)
//   // const [profileOpen, setProfileOpen] = useState(false)

//   const profileRef = useRef<HTMLDivElement>(null)
//   const servicesRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
//         // setProfileOpen(false)
//       }
//       if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
//         setServicesOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   return (
//     <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//         {/* Logo */}
//         <Link href="/" className="text-2xl font-bold text-pink-600 flex items-center gap-2">
//           <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-3 py-1 rounded-lg shadow">
//             Billistry
//           </span>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-8 text-base font-medium">
//           <Link href="/" className={`hover:text-pink-600 ${pathname === '/' ? 'text-pink-600' : 'text-gray-700'}`}>Home</Link>
//           <Link href="/features" className={`hover:text-pink-600 ${pathname === '/features' ? 'text-pink-600' : 'text-gray-700'}`}>Features</Link>
//           <Link href="/pricing" className={`hover:text-pink-600 ${pathname === '/pricing' ? 'text-pink-600' : 'text-gray-700'}`}>Pricing</Link>

//           {/* Services Dropdown */}
//           <div className="relative" ref={servicesRef}>
//             <button onClick={() => setServicesOpen((v) => !v)} className="flex items-center gap-1 text-gray-700 hover:text-pink-600">
//               Services <ChevronDown size={16} />
//             </button>
//             {servicesOpen && (
//               <div className="absolute top-full mt-2 w-56 bg-white shadow-lg rounded-md border">
//                 <Link href="/invoice" className="block px-5 py-3 hover:bg-pink-50">E-Invoice Software</Link>
//                 <Link href="/inventory" className="block px-5 py-3 hover:bg-pink-50">Inventory Management</Link>
//               </div>
//             )}
//           </div>

//           <Link href="/contact" className={`hover:text-pink-600 ${pathname === '/contact' ? 'text-pink-600' : 'text-gray-700'}`}>Contact</Link>
//           <Link href="/trial" className="ml-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg shadow hover:from-pink-600 hover:to-fuchsia-600 font-semibold">
//             Login
//           </Link>
//         </nav>

//         {/* Mobile Menu Button */}
//         <button
//           onClick={() => setMenuOpen(!menuOpen)}
//           className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-pink-50"
//         >
//           {menuOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </div>

//       {/* Mobile Nav */}
//       {menuOpen && (
//         <div className="md:hidden px-4 pb-4 border-t">
//           <Link href="/" className="block py-3 text-gray-700 hover:text-pink-600">Home</Link>
//           <Link href="/features" className="block py-3 text-gray-700 hover:text-pink-600">Features</Link>
//           <Link href="/pricing" className="block py-3 text-gray-700 hover:text-pink-600">Pricing</Link>
//           <Link href="/invoice" className="block py-3 text-gray-700 hover:text-pink-600">E-Invoice Software</Link>
//           <Link href="/inventory" className="block py-3 text-gray-700 hover:text-pink-600">Inventory Management</Link>
//           <Link href="/contact" className="block py-3 text-gray-700 hover:text-pink-600">Contact</Link>
//           <Link href="/trial" className="block py-3 text-white bg-gradient-to-r from-pink-500 to-fuchsia-500 text-center rounded-lg shadow hover:from-pink-600 hover:to-fuchsia-600">Start Free Trial</Link>
//         </div>
//       )}
//     </header>
//   )
// }


'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import LoginSlider from './LoginSlider'; // ✅ Import

export default function TopHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // ✅ State for slider

  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-pink-600 flex items-center gap-2">
            <span className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-3 py-1 rounded-lg shadow">
              Billistry
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-base font-medium">
            <Link href="/" className={`hover:text-pink-600 ${pathname === '/' ? 'text-pink-600' : 'text-gray-700'}`}>Home</Link>
            <Link href="/features" className={`hover:text-pink-600 ${pathname === '/features' ? 'text-pink-600' : 'text-gray-700'}`}>Features</Link>
            <Link href="/pricing" className={`hover:text-pink-600 ${pathname === '/pricing' ? 'text-pink-600' : 'text-gray-700'}`}>Pricing</Link>

            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button onClick={() => setServicesOpen((v) => !v)} className="flex items-center gap-1 text-gray-700 hover:text-pink-600">
                Services <ChevronDown size={16} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full mt-2 w-56 bg-white shadow-lg rounded-md border">
                  <Link href="/invoice" className="block px-5 py-3 hover:bg-pink-50">E-Invoice Software</Link>
                  <Link href="/inventory" className="block px-5 py-3 hover:bg-pink-50">Inventory Management</Link>
                </div>
              )}
            </div>

            <Link href="/contact" className={`hover:text-pink-600 ${pathname === '/contact' ? 'text-pink-600' : 'text-gray-700'}`}>Contact</Link>

            {/* ✅ Login Button triggers slider */}
            <button
              onClick={() => setShowLogin(true)}
              className="ml-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg shadow hover:from-pink-600 hover:to-fuchsia-600 font-semibold"
            >
              Login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-pink-50"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t">
            <Link href="/" className="block py-3 text-gray-700 hover:text-pink-600">Home</Link>
            <Link href="/features" className="block py-3 text-gray-700 hover:text-pink-600">Features</Link>
            <Link href="/pricing" className="block py-3 text-gray-700 hover:text-pink-600">Pricing</Link>
            <Link href="/invoice" className="block py-3 text-gray-700 hover:text-pink-600">E-Invoice Software</Link>
            <Link href="/inventory" className="block py-3 text-gray-700 hover:text-pink-600">Inventory Management</Link>
            <Link href="/contact" className="block py-3 text-gray-700 hover:text-pink-600">Contact</Link>
            <button
              onClick={() => setShowLogin(true)}
              className="block w-full py-3 text-white text-center bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-lg shadow hover:from-pink-600 hover:to-fuchsia-600"
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
