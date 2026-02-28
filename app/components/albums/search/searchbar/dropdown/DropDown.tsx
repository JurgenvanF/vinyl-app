"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import "./DropDown.scss";

export type DropDownOption = {
  value: string;
  label: string;
};

type DropDownProps = {
  options: DropDownOption[];
  value: string;
  onChange: (value: string) => void;
  align?: "left" | "right";
  collapseBreakpoint?: number;
  narrowTriggerIcon?: ReactNode;
  wrapperClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  menuMinWidthClassName?: string;
};

export default function DropDown({
  options,
  value,
  onChange,
  align = "right",
  collapseBreakpoint = 500,
  narrowTriggerIcon = <SlidersHorizontal size={20} />,
  wrapperClassName = "",
  triggerClassName = "",
  menuClassName = "",
  optionClassName = "",
  menuMinWidthClassName = "min-w-55",
}: DropDownProps) {
  const activeOption =
    options.find((option) => option.value === value) ?? options[0];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on page/container scroll
  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown-wrapper relative w-full h-full ${wrapperClassName}`}
    >
      {/* Trigger */}
      <button
        type="button"
        className={`dropdown-trigger dropdown-trigger-colors flex w-full h-full min-h-[2.5rem] items-center justify-between rounded border px-3 transition-all duration-200 gap-2 cursor-pointer ${triggerClassName}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {windowWidth > collapseBreakpoint ? (
          <span className="truncate">{activeOption?.label}</span>
        ) : (
          narrowTriggerIcon
        )}

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu */}
      <div
        className={`absolute top-[calc(100%+0.25rem)] z-40 w-max ${menuMinWidthClassName} max-w-[calc(100vw-1rem)] transition-all duration-200 ${align === "right" ? "right-0" : "left-0"} ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"} ${menuClassName}`}
      >
        <ul
          className="dropdown-menu dropdown-menu-colors w-full rounded border py-2 shadow-md max-h-60 overflow-y-auto px-2"
          role="listbox"
        >
          {options.map((option) => (
            <li key={option.value} className="mb-1 last:mb-0">
              <button
                type="button"
                className={`dropdown-option dropdown-option-colors dropdown-option-hover flex w-full items-center rounded-lg justify-between px-4 py-2 text-left transition-colors duration-150 cursor-pointer ${optionClassName}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
