"use client";

import { useEffect, useRef, useState } from "react";
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

type AddToastFn = (toast: Omit<ToastItem, "id">) => void;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastIdRef = useRef(0);

  const addToast: AddToastFn = (toast) => {
    const now = Date.now();
    const id = now <= lastIdRef.current ? lastIdRef.current + 1 : now;
    lastIdRef.current = id;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const toastWindow = window as Window & { addToast?: AddToastFn };
    toastWindow.addToast = addToast;

    return () => {
      delete toastWindow.addToast;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 ml-4 flex flex-col gap-3 z-50">
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
