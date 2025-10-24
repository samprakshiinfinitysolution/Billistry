"use client";

import React from 'react';

export default function HeaderIcon({ children, title, onClick, ariaLabel }: { children: React.ReactNode; title?: string; onClick?: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      {children}
    </button>
  );
}
