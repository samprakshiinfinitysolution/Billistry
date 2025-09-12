'use client';

import React from 'react';

export const Pagination = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <nav className={`flex items-center justify-center ${className}`}>{children}</nav>
);

export const PaginationContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">{children}</div>
);

export const PaginationItem = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-2 ${className}`}>{children}</div>
);

export const PaginationPrevious = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
  >
    Previous
  </button>
);

export const PaginationNext = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
  >
    Next
  </button>
);
