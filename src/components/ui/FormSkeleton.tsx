import React from 'react';
import { Skeleton } from './skeleton';

export default function FormSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-72 mb-3" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-6">
            <div className="w-40 h-32 bg-white rounded-md p-2"><Skeleton className="h-28 w-full" /></div>
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full md:col-span-2" />
            <Skeleton className="h-10 w-full md:col-span-2" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
