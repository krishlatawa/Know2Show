"use client";

import React from "react";

export function ProgressBar({
  label,
  value,
  max = 100,
  showValue = true,
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[10.5px] font-mono leading-none">
          {label && (
            <span className="uppercase tracking-wider text-[#6B635B] font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-[#211A16] font-semibold">{value}</span>
          )}
        </div>
      )}
      <div className="w-full h-[3.5px] bg-[#E2DDD3] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#211A16] transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
