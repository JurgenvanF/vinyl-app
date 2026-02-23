"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";
import { auth } from "../../../lib/firebase";

import { LogOut } from "lucide-react";
import { ReactNode } from "react";

type LogoutButtonProps = {
  className?: string;
  icon?: ReactNode;
};

export default function LogoutButton({ className, icon }: LogoutButtonProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
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
