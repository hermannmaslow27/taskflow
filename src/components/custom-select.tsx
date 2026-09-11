"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  badgeColor?: string;
  description?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "default" | "filter";
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  label,
  size = "md",
  variant = "default",
  disabled = false,
  className = "",
  dropdownClassName = "",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1.5 text-xs rounded-lg gap-1.5"
      : "px-3 py-2 text-xs sm:text-sm rounded-xl gap-2";

  const variantClasses =
    variant === "filter"
      ? "bg-card/70 hover:bg-muted-bg border border-card-border shadow-2xs font-medium text-card-foreground"
      : "bg-card border border-card-border shadow-xs text-card-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    // Ajout de isolation-auto ou z-index pour forcer le passage au-dessus du dialog
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between transition-all select-none cursor-pointer outline-none ${sizeClasses} ${variantClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${isOpen ? "ring-2 ring-primary/30 border-primary" : ""}`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption?.badgeColor && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.badgeColor }}
            />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ml-1.5 ${isOpen ? "rotate-180 text-primary" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[160px] bg-card border border-card-border rounded-xl shadow-2xl p-1 z-[999] animate-fade-in overflow-hidden ${dropdownClassName}`}
        >
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left ${isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-card-foreground hover:bg-muted-bg"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.badgeColor && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: option.badgeColor }}
                      />
                    )}
                    {option.icon && (
                      <span className="shrink-0 text-muted">{option.icon}</span>
                    )}
                    <div className="truncate">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block text-[10px] text-muted font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}