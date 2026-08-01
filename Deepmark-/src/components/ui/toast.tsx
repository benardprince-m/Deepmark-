"use client";

import * as React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 duration-200",
        type === "success"
          ? "border-[#10B981] bg-[#111827] text-[#10B981]"
          : "border-[#EF4444] bg-[#111827] text-[#EF4444]"
      )}
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span className="text-sm text-white">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
