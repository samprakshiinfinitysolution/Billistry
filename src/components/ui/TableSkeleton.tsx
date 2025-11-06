import React from "react";
import { Skeleton } from "./skeleton";

export default function TableSkeleton({ rows = 5, fillHeight = false, cols = 7 }: { rows?: number; fillHeight?: boolean; cols?: number }) {
  // When fillHeight is true we switch to a flex-based layout so the skeleton rows
  // can stretch to fill the parent's height. HTML tables do not reliably stretch
  // rows to consume available height inside an overflow container, which caused
  // the empty white area at the bottom. When fillHeight is false we keep the
  // previous table-based layout for visual parity.
  const wrapperClass = fillHeight ? 'h-full min-h-[62vh] w-full' : 'w-full';

  if (fillHeight) {
    return (
      <div className={wrapperClass}>
        {/* header skeleton (fixed height) */}
        <div className="px-3 py-2 grid grid-cols-" aria-hidden>
          <div className="flex gap-3">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="px-1 py-1">
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </div>

        {/* content area: make it fill remaining height and distribute rows evenly */}
        <div className="h-[calc(100%-44px)] overflow-hidden flex flex-col">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex-1 border-b flex items-center px-3 py-2">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // fallback: original table layout for non-fill cases
  return (
    <div className={wrapperClass}>
      <div className="overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-3 py-2">
                  {/* slightly taller header skeleton for visual parity */}
                  <Skeleton className="h-5 w-28" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b">
                {Array.from({ length: cols }).map((__, c) => (
                  <td key={c} className="px-3 py-4">
                    {/* make row skeleton bars a bit taller so they look less compressed */}
                    <Skeleton className="h-5 w-full" />
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
