"use client";

import React from 'react';
import { Skeleton } from './skeleton';

type Props = {
  compact?: boolean;
  title?: boolean;
  subtitle?: boolean;
};

export default function CardSkeleton({ compact = false, title = false, subtitle = false }: Props) {
  // If title/subtitle props present then render the dark-styled stats variant (used in dashboard stats),
  // otherwise render the generic white card skeleton used for admin cards.
  if (title || subtitle) {
    return (
      <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <div className="mb-3">{title ? <Skeleton className="h-4 w-32" /> : <div className="h-4" />}</div>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-40 mb-2" />
            {subtitle ? <Skeleton className="h-3 w-24" /> : <div className="h-3" />}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-4 h-full flex flex-col">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        <div className="mt-4 flex-1">
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
          {!compact && <div className="h-3 bg-gray-200 rounded w-2/3" />}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
