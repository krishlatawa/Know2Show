"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-120 select-none focus:outline-none focus:ring-2 focus:ring-[#211A16]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99] tracking-wider uppercase font-mono";

  const variants = {
    primary:
      "bg-[#211A16] hover:bg-[#352B25] text-[#F7F5F0] border border-[#211A16] shadow-sm font-semibold",
    secondary:
      "bg-[#EFECE4] hover:bg-[#E5E0D4] text-[#211A16] border border-[#E2DDD3]",
    outline:
      "bg-transparent hover:bg-[#EFECE4] text-[#211A16] border border-[#E2DDD3]",
    ghost:
      "bg-transparent hover:bg-[#EFECE4]/60 text-[#6B635B] hover:text-[#211A16] border border-transparent",
    destructive:
      "bg-[#9B2C2C] hover:bg-[#7D2323] text-white border border-[#9B2C2C]",
  };

  const sizes = {
    sm: "text-[11px] px-3.5 py-1.5 gap-1.5",
    md: "text-xs sm:text-[12.5px] px-4.5 py-2.5 gap-2",
    lg: "text-xs sm:text-[13px] px-6 py-3.5 gap-2.5 font-semibold",
    full: "text-xs sm:text-[13px] w-full py-3.5 px-5 gap-2 font-semibold",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="w-3.5 h-3.5 shrink-0 text-current" />
      ) : null}

      <span>{children}</span>

      {!isLoading && RightIcon && (
        <RightIcon className="w-3.5 h-3.5 shrink-0 text-current" />
      )}
    </button>
  );
}

export default Button;
