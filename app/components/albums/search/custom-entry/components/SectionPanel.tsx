"use client";

import type { ReactNode } from "react";

type SectionPanelProps = {
  title?: ReactNode;
  headerRight?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function SectionPanel({
  title,
  headerRight,
  description,
  className,
  children,
}: SectionPanelProps) {
  return (
    <section
      className={`rounded-xl p-4 flex flex-col gap-3 custom-entry__panel ${
        className ?? ""
      }`}
    >
      {title && !headerRight ? (
        <h4 className="font-semibold">{title}</h4>
      ) : null}

      {headerRight ? (
        <div className="flex items-center justify-between gap-3">
          {title ? <h4 className="font-semibold">{title}</h4> : <div />}
          {headerRight}
        </div>
      ) : null}

      {description ? (
        <p className="text-sm custom-entry__hint">{description}</p>
      ) : null}

      {children}
    </section>
  );
}
