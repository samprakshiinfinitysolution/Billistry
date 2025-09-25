'use client';

import Link from 'next/link';
<<<<<<< HEAD
import Image from 'next/image';
=======
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <div className="w-full max-w-md">
<<<<<<< HEAD
        <Image
          src="/images/404.svg" // Make sure this image exists in public/images/
          alt="404 - Page Not Found"
          width={400}
          height={300}
=======
        <img
          src="/images/404.svg" // Make sure this image exists in public/images/
          alt="404 - Page Not Found"
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
          className="w-full h-auto mb-8"
        />
      </div>

      <h1 className="text-5xl font-bold text-red-600">404</h1>
      <p className="text-2xl font-semibold mt-4 text-gray-800">Oops! Page not found</p>
      <p className="text-gray-500 mt-2 max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
      >
        ⬅ Go Back Home
      </Link>
    </main>
  );
}
