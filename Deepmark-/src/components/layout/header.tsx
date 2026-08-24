"use client";

import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {action}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-[#1F2937]">
          <div className="h-8 w-8 rounded-full bg-[#22C55E]" />
          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
        </button>
      </div>
    </header>
  );
}
