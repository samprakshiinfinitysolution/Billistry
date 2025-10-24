import React from "react";
import { Skeleton } from "./skeleton";

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const cols = 7;
  return (
    <div className="w-full">
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-3 py-2">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
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
