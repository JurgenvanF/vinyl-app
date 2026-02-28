"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

type SearchbarProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear?: () => void;
};

export default function Searchbar({
  value,
  placeholder,
  onChange,
  onClear,
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
        className="search-input rounded pl-10 pr-3 py-2 w-full border border-transparent md:pr-10"
      />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={15} />
      </span>

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
