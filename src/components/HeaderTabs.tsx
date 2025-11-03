"use client";

import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

interface HeaderTabsProps {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export default function HeaderTabs({ items, value, onChange, className }: HeaderTabsProps) {
  return (
    <TabsList className={`flex items-center gap-2 bg-gray-100 border rounded-lg p-2 w-full ${className || ""}`}>
      {items.map((it) => (
        <TabsTrigger
          key={it.value}
          value={it.value}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm md:text-base rounded-md border border-transparent transition-all duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm data-[state=active]:font-semibold text-gray-600 hover:text-indigo-700 cursor-pointer`}
        >
          {it.icon}
          <span>{it.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
