"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LanguageToggle from "../language/LanguageToggle";
import LogoutButton from "../auth/LogOut";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";
import { Disc3, Heart, User, LogOut, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import NavItem from "./NavItem/NavItem";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

import "./TopNav.scss";

export default function TopNav() {
  const { locale, toggleLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("sidenav-open", open);

    return () => {
      document.body.classList.remove("sidenav-open");
    };
  }, [open]);

  return (
    <div className="navigation w-full shadow-md px-6 py-4 sticky top-0 z-50">
      <nav className="w-97/100 max-w-400 flex items-center justify-between mx-auto">
        {/* Logo */}
        <Link href="/collection" className="flex items-center gap-2 group">
          <Disc3
            className="title__icon flex-shrink-0 transform transition-transform duration-500 ease-in-out group-hover:rotate-180"
            size={30}
          />
          <h1 className="title__text text-2xl font-semibold">Vinyl Vault</h1>
        </Link>

        {/* Desktop Navigation (>= 900px) */}
        <div className="hidden min-[900px]:flex items-center gap-6">
          <NavItem href="/collection">{t(locale, "myCollection")}</NavItem>

          <NavItem href="/wishlist" icon={<Heart size={18} />}>
            {t(locale, "wishlist")}
          </NavItem>

          <NavItem href="/profile" icon={<User size={18} />}>
            {t(locale, "profile")}
          </NavItem>

          <NavItem auth onClick={handleLogout}>
            <LogoutButton
              className="pointer-events-none"
              icon={<LogOut size={18} />}
            />
          </NavItem>

          <NavItem auth onClick={toggleLocale} compact>
            <LanguageToggle />
          </NavItem>
        </div>

        {/* Hamburger (< 900px) */}
        <button
          className="cursor-pointer min-[900px]:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Side Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-72 navigation shadow-lg transform transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end pr-9 py-5">
            <button className="cursor-pointer" onClick={() => setOpen(false)}>
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col h-full px-6 pb-6">
            {/* Top navigation items */}
            <div className="flex flex-col gap-4">
              <NavItem href="/collection">{t(locale, "myCollection")}</NavItem>

              <NavItem href="/wishlist" icon={<Heart size={18} />}>
                {t(locale, "wishlist")}
              </NavItem>

              <NavItem href="/profile" icon={<User size={18} />}>
                {t(locale, "profile")}
              </NavItem>
            </div>

            {/* Bottom actions */}
            <div className="mt-auto flex gap-4 pt-6 pb-16 border-t">
              <div className="flex-4">
                <NavItem auth onClick={handleLogout}>
                  <LogoutButton
                    className="pointer-events-none"
                    icon={<LogOut size={18} />}
                  />
                </NavItem>
              </div>

              <div className="flex-1">
                <NavItem auth onClick={toggleLocale} compact>
                  <LanguageToggle />
                </NavItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
