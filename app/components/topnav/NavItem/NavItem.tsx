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
  badgeCount?: number;
};

export default function NavItem({
  href,
  children,
  icon,
  auth = false,
  onClick,
  compact = false,
  badgeCount,
}: NavItemProps) {
  const pathname = usePathname();
  const itemRef = useRef<HTMLDivElement>(null);
  const isActive = href && pathname === href;
  const showBadge = typeof badgeCount === "number" && badgeCount > 0;

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
        <span className="relative flex items-center gap-2 min-w-0">
          {icon}
          <span>{children}</span>
          {showBadge && <span className="nav-badge">{badgeCount}</span>}
        </span>
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
      <span className="relative flex items-center gap-2 min-w-0">
        {icon}
        <span>{children}</span>
        {showBadge && <span className="nav-badge">{badgeCount}</span>}
      </span>
    </div>
  );
}
