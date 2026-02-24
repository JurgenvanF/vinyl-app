"use client";

import Link from "next/link";
import { ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import "./NavItem.scss";

type NavItemProps = {
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  auth?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

export default function NavItem({
  href,
  children,
  icon,
  auth = false,
  onClick,
  compact = false,
}: NavItemProps) {
  const pathname = usePathname();
  const itemRef = useRef<HTMLDivElement>(null);
  const isActive = href && pathname === href;

  const baseClass = `
    flex items-center gap-2 text-sm px-4 ${
      compact ? "py-2" : "py-3"
    } rounded-lg border cursor-pointer transition-colors min-w-0
  `;

  const normalClass = "item border-transparent";

  const activeClass = "item__active border-transparent";

  const authClass = "item__auth border";

  const className = `
    ${baseClass}
    ${auth ? authClass : normalClass}
    ${isActive ? activeClass : ""}
  `;

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <div
      ref={itemRef}
      className={className}
      onClick={(event) => {
        if (onClick) {
          onClick();
          return;
        }

        if (event.target !== event.currentTarget) return;

        const nestedButton = itemRef.current?.querySelector("button");
        nestedButton?.click();
      }}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}
