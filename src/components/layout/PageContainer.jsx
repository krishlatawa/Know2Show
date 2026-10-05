"use client";

import React from "react";

export function PageContainer({
  children,
  size = "default", // 'default' (5xl) | 'wide' (6xl) | 'narrow' (3xl) | 'full'
  className = "",
  noPadding = false,
}) {
  const sizeClasses = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto w-full ${sizeClasses[size] || sizeClasses.default} ${
        noPadding ? "" : "px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  date,
  badge,
  action,
  className = "",
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {badge && <div>{badge}</div>}
            {title && (
              <h1 className="text-xl sm:text-2xl font-normal text-[#211A16] tracking-tight">
                {title}
              </h1>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {date && (
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#968E85] uppercase">
              {date}
            </span>
          )}
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  );
}

export default PageContainer;
