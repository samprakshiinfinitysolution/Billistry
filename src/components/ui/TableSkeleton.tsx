import React from "react";
import { Skeleton } from "./skeleton";

export default function TableSkeleton({ rows = 5, fillHeight = false, cols = 7 }: { rows?: number; fillHeight?: boolean; cols?: number }) {
  // When fillHeight is true, use a min-height that matches the common table scroll area
  // (used by parties page which sets max-h-[62vh] on the container). This makes the skeleton
  // visually match the eventual table height.
  const wrapperClass = fillHeight ? 'min-h-[62vh] w-full' : 'w-full';
  return (
    <div className={wrapperClass}>
      <div className="overflow-hidden h-full">
        <table className="w-full table-fixed h-full">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-3 py-2">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="h-full">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b">
                {Array.from({ length: cols }).map((__, c) => (
                  <td key={c} className="px-3 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
