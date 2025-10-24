import React from 'react';
import { Skeleton } from './skeleton';

export default function SmallSkeleton({ width = 'w-24', height = 'h-4' }: { width?: string; height?: string }) {
  return <Skeleton className={`${height} ${width}`} />;
}
