"use client";

import React from "react";

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  hasDot = false,
}) {
  const baseStyles =
    "inline-flex items-center font-mono font-medium tracking-wider uppercase rounded-md border select-none transition-colors";

  const variants = {
    neutral: "bg-[#EFECE4] text-[#211A16] border-[#E2DDD3]",
    muted: "bg-transparent text-[#6B635B] border-[#E2DDD3]",
    espresso: "bg-[#211A16] text-[#F7F5F0] border-[#211A16]",
    success: "bg-[#E8F3ED] text-[#2A6A4E] border-[#C8E2D4]",
    warning: "bg-[#FAF1E4] text-[#9E651E] border-[#EBD7BE]",
    error: "bg-[#F9ECEC] text-[#9B2C2C] border-[#ECC8C8]",
  };

  const sizes = {
    xs: "text-[9px] px-1.5 py-0.5 gap-1",
    sm: "text-[10px] px-2 py-0.5 gap-1.5",
    md: "text-[11px] px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`}
    >
      {hasDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
