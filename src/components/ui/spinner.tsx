'use client';

import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center justify-center">
      <Loader className={cn("h-8 w-8 animate-spin text-primary", className)} />
    </div>
  );
}
