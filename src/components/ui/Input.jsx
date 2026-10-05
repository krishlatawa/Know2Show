"use client";

import React, { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    type = "text",
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 text-[#968E85] pointer-events-none">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-lg bg-white border border-[#D8D2C5] text-[#211A16] placeholder-[#968E85] text-sm px-3.5 py-2.5 transition-all duration-120 focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 disabled:opacity-50 disabled:bg-[#FAF9F5] disabled:cursor-not-allowed ${
            LeftIcon ? "pl-9" : ""
          } ${RightIcon ? "pr-9" : ""} ${
            error ? "border-[#9B2C2C] focus:border-[#9B2C2C] focus:ring-[#9B2C2C]/20" : ""
          } ${className}`}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3 text-[#968E85] pointer-events-none">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-mono text-[#9B2C2C]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#6B635B]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
