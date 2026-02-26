// components/ToastContainer.tsx
"use client";

import { useState } from "react";
import Toast from "./Toast";
import { LucideIcon } from "lucide-react";

type ToastItem = {
  id: number;
  message: string;
  icon: LucideIcon;
  bgColor?: string; // background of box
  textColor?: string; // text + icon color
  iconBgColor?: string; // icon background
  iconBorderColor?: string; // icon border color
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Expose `addToast` globally if you want
  (window as any).addToast = addToast;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          icon={t.icon}
          bgColor={t.bgColor}
          textColor={t.textColor}
          iconBgColor={t.iconBgColor}
          iconBorderColor={t.iconBorderColor}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
