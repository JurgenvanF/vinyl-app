"use client";

import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

type ToastProps = {
  message: string;
  icon: LucideIcon;
  duration?: number; // in ms
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  onClose: () => void;
};

export default function Toast({
  message,
  icon: Icon,
  duration = 3000,
  bgColor = "bg-white",
  textColor = "text-black",
  iconBgColor = "bg-gray-200",
  iconBorderColor = "border-gray-400",
  onClose,
}: ToastProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // start closing animation slightly before removal
    const closeTimer = setTimeout(() => setClosing(true), duration);
    const removeTimer = setTimeout(() => onClose(), duration + 300); // 300ms matches animation duration

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`flex items-center p-4 rounded shadow-lg space-x-3 min-w-[250px]
        ${bgColor} ${textColor} 
        ${closing ? "animate-slide-down" : "animate-slide-up"}`}
    >
      <div
        className={`p-2 rounded-full border ${iconBgColor} ${iconBorderColor} flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="flex-1">{message}</p>
    </div>
  );
}
