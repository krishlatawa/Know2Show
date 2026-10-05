"use client";

import React from "react";

export function Card({
  children,
  variant = "base",
  className = "",
  onClick,
  ...props
}) {
  const baseStyles = "rounded-lg border transition-all duration-120";

  const variants = {
    base: "bg-[#FAF9F5] border-[#E2DDD3] shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
    white: "bg-white border-[#E2DDD3] shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
    tinted: "bg-[#EFECE4] border-[#E2DDD3]",
    interactive:
      "bg-[#FAF9F5] border-[#E2DDD3] hover:border-[#211A16] hover:bg-[#FAF8F3] cursor-pointer active:scale-[0.995]",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.base} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-[#E2DDD3]/60 flex items-center justify-between gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-sm sm:text-base font-semibold text-[#211A16] tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-xs text-[#6B635B] mt-0.5 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`p-3.5 sm:p-4 border-t border-[#E2DDD3]/60 bg-[#EFECE4]/30 rounded-b-lg flex items-center justify-between gap-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
