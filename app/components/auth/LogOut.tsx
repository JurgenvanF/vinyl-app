"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";
import { auth } from "../../../lib/firebase";

import { LogOut, TriangleAlert } from "lucide-react";
import { ReactNode } from "react";

type LogoutButtonProps = {
  className?: string;
  icon?: ReactNode;
};

export default function LogoutButton({ className, icon }: LogoutButtonProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      const toastWindow = window as Window & {
        addToast?: (toast: {
          message: string;
          icon: typeof LogOut;
          bgColor: string;
          textColor: string;
          iconBgColor: string;
          iconBorderColor: string;
        }) => void;
      };

      if (typeof window !== "undefined") {
        toastWindow.addToast?.({
          message: t(locale, "logoutSuccess"),
          icon: LogOut,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-900",
          iconBgColor: "bg-yellow-200",
          iconBorderColor: "border-yellow-400",
        });
      }

      router.replace("/");
    } catch (error: unknown) {
      console.error(error);

      const toastWindow = window as Window & {
        addToast?: (toast: {
          message: string;
          icon: typeof TriangleAlert;
          bgColor: string;
          textColor: string;
          iconBgColor: string;
          iconBorderColor: string;
        }) => void;
      };

      if (typeof window !== "undefined") {
        toastWindow.addToast?.({
          message: t(locale, "logoutError"),
          icon: TriangleAlert,
          bgColor: "bg-red-100",
          textColor: "text-red-900",
          iconBgColor: "bg-red-200",
          iconBorderColor: "border-red-400",
        });
      }
    }
  };

  return (
    <button
      className={`flex items-center gap-2 cursor-pointer ${className ?? ""}`}
      onClick={handleLogout}
    >
      {icon ?? <LogOut size={18} />}
      {t(locale, "logout")}
    </button>
  );
}
