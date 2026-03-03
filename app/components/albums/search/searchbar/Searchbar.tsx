"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { Search, X } from "lucide-react";

type SearchbarProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  rightAction?: {
    icon: ReactNode;
    onClick: () => void;
    ariaLabel: string;
    title?: string;
    active?: boolean;
  };
};

export default function Searchbar({
  value,
  placeholder,
  onChange,
  onClear,
  rightAction,
}: SearchbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`search-input rounded pl-10 py-2 w-full border border-transparent ${
          rightAction ? "pr-16 md:pr-20" : "pr-3 md:pr-10"
        }`}
      />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={15} />
      </span>

      {rightAction && (
        <button
          type="button"
          onClick={rightAction.onClick}
          className={`search-input__type absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer right-9 p-1 rounded ${
            rightAction.active
              ? "search-input__type--active text-emerald-600"
              : ""
          }`}
          aria-label={rightAction.ariaLabel}
          title={rightAction.title ?? rightAction.ariaLabel}
        >
          {rightAction.icon}
        </button>
      )}

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
            inputRef.current?.focus();
          }}
          className="search-input__clear absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
